const dayjs = require('dayjs');
import React, { ChangeEvent } from 'react';
import { TempestDatePicker } from './ui';

interface IConditionalDateInput {
  dateValue: Date;
  condition: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const ConditionalDateInput: React.FC<IConditionalDateInput> = ({ dateValue, condition, onChange }) => {
  if (condition) {
    return <span>{dayjs(dateValue).format('DD MMM YY')}</span>;
  } else
    return (
      <TempestDatePicker
        onChange={onChange}
        size="small"
        inputProps={{
          role: 'date-picker',
          max: dayjs().format('YYYY-MM-DD'),
        }}
        variant="outlined"
        value={dayjs(dateValue).format('YYYY-MM-DD')}
      />
    );
};

export default ConditionalDateInput;
