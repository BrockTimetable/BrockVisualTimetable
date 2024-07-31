import React from 'react'
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

export default function temporaryButtonComponent() {

    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/generator');
    };

  return (
    <Button variant="contained" onClick={handleClick}>Generator Page</Button>
  )
}
