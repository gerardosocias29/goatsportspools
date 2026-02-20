import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import V2App from "../../v2/V2App";
import V3App from "../../v3/V3App";
import V4App from "../../v4/V4App";

// ============================================
// V1 ROUTES ARCHIVED - Now using V2 as default
// V3 is available at /v3/* path
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
        {/* V4 - OKRNG redesign with TailAdmin template (accessible at /v4/*) */}
        <Route path="/v4/*" element={<V4App />} />

        {/* V3 - New template with landing page style (accessible at /v3/*) */}
        <Route path="/v3/*" element={<V3App />} />

        {/* V2 is the default root - all other routes handled by V2App */}
        <Route path="/*" element={<V2App />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
