import React from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

export default function SortCheckbox({ checked, onChange }) {
    return (
        <FormControlLabel
            control={<Checkbox checked={checked} onChange={onChange} />}
            label="Sort by Waiting Time"
        />
    );
}
