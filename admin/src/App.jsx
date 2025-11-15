import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AddItems from './components/AddItems'
import List from './components/List'
import Order from './components/Order'
import Navbar from './components/Navbar'
import AdminLogin from './components/AdminLogin'
import AdminSignup from './components/AdminSignup'
import AdminVerifyEmail from './components/AdminVerifyEmail'
import AdminForgotPassword from './components/AdminForgotPassword'
import AdminPendingApproval from './components/AdminPendingApproval'
import AdminPrivateRoute from './components/AdminPrivateRoute'
import ManageSpecialOffers from './components/ManageSpecialOffers'
import UserManagement from './components/UserManagement'
import ContactQueries from './components/ContactQueries'
import Statistics from './components/Statistics'


const App = () => {
  return (
    <>
    <Routes>
      {/* Admin Authentication Routes */}
      <Route path='/admin-login' element={<AdminLogin />} />
      <Route path='/admin-signup' element={<AdminSignup />} />
      <Route path='/admin-verify-email' element={<AdminVerifyEmail />} />
      <Route path='/admin-forgot-password' element={<AdminForgotPassword />} />
      <Route path='/admin-pending-approval' element={<AdminPendingApproval />} />
      
      {/* Protected Admin Routes */}
      <Route path='/' element={
        <AdminPrivateRoute>
          <Navbar />
          <AddItems />
        </AdminPrivateRoute>
      } />
      <Route path='/list' element={
        <AdminPrivateRoute>
          <Navbar />
          <List />
        </AdminPrivateRoute>
      } />
      <Route path='/special-offers' element={
        <AdminPrivateRoute>
          <Navbar />
          <ManageSpecialOffers />
        </AdminPrivateRoute>
      } />
      <Route path='/orders' element={
        <AdminPrivateRoute>
          <Navbar />
          <Order />
        </AdminPrivateRoute>
      } />
        <Route path='/users' element={
          <AdminPrivateRoute>
            <Navbar />
            <UserManagement />
          </AdminPrivateRoute>
        } />
        <Route path='/contact-queries' element={
          <AdminPrivateRoute>
            <Navbar />
            <ContactQueries />
          </AdminPrivateRoute>
        } />
        <Route path='/statistics' element={
          <AdminPrivateRoute>
            <Navbar />
            <Statistics />
          </AdminPrivateRoute>
        } />
    </Routes>
    </>
  )
}

export default App
