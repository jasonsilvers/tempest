import { createContext, useContext } from 'react';
import { ECategories } from '../../../../const/enums';

interface IMemberTrackerContextState {
  activeCategory: ECategories;
  categories: ECategories[];
  setActiveCategory: (activeCategory: ECategories) => void;
}

export const MemberItemTrackerContext = createContext<IMemberTrackerContextState>(null);

export const useMemberItemTrackerContext = () => useContext(MemberItemTrackerContext);
