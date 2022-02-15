const dayjs = require('dayjs');
import React from 'react';
import { TempestDatePicker } from './ui';
import tw from 'twin.macro';
interface IConditionalDateInput {
  dateValue: Date;
  condition: boolean;
  onChange: (inputDate: Date) => void;
}

const CompletedDate = tw.div`pt-1 w-32 text-gray-400`;

const ConditionalDateInput: React.FC<IConditionalDateInput> = ({ dateValue, condition, onChange }) => {
  if (condition) {
    return <CompletedDate>{dayjs(dateValue).format('MMM D, YYYY')}</CompletedDate>;
  } else
    return (
      <TempestDatePicker
        onChange={onChange}
        inputVariant="outlined"
        disableFuture
        autoOk
        value={dateValue ? dayjs(dateValue).format('MMM DD, YYYY') : null}
      />
    );
};

export default ConditionalDateInput;
