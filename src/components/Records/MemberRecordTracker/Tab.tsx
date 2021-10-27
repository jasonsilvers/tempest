import tw from 'twin.macro';
import { ECategories } from '../../../const/enums';
import setDomRole from '../../../utils/setDomRole';
import { useMemberItemTrackerContext } from './providers/useMemberItemTrackerContext';

// Tab navigation animations
const underline = "content[''] absolute height[2px] bg-purple-500 w-full left-0 bottom-0";
const InactiveTab = tw.div`text-black font-size[18px] relative transition-transform select-none cursor-pointer 
after:(content[''] absolute w-0 height[2px] left-0 bottom-0 bg-purple-500 transition[ease-in] transition-all) 
hover:after:(content[''] absolute height[2px] bg-purple-500 w-full left-0 bottom-0)`;

const ActiveTab = tw(InactiveTab)`text-purple-500 transition-transform after:(${underline})`;

// tab container
const Container = tw.div`relative flex items-center w-min min-w-min whitespace-nowrap flex[0 0 auto]`;
export interface ITabProps {
  category: ECategories;
}

const Tab: React.FC<ITabProps> = ({ children, category }) => {
  const { setActiveCategory, activeCategory } = useMemberItemTrackerContext();
  return (
    <Container>
      {activeCategory === category ? (
        <ActiveTab role={setDomRole(children as string, 'Tab')}>{children}</ActiveTab>
      ) : (
        <InactiveTab
          role={setDomRole(children as string, 'Tab')}
          onClick={() => setActiveCategory(category)}
          id={children.toString()}
        >
          {children}
        </InactiveTab>
      )}
    </Container>
  );
};

export default Tab;
