import { useLocation } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import NotFound from "./NotFound";
import Page from "./screens/Page";

const MainPage = () => {
  const location = useLocation();
  const currentPage = new URLSearchParams(location.search).get("page") || "dashboard";
  const { logout, isLoggedIn, apiToken} = useContext(AuthContext);

  useEffect(() => {
    if (!isLoggedIn && !apiToken) {
      logout();
    }
  }, [isLoggedIn, apiToken, logout]); 

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': 
        return <Page/>
      default:
        return (
          <NotFound/>
        );
    }
  };

  return(
    <Layout children={renderPage()} />
  )
}

export default MainPage;