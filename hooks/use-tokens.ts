import { create, type StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type TokensStore = {
  tokens: string[];
  setTokens: (tokens: string[]) => void;
};

type MyStateCreatorPersist = StateCreator<
  TokensStore,
  [],
  [['zustand/persist', TokensStore]]
>;
type MyStateCreator = StateCreator<TokensStore, []>;

const tokensStore: MyStateCreator = (set, get) => ({
  tokens: [],
  setTokens: (tokens: string[]) => set({ tokens: tokens }),
});

const tokensStorePersist: MyStateCreatorPersist = persist(tokensStore, {
  name: 'tokens',
  storage: createJSONStorage(() => localStorage),
});

export const useTokens = create(tokensStore);
