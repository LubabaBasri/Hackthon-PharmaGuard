import { useEffect } from 'react';
import { supabase } from './supabaseConfig';
import { useScanStore } from '../store/useScanStore';

export const useActionRealtime = (scanId: string | null) => {
  const updateActiveScan = useScanStore(state => state.updateActiveScan);

  useEffect(() => {
    if (!scanId || !supabase) return;

    const channel = supabase
      .channel(`action_${scanId}`)
      .on('broadcast', { event: 'status' }, (payload) => {
        const { log_id, status, after_state } = payload.payload;
        
        // Fetch current active scan to append to timeline
        const currentData = useScanStore.getState().activeScanData;
        if (!currentData || !currentData.simulation) return;

        updateActiveScan({
          simulation: {
            ...currentData.simulation,
            executionTimeline: [
              ...currentData.simulation.executionTimeline,
              {
                timestamp: new Date().toISOString(),
                agentName: 'Realtime Listener',
                message: `Action execution ${status}`,
                systemLog: `after_state: ${JSON.stringify(after_state)}`
              }
            ]
          }
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scanId, updateActiveScan]);
};
