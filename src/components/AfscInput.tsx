import { TextField } from '@mui/material';
import { SyntheticEvent } from 'react';
//Update the user afsc when mouse leaves the text field
type AfscInputProps = {
    onMouseLeave: (event: SyntheticEvent<Element, Event>, value: string) => void
}
export const AfscInput = ({ onMouseLeave }: AfscInputProps) => {
    return (
        <TextField
            sx={{ width: 185 }}
            id="afsc_textfield"
            name='afsc_textfield'
            label="AFSC"
            defaultValue=''
            onMouseLeave={() => onMouseLeave}
            variant="filled"
            size="small"
        />
    )

}