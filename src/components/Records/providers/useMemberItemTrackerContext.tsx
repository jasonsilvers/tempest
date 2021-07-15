import { createContext, useContext } from 'react';
import { ECategories } from '../../../types/global';

interface IMemberTrackerContextState {
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
  categories: ECategories[];
  setActiveCategory: (activeCategory: ECategories) => void;
  increaseCategoryCount: (category: ECategories) => void;
  decreaseCategoryCount: (category: ECategories) => void;
}

export const MemberItemTrackerContext = createContext<IMemberTrackerContextState>(null);

export const useMemberItemTrackerContext = () => useContext(MemberItemTrackerContext);
