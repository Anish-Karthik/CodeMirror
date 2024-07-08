// use the same format as in use - activeTab, just change variable names, I have just changed names

// const [activeTab, setActiveTab] = useState("problem")
import { create, type StateCreator } from 'zustand';

export type ActiveTabType = 'problem' | 'submissions';
type CodeStore = {
  activeTab: ActiveTabType;
  setActiveTab: (activeTab: ActiveTabType) => void;
};

type MyStateCreator = StateCreator<CodeStore, []>;

const activeTabStore: MyStateCreator = (set) => ({
  activeTab: 'problem',
  setActiveTab: (activeTab: ActiveTabType) => set({ activeTab: activeTab }),
});

export const useActiveTabSubmission = create(activeTabStore);
