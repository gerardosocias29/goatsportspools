import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignUp from "../pages/auth/Signup";
import LogIn from "../pages/auth/Login";
import MainPage from "../pages/MainPage";
import NotFound from "../pages/NotFound";
import ClerkLogin from "../pages/auth/ClerkLogin";
import Logout from "../pages/auth/Logout";
import ClerkSignup from "../pages/auth/ClerkSignUp";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<LogIn />} /> */}
        {/* <Route path="/login" element={<LogIn />} /> */}
        <Route path="/" element={<ClerkLogin />} />
        <Route path="/login" element={<ClerkLogin />} />
        <Route path="/signup" element={<ClerkSignup />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/main" element={<MainPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
