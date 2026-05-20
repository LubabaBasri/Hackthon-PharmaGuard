-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Define Enums
create type risk_level_enum as enum ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
create type action_status_enum as enum ('PENDING', 'SIMULATING', 'EXECUTED', 'FAILED');
create type action_type_enum as enum ('INVENTORY_BLOCK', 'PHARMACIST_ALERT', 'AUTHORITY_ESCALATION', 'PUBLIC_WARNING');
create type trace_step_enum as enum ('OCR', 'CLASSIFICATION', 'VERIFICATION', 'THREAT_MODELING', 'DECISION');

-- 1. Profiles Table (Extends Supabase Auth)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text not null,
    full_name text,
    role text default 'user' check (role in ('user', 'pharmacist', 'inspector', 'admin')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Medicine Scans Table
create table public.medicine_scans (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete set null,
    image_url text not null,
    raw_ocr_text text,
    scanned_at timestamp with time zone default timezone('utc'::text, now()) not null,
    gps_latitude numeric,
    gps_longitude numeric,
    device_info jsonb
);

-- 3. Medicine Analysis Table
create table public.medicine_analysis (
    id uuid default uuid_generate_v4() primary key,
    scan_id uuid references public.medicine_scans(id) on delete cascade not null,
    extracted_name text,
    extracted_manufacturer text,
    extracted_batch_number text,
    extracted_expiry_date date,
    is_packaging_valid boolean default true,
    is_expiry_valid boolean default true,
    mismatch_details text[],
    analyzed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Risk Assessments Table
create table public.risk_assessments (
    id uuid default uuid_generate_v4() primary key,
    scan_id uuid references public.medicine_scans(id) on delete cascade not null,
    overall_score numeric(5,2) check (overall_score >= 0.00 and overall_score <= 100.00) not null,
    risk_level risk_level_enum not null,
    confidence_score numeric(5,2) check (confidence_score >= 0.00 and confidence_score <= 100.00) not null,
    threat_matrix jsonb not null, -- {"packaging": 85, "expiry": 20, "manufacturer": 90}
    reasoning_summary text not null,
    assessed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Action Logs (For Simulations)
create table public.action_logs (
    id uuid default uuid_generate_v4() primary key,
    scan_id uuid references public.medicine_scans(id) on delete cascade not null,
    action_type action_type_enum not null,
    status action_status_enum default 'PENDING' not null,
    parameters jsonb default '{}'::jsonb not null, -- target batch, pharmacy id, etc.
    before_state jsonb, -- State Snapshot before simulation execution
    after_state jsonb,  -- State Snapshot after simulation execution
    execution_duration_ms integer,
    executed_at timestamp with time zone,
    failure_reason text
);

-- 6. Inventory Status (For Blocking simulation)
create table public.inventory_status (
    id uuid default uuid_generate_v4() primary key,
    pharmacy_name text not null,
    medicine_name text not null,
    batch_number text not null,
    stock_quantity integer not null,
    status text default 'ACTIVE' check (status in ('ACTIVE', 'BLOCKED', 'QUARANTINED', 'RECALLED')),
    last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Notifications
create table public.notifications (
    id uuid default uuid_generate_v4() primary key,
    recipient_role text not null check (recipient_role in ('user', 'pharmacist', 'inspector', 'admin')),
    title text not null,
    message text not null,
    read boolean default false not null,
    metadata jsonb default '{}'::jsonb, -- dynamic actions payload
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Agent Traces (Reasoning Logs)
create table public.agent_traces (
    id uuid default uuid_generate_v4() primary key,
    scan_id uuid references public.medicine_scans(id) on delete cascade not null,
    step trace_step_enum not null,
    agent_name text not null,
    input_payload jsonb,
    thought_process text not null,
    output_payload jsonb,
    elapsed_time_ms integer,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Escalation Reports (Authority Escalation)
create table public.escalation_reports (
    id uuid default uuid_generate_v4() primary key,
    scan_id uuid references public.medicine_scans(id) on delete cascade not null,
    authority_name text not null, -- e.g., "FDA", "National Health Authority"
    escalation_priority text default 'MEDIUM' check (escalation_priority in ('LOW', 'MEDIUM', 'HIGH', 'IMMEDIATE')),
    evidence_payload jsonb not null, -- Packaged metadata and image URLs
    status text default 'SUBMITTED' check (status in ('SUBMITTED', 'UNDER_INVESTIGATION', 'RESOLVED')),
    escalated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.medicine_scans enable row level security;
alter table public.medicine_analysis enable row level security;
alter table public.risk_assessments enable row level security;
alter table public.action_logs enable row level security;
alter table public.inventory_status enable row level security;
alter table public.notifications enable row level security;
alter table public.agent_traces enable row level security;
alter table public.escalation_reports enable row level security;

-- Profiles Policies
create policy "Allow public read of profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Medicine Scans Policies
create policy "Users can insert their own scans" on public.medicine_scans for insert with check (auth.uid() = user_id);
create policy "Users can view their own scans" on public.medicine_scans for select using (auth.uid() = user_id or exists (
  select 1 from public.profiles where id = auth.uid() and role in ('inspector', 'admin')
));

-- Action Logs / Assessments Read Policies (Internal Dashboard access)
create policy "Allow authenticated reads on Risk Assessments" on public.risk_assessments for select using (auth.role() = 'authenticated');
create policy "Allow authenticated reads on Action Logs" on public.action_logs for select using (auth.role() = 'authenticated');

-- Trigger Function to sync auth metadata to Profiles table
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'Anonymous Agent'),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Bind Trigger to Auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger to run action execution simulation
create or replace function public.simulate_action_execution()
returns trigger as $$
declare
  current_inventory_status text;
  batch_id text;
begin
  if new.status = 'PENDING' then
    -- Update status to simulating
    update public.action_logs set status = 'SIMULATING' where id = new.id;
    
    -- Extract batch configuration parameter
    batch_id := new.parameters->>'batch_number';
    
    -- Capture Before State
    select status into current_inventory_status 
    from public.inventory_status 
    where batch_number = batch_id limit 1;
    
    update public.action_logs 
    set before_state = jsonb_build_object('batch_number', batch_id, 'status', coalesce(current_inventory_status, 'UNKNOWN')) 
    where id = new.id;
    
    -- Simulate Execution Delay & State mutation
    if new.action_type = 'INVENTORY_BLOCK' then
       update public.inventory_status set status = 'BLOCKED' where batch_number = batch_id;
    end if;
    
    -- Capture After State & Set Executed status
    update public.action_logs 
    set status = 'EXECUTED', 
        after_state = jsonb_build_object('batch_number', batch_id, 'status', 'BLOCKED'), 
        executed_at = now() 
    where id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger tr_simulate_action_execution
  after insert on public.action_logs
  for each row execute procedure public.simulate_action_execution();

-- Fast index lookup for scans per user
create index idx_scans_user_id on public.medicine_scans (user_id);

-- Speed up analysis joins by scan_id
create index idx_analysis_scan_id on public.medicine_analysis (scan_id);

-- Index for searching specific inventory batches
create index idx_inventory_batch on public.inventory_status (batch_number);

-- Real-time order sorting optimize
create index idx_traces_created_at on public.agent_traces (created_at desc);
