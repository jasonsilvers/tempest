import { MenuItem, TextField } from '@mui/material';
import { SyntheticEvent } from 'react';
import { ranks } from '../const/ranks';
//Update the user Rank when rank is slected
type RankSelectProps = {
    onChange: (event: SyntheticEvent<Element, Event>, value: string) => void;
};
export const RankSelect = ({ onChange }: RankSelectProps) => {
    return (
        <div>
            <TextField
                sx={{ width: 185 }}
                id="rank_textfield"
                name="rank_textfield"
                select
                defaultValue=''
                label="Rank"
                onChange={() => onChange}
                variant="filled"
                size="small"
            >
                {ranks.map((rankOption) => (
                    <MenuItem key={rankOption.value} value={rankOption.value}>
                        {rankOption.value}
                    </MenuItem>
                ))}
            </TextField>
        </div>
    );
};
