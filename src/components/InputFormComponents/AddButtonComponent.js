import React from 'react';
import Button from 'react-bootstrap/Button';

export default function AddButtonComponent({ onAddCourse }) {
  return (
    <Button variant='success' onClick={onAddCourse}>
      Add
    </Button>
  );
}