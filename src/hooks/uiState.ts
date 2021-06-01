import create from 'zustand';
import { ECategories } from '../types/global';

const initialCount = {
  Archived: 0,
  Done: 0,
  Draft: 0,
  Overdue: 0,
  SignatureRequired: 0,
  Upcoming: 0,
};
interface IMemberTrackerState {
  count: {
    Archived: number;
    Done: number;
    Draft: number;
    Overdue: number;
    SignatureRequired: number;
    Upcoming: number;
  };
  resetCount: () => void;
  activeCategory: ECategories;
  setActiveCategory: (activeCategory: ECategories) => void;
  increaseCategoryCount: (category: ECategories) => void;
  decreaseCategoryCount: (category: ECategories) => void;
}

export const useMemberRecordTrackerState = create<IMemberTrackerState>((set) => ({
  count: {
    Archived: 0,
    Done: 0,
    Draft: 0,
    Overdue: 0,
    SignatureRequired: 0,
    Upcoming: 0,
  },
  resetCount: () => {
    set({ count: initialCount });
  },
  activeCategory: ECategories.ALL,
  setActiveCategory: (activeCategory: ECategories) => {
    set({ activeCategory });
  },
  increaseCategoryCount: (category: ECategories) => {
    set((state) => ({ ...state, count: { ...state.count, [category]: state.count[category] + 1 } }));
  },
  decreaseCategoryCount: (category: ECategories) => {
    set((state) => ({ ...state, count: { ...state.count, [category]: state.count[category] - 1 } }));
  },
}));
