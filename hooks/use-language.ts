import { LANGUAGE_MAPPING } from '@/common/language';
import { type SUPPORTED_LANGS } from '@/types';
import { create, type StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type LanguageStore = {
  language: SUPPORTED_LANGS;
  setLanguage: (language: SUPPORTED_LANGS) => void;
};

type MyStateCreatorPersist = StateCreator<
  LanguageStore,
  [],
  [['zustand/persist', LanguageStore]]
>;
type MyStateCreator = StateCreator<LanguageStore, []>;

const codeStore: MyStateCreator = (set, get) => ({
  language: Object.keys(LANGUAGE_MAPPING)[0] as SUPPORTED_LANGS,
  setLanguage: (language: SUPPORTED_LANGS) => set({ language }),
});

export const langStorePersist: MyStateCreatorPersist = persist(codeStore, {
  name: 'language',
  storage: createJSONStorage(() => localStorage),
});

export const useLanguage = create(langStorePersist);
// export const usePreviewDurationDetails = create(durationDetailsStore);
