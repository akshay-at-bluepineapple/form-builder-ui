// routes/AppRoutes.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FormListing from '../components/FormListing';
import FormBuilderViewEdit from '../components/FormBuilderViewEdit';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<FormListing />} />
      <Route path="/forms/new" element={<FormBuilderViewEdit />} />
      <Route path="/forms/:id/edit" element={<FormBuilderViewEdit />} />
    </Routes>
  );
}

export default AppRoutes;
