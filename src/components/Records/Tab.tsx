import tw from 'twin.macro';

// Tab navigation animations
const underline =
  "content[''] absolute height[2px] bg-purple-500 w-full left-0 bottom-0";
const InactiveTab = tw.div`text-black font-size[18px] relative transition-transform 
after:(content[''] absolute w-0 height[2px] left-0 bottom-0 bg-purple-500 transition[ease-in] transition-all) 
hover:after:(content[''] absolute height[2px] bg-purple-500 w-full left-0 bottom-0)`;

const ActiveTab = tw(
  InactiveTab
)`text-purple-500 transition-transform after:(${underline})`;

// tab container
const Container = tw.div`relative flex items-center`;

// counter styled component
const Count = tw.div`text-black font-size[12px] background-color[#E2E2E2] border-radius[5px] px-1 ml-2 height[min-content] flex items-center justify-center`;

const Tab: React.FC<{
  onClick: (e: React.MouseEvent) => void;
  activeCategory: string;
  count?: number;
}> = ({ onClick, children, activeCategory, count }) => {
  return (
    <Container>
      {activeCategory === children.toString() ? (
        <ActiveTab>{children}</ActiveTab>
      ) : (
        <InactiveTab onClick={onClick} id={children.toString()}>
          {children}
        </InactiveTab>
      )}

      {count ? <Count>{count}</Count> : null}
    </Container>
  );
};

export default Tab;
