import { FormControl, Select, MenuItem, SelectChangeEvent } from '@mui/material';

export const RecurrenceSelect = ({
  value,
  handleChange,
}: {
  value: string;
  handleChange: (event: SelectChangeEvent) => void;
}) => {
  return (
    <FormControl fullWidth>
      <Select labelId="demo-simple-select-label" id="demo-simple-select" value={value} onChange={handleChange}>
        <MenuItem value={365}>Annual</MenuItem>
        <MenuItem value={180}>Bi-Annual</MenuItem>
        <MenuItem value={90}>Quarterly</MenuItem>
        <MenuItem value={30}>Monthly</MenuItem>
        <MenuItem value={7}>Weekly</MenuItem>
        <MenuItem value={0}>One-Time</MenuItem>
      </Select>
    </FormControl>
  );
};
