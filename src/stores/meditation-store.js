import { create } from 'zustand';

export const useMeditationStore = create((set) => ({
  worry: '',
  currentScale: 'earth',
  isMeditating: false,
  setWorry: (worry) => set({ worry }),
  setScale: (scale) => set({ currentScale: scale }),
  startMeditation: () => set({ isMeditating: true }),
  reset: () => set({ worry: '', currentScale: 'earth', isMeditating: false }),
}));