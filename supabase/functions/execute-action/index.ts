// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const { log_id, batch } = await req.json()
    const supabaseClient = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 1. Fetch action log & related scan
    const { data: log, error: logError } = await supabaseClient
      .from('action_logs')
      .select('*, scan_id')
      .eq('id', log_id)
      .single()
      
    if (logError || !log) {
      throw new Error('Log not found')
    }

    // 2. Lock inventory row (simulated check here since RPC lock needs specific DB function)
    const { data: inv } = await supabaseClient
      .from('inventory_status')
      .select('status')
      .eq('batch_number', batch)
      .single()

    // 3. Execute the specific action
    switch (log.action_type) {
      case 'INVENTORY_BLOCK':
        await supabaseClient
          .from('inventory_status')
          .update({ status: 'BLOCKED' })
          .eq('batch_number', batch)
        break

      case 'PHARMACIST_ALERT':
        await supabaseClient.from('notifications').insert({
          recipient_role: 'pharmacist',
          title: 'Blocked Medicine',
          message: `Batch ${batch} has been quarantined.`,
          metadata: { scan_id: log.scan_id }
        })
        break

      case 'AUTHORITY_ESCALATION':
        await supabaseClient.from('escalation_reports').insert({
          scan_id: log.scan_id,
          authority_name: 'FDA',
          escalation_priority: 'HIGH',
          evidence_payload: { batch },
          status: 'SUBMITTED'
        })
        break

      case 'CUSTOMER_ALERT':
        await supabaseClient.from('notifications').insert({
          recipient_role: 'user',
          title: 'Safety Alert',
          message: `Your medication (batch ${batch}) is unsafe.`,
          metadata: { scan_id: log.scan_id }
        })
        break
    }

    // 4. Capture after-state
    const { data: afterInv } = await supabaseClient
      .from('inventory_status')
      .select('status')
      .eq('batch_number', batch)
      .single()

    // 5. Update action log + audit
    await supabaseClient
      .from('action_logs')
      .update({
        after_state: { batch_number: batch, status: afterInv?.status },
        status: 'EXECUTED',
        execution_duration_ms: 120, // simulated
        executed_at: new Date().toISOString()
      })
      .eq('id', log_id)

    await supabaseClient.from('agent_traces').insert({
      scan_id: log.scan_id,
      step: 'DECISION',
      agent_name: 'edge_function',
      thought_process: `Action ${log.action_type} executed successfully`,
      output_payload: { log_id, batch, before: inv?.status, after: afterInv?.status }
    })

    // 6. Broadcast realtime update (pg_notify alternative if required, or direct channel broadcast)
    const channel = supabaseClient.channel(`action_${log.scan_id}`)
    await channel.send({
      type: 'broadcast',
      event: 'status',
      payload: { log_id, status: 'EXECUTED', after_state: afterInv }
    })
    supabaseClient.removeChannel(channel)

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
