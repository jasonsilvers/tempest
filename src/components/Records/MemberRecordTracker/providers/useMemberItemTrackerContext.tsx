import { createContext, useContext } from 'react';
import { ECategorie, EMtrVariant } from '../../../../const/enums';

interface IMemberTrackerContextState {
  activeCategory: ECategorie;
  categories: ECategorie[];
  variant: EMtrVariant;
  setActiveCategory: (activeCategory: ECategorie) => void;
}

export const MemberItemTrackerContext = createContext<IMemberTrackerContextState>(null);

export const useMemberItemTrackerContext = () => useContext(MemberItemTrackerContext);
