const dayjs = require('dayjs');
import React from 'react';
import { TempestDatePicker } from './ui';
import tw from 'twin.macro';
interface IConditionalDateInput {
  dateValue: Date;
  condition: boolean;
  onChange: (inputDate: Date) => void;
}

const CompletedDate = tw.div`pt-1`;

const ConditionalDateInput: React.FC<IConditionalDateInput> = ({ dateValue, condition, onChange }) => {
  if (condition) {
    return <CompletedDate>{dayjs(dateValue).format('DD MMM YY')}</CompletedDate>;
  } else
    return (
      <TempestDatePicker
        onChange={onChange}
        format="DD MMM YYYY"
        inputVariant="outlined"
        disableFuture
        autoOk
        value={dateValue ? dayjs(dateValue).format('DD MMM YYYY') : null}
      />
    );
};

export default ConditionalDateInput;
