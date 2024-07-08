import { type SUPPORTED_LANGS } from '@/types';
import { create, type StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type CodeStore = {
  code: Record<string, string> | null;
  setCode: (code: Record<string, string>) => void;
  setLanguageCode: (language: SUPPORTED_LANGS, code: string) => void;
};

type MyStateCreatorPersist = StateCreator<
  CodeStore,
  [],
  [['zustand/persist', CodeStore]]
>;
type MyStateCreator = StateCreator<CodeStore, []>;

const codeStore: MyStateCreator = (set, get) => ({
  code: null,
  setCode: (code: Record<string, string>) => set({ code: code }),
  setLanguageCode: (language: SUPPORTED_LANGS, code: string) =>
    set((state) => ({
      code: {
        ...state.code,
        [language]: code,
      },
    })),
});

export const codeStorePersist: MyStateCreatorPersist = persist(codeStore, {
  name: 'codeTemplate',
  storage: createJSONStorage(() => localStorage),
});

export const useCode = create(codeStorePersist);
// export const usePreviewDurationDetails = create(durationDetailsStore);
