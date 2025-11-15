import React from "react";
import {Navigate} from 'react-router-dom'

const PrivateRoute = ({children}) => {
    const authToken = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    const isAuthenticated = Boolean(authToken && user);
    return isAuthenticated ? children : <Navigate to ='/login' replace />;
}
export default PrivateRoute;