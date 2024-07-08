import { create, type StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type STATUS = 'NONE' | 'LOADING' | 'SUBMISSION' | 'COMPILE';

type OutputBoxStore = {
  status: STATUS;
  setStatus: (status: STATUS) => void;
};

type MyStateCreatorPersist = StateCreator<
  OutputBoxStore,
  [],
  [['zustand/persist', OutputBoxStore]]
>;
type MyStateCreator = StateCreator<OutputBoxStore, []>;

const outputBoxStore: MyStateCreator = (set, get) => ({
  status: 'NONE',
  setStatus: (status: STATUS) => set({ status }),
});

const outputBoxStorePersist: MyStateCreatorPersist = persist(outputBoxStore, {
  name: 'ouputBox',
  storage: createJSONStorage(() => localStorage),
});

export const useOutputBox = create(outputBoxStore);
