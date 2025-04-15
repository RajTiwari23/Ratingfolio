import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

import { HomePage, AboutPage, AuthPage, ProfilePage, UserPage, ProfileSearchPage } from './pages';
import { Login, Register, ChangePassword, VerifyOtp } from './components/auth';
import { UserProfile, UpdateProfile } from './components/user';

const Router = function () {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route element={<AuthPage />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
          </Route>
          <Route path="/profiles" element={<ProfileSearchPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route element={<UserPage />}>
            <Route path="/user/profile" element={<UserProfile />} />
            <Route path="/user/update-profile" element={<UpdateProfile />} />
          </Route>
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router />
  </StrictMode>
);
