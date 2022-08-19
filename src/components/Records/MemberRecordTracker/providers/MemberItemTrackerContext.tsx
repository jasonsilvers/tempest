import { useState } from 'react';
import { ECategorie, EMtrVariant } from '../../../../const/enums';
import { MemberItemTrackerContext } from './useMemberItemTrackerContext';

export const MemberItemTrackerContextProvider: React.FC<{
  categories: ECategorie[];
  children?: React.ReactNode;
  variant: EMtrVariant;
}> = ({ children, categories, variant }) => {
  const [activeCategory, setActiveCategory] = useState(ECategorie.ALL);

  return (
    <MemberItemTrackerContext.Provider
      value={{
        activeCategory,
        setActiveCategory,
        categories,
        variant,
      }}
    >
      {children}
    </MemberItemTrackerContext.Provider>
  );
};
