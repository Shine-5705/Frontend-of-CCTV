import { create } from 'zustand';

const useIncidentStore = create((set) => ({
  incidents: [],
  addIncident: (incident) => 
    set((state) => ({ 
      incidents: [...state.incidents, { ...incident, id: Date.now() }] 
    })),
  clearIncidents: () => set({ incidents: [] }),
}));

export default useIncidentStore;