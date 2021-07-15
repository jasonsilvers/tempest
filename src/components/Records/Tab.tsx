import tw from 'twin.macro';
import { ECategories } from '../../types/global';
import setDomRole from '../../utils/SetDomRole';
import { useMemberItemTrackerContext } from './providers/useMemberItemTrackerContext';

// Tab navigation animations
const underline = "content[''] absolute height[2px] bg-purple-500 w-full left-0 bottom-0";
const InactiveTab = tw.div`text-black font-size[18px] relative transition-transform select-none cursor-pointer 
after:(content[''] absolute w-0 height[2px] left-0 bottom-0 bg-purple-500 transition[ease-in] transition-all) 
hover:after:(content[''] absolute height[2px] bg-purple-500 w-full left-0 bottom-0)`;

const ActiveTab = tw(InactiveTab)`text-purple-500 transition-transform after:(${underline})`;

// tab container
const Container = tw.div`relative flex items-center w-min min-w-min whitespace-nowrap flex[0 0 auto]`;

// counter styled component
const Count = tw.div`text-black font-size[12px] background-color[#E2E2E2] border-radius[5px] px-1 ml-2 height[min-content] flex items-center justify-center`;

export interface ITabProps {
  category: ECategories;
  showCount?: boolean;
}

const Tab: React.FC<ITabProps> = ({ children, category, showCount }) => {
  const { count, setActiveCategory, activeCategory } = useMemberItemTrackerContext();
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

      {showCount ? <Count>{count[activeCategory]}</Count> : null}
    </Container>
  );
};

export default Tab;
