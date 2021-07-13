import dayjs from 'dayjs';
import ConditionalDateInput from '../lib/ConditionalDateInput';

const Test = () => {
  return (
    <main>
      <ConditionalDateInput condition={false} dateValue={dayjs().toDate()} />
    </main>
  );
};

export default Test;
