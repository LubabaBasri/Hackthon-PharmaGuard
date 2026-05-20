import { useEffect } from 'react';
import { supabase } from '../api/supabaseConfig';
import { useScanStore } from '../store/useScanStore';
import { ScanDocument } from '../store/useScanStore';

export const useDashboardState = (scanId: string | null) => {
  const updateActiveScan = useScanStore(state => state.updateActiveScan);

  useEffect(() => {
    if (!scanId || !supabase) return;

    const channel = supabase
      .channel(`dashboard_${scanId}`)
      .on('broadcast', { event: 'state_change' }, (payload) => {
        const { newState } = payload.payload as { newState: ScanDocument['status'] };
        updateActiveScan({ status: newState });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scanId, updateActiveScan]);
};
