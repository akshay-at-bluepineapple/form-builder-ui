// routes/AppRoutes.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FormBuilder from '../components/FormBuilder';
import FormListing from '../components/FormListing';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<FormListing />} />
      <Route path="/forms/new" element={<FormBuilder />} />
      <Route path="/forms/:id/edit" element={<FormBuilder />} />
    </Routes>
  );
}

export default AppRoutes;
