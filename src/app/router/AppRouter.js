import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignUp from "../pages/auth/Signup";
import LogIn from "../pages/auth/Login";
import MainPage from "../pages/MainPage";
import NotFound from "../pages/NotFound";
import ClerkLogin from "../pages/auth/ClerkLogin";
import Logout from "../pages/auth/Logout";
import ClerkSignup from "../pages/auth/ClerkSignUp";
import HowItWorks from "../pages/screens/HowItWorks";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login-2" element={<LogIn />} />
        <Route path="/signup-2" element={<SignUp />} />
        <Route path="/" element={<ClerkLogin />} />
        <Route path="/login" element={<ClerkLogin />} />
        <Route path="/signup" element={<ClerkSignup />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/main" element={<MainPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
