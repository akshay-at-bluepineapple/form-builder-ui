import React from 'react';
import FormListing from '../components/FormListing';
import FormBuilderViewEdit from '../components/FormBuilderViewEdit';
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    index: true,
    Component: FormListing,
  },
  {
    path: '/forms/new',
    Component: FormBuilderViewEdit,
  },
  {
    path: '/forms/:id/edit',
    Component: FormBuilderViewEdit,
  },
]);

export default router;
