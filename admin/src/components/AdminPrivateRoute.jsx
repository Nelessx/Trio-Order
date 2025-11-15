import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminPrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const admin = localStorage.getItem('admin');
  
  const isAuthenticated = Boolean(token && admin);
  
  return isAuthenticated ? children : <Navigate to="/admin-login" replace />;
};

export default AdminPrivateRoute;
