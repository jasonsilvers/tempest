import dayjs from 'dayjs';
import React from 'react';
import { TempestDatePicker, TextField } from './ui';

interface IConditionalDateInput {
  dateValue: Date;
  condition: boolean;
}

const ConditionalDateInput: React.FC<IConditionalDateInput> = ({ dateValue, condition }) => {
  if (condition) {
    return <>{dayjs(dateValue).format('DD MMM YY')}</>;
  } else return <TempestDatePicker size="small" variant="outlined" value={dayjs(dateValue).format('YYYY-MM-DD')} />;
};

export default ConditionalDateInput;
