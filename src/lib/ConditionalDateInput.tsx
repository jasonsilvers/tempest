const dayjs = require('dayjs');
import React from 'react';
import { TempestDatePicker } from './ui';

interface IConditionalDateInput {
  dateValue: Date;
  condition: boolean;
  onChange: (inputDate: Date) => void;
}

const ConditionalDateInput: React.FC<IConditionalDateInput> = ({ dateValue, condition, onChange }) => {
  if (condition) {
    return <span>{dayjs(dateValue).format('DD MMM YY')}</span>;
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
