import { useState } from 'react';
import { ECategories } from '../../../../types/global';
import { MemberItemTrackerContext } from './useMemberItemTrackerContext';

export const MemberItemTrackerContextProvider: React.FC<{ categories: ECategories[] }> = ({ children, categories }) => {
  const [count, setCount] = useState({
    Archived: 0,
    Done: 0,
    Draft: 0,
    Overdue: 0,
    SignatureRequired: 0,
    Upcoming: 0,
  });
  const [activeCategory, setActiveCategory] = useState(ECategories.ALL);
  const resetCount = () =>
    setCount({
      Archived: 0,
      Done: 0,
      Draft: 0,
      Overdue: 0,
      SignatureRequired: 0,
      Upcoming: 0,
    });
  const increaseCategoryCount = (category: ECategories) =>
    setCount((state) => ({ ...state, [category]: state[category] + 1 }));
  const decreaseCategoryCount = (category: ECategories) =>
    setCount((state) => ({ ...state, [category]: state[category] - 1 }));
  return (
    <MemberItemTrackerContext.Provider
      value={{
        count,
        activeCategory,
        setActiveCategory,
        categories,
        resetCount,
        increaseCategoryCount,
        decreaseCategoryCount,
      }}
    >
      {children}
    </MemberItemTrackerContext.Provider>
  );
};
