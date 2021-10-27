import { useState } from 'react';
import { ECategories } from '../../../../const/enums';
import { MemberItemTrackerContext } from './useMemberItemTrackerContext';

export const MemberItemTrackerContextProvider: React.FC<{ categories: ECategories[] }> = ({ children, categories }) => {
  const [activeCategory, setActiveCategory] = useState(ECategories.ALL);

  return (
    <MemberItemTrackerContext.Provider
      value={{
        activeCategory,
        setActiveCategory,
        categories,
      }}
    >
      {children}
    </MemberItemTrackerContext.Provider>
  );
};
