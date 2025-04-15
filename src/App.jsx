//import React from 'react';
//import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.scss';
import Dashboard from './Components/Dashboard/Dashboard';
import AdminDashboard from './Components/Dashboard/AdminDashboard';
import AdditinalDashboard from './Components/Dashboard/AdditionalDashboard';
import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import Profile from "./Components/Profile/Profile";
import EditProfile from "./Components/EditProfile/EditProfile";
import UserList from "./Components/UserList/UserList";
import SubscriptionPlans from "./Components/SubscriptionPlans";
import SubscriptionAdmin  from "./Components/SubscriptionAdmin";
import EditSubscription from "./Components/EditSubscription";
import PaymentPage from "./Components/PaymentPage";
import SupportPage from "./Components/SupportPage";
//import ViewSubscription  from "./Components/ViewSubscription";
import NotificationsPage from "./Components/NotificationsPage";
import SetPasswordPage from './Components/SetPasswordPage';
import ResetPassword from './Components/ResetPassword';
import ChangePassword from './Components/ChangePassword';
import Accueil from "./Components/Accueil.jsx";
import ReportPage from "./Components/ReportPage.jsx";


import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/users" element={<UserList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/edit-profile/:id" element={<EditProfile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard-user" element={<Dashboard />} />
        <Route path="/dashboard-admin" element={<AdminDashboard />} />
        <Route path="/dashboard-additional-user" element={<AdditinalDashboard />} />
        <Route path="/subscription-plans" element={<SubscriptionPlans />} />
        <Route path="/subscription-admin" element={<SubscriptionAdmin />} />
        <Route path="/edit-subscription" element={<EditSubscription />} />
        <Route path="/payment/:idplan" element={<PaymentPage />} />
        <Route path="/NotificationsPage" element={<NotificationsPage />} />
        <Route path="/SupportPage" element={<SupportPage />} />
        <Route path="/set-password/:token" element={<SetPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/change-password/:token" element={<ChangePassword />} />
        <Route path="/Accueil" element={<Accueil />} />
        <Route path="/report" element={<ReportPage />} />
        

        <Route path="/profile" element={<Profile />} />
        {/* Route de fallback pour gérer les erreurs 404 */}
        <Route path="*" element={<h2>404 - Page non trouvée</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
