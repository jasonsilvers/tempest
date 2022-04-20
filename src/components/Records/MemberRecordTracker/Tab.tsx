import tw from 'twin.macro';
import { ECategories } from '../../../const/enums';
import { Chip } from '@mui/material';
import setDomRole from '../../../utils/setDomRole';
import { useMemberItemTrackerContext } from './providers/useMemberItemTrackerContext';

// tab container
const Container = tw.div`flex items-center whitespace-nowrap pb-5`;
export interface ITabProps {
  category: ECategories;
}

const Tab: React.FC<ITabProps> = ({ children, category }) => {
  const { setActiveCategory, activeCategory } = useMemberItemTrackerContext();
  return (
    <Container>
      {activeCategory === category ? (
        <Chip color="secondary" role={setDomRole(children as string, 'Tab')} label={children} clickable />
      ) : (
        <Chip
          onClick={() => setActiveCategory(category)}
          variant="outlined"
          color="secondary"
          role={setDomRole(children as string, 'Tab')}
          label={children}
          id={children.toString()}
          clickable
        />
      )}
    </Container>
  );
};

export default Tab;
