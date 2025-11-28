import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import V2App from "../../v2/V2App";

// ============================================
// V1 ROUTES ARCHIVED - Now using V2 as root
// ============================================
// The following v1 imports and routes have been archived:
// - SignUp, LogIn (../pages/auth/Signup, Login)
// - MainPage, NotFound (../pages/MainPage, NotFound)
// - ClerkLogin, ClerkSignup (../pages/auth/ClerkLogin, ClerkSignUp)
// - HowItWorks, FAQ, ContactUs (../pages/screens/*)
// - SquaresPoolPage (../pages/screens/SquaresPoolPage)
// - Logout (../pages/auth/Logout)
//
// If you need to restore v1 routes, uncomment the imports above
// and the archived routes section below.
// ============================================

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* V2 is now the root - all routes handled by V2App */}
        <Route path="/*" element={<V2App />} />

        {/* Redirect old v2 paths to root (for backwards compatibility) */}
        <Route path="/v2/*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
