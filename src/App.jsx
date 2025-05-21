//import React from 'react';
//import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.scss';
import Dashboard from './Components/Dashboard/Dashboard';
import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import Profile from "./Components/Profile/Profile";
import SubscriptionPlans from "./Components/Subscription/SubscriptionPlans.jsx";
import OverviewPage from './Components/Overview/OverviewPage.jsx'; 
import SubscriptionAdmin  from "./Components/SubscriptionAdmin";
import SupportPage from "./Components/SupportPage";
import NotificationsPage from "./Components/NotificationsPage";
import SetPasswordPage from './Components/SetPasswordPage';
import ResetPassword from './Components/ResetPassword';
import ChangePassword from './Components/ChangePassword';
import ManageMember from "./Components/ManageMember/ManageMember.jsx";
import SuccessPage from './Components/Subscription/SuccessPage.jsx';
import CancelledPage from './Components/Subscription/CancelledPage.jsx';
import UserList from "./Components/UserList/UserList";
import AdminDashboard from './Components/Dashboard/AdminDashboard';
import SeetingsPage from './Components/Seetings/SeetingsPage';
import LoginAdmin from './Components/LoginAdmin/LoginAdmin';
import Page from './Components/page';
import MagicTemplate from './Components/MagicTemplate';

import 'bootstrap/dist/css/bootstrap.min.css';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/manage-member" element={<ManageMember />} />
        <Route path="/subscription-plans" element={<SubscriptionPlans />} />
        <Route path="/subscription-admin" element={<SubscriptionAdmin />} />
        <Route path="/NotificationsPage" element={<NotificationsPage />} />
        <Route path="/SupportPage" element={<SupportPage />} />
        <Route path="/set-password/:token" element={<SetPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/change-password/:token" element={<ChangePassword />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancell" element={<CancelledPage />} />
        <Route path="/users" element={<UserList/>}/>
        <Route path="/loginAdmin" element={<LoginAdmin />} />
        <Route path="/dashboard-admin" element={<AdminDashboard/>}/>
        <Route path="/settings" element={<SeetingsPage/>}/>
        <Route path="/" element={<Page/>}/>
        <Route path="/magic-template" element={<MagicTemplate />} />

        <Route path="/profile" element={<Profile />} />
        {/* Route de fallback pour gérer les erreurs 404 */}
        <Route path="*" element={<h2>404 - Page non trouvée</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
