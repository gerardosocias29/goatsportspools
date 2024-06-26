import { useLocation } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import NotFound from "./NotFound";
import Page from "./screens/Page";
import { useAxios } from "../contexts/AxiosContext";
import Dashboard from "./screens/Dashboard";
import Profile from "./screens/Profile";
import NFL from "./screens/NFL";
import { useUser } from "@clerk/clerk-react";
import Users from "./screens/Users";

const MainPage = () => {
  const axiosService = useAxios();  
  const location = useLocation();
  const currentPage = new URLSearchParams(location.search).get("page") || "dashboard";
  const { isLoggedIn, login, apiToken} = useContext(AuthContext);

  const [currentUser, setCurrentUser] = useState();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if(isSignedIn && isLoaded && !isLoggedIn){
      axiosService.get('/api/user-details').then((response) => {
        login(response.data.token);
      }).catch((error) => {
        // logout();
      });
    }
  }, [isSignedIn, isLoaded, isLoggedIn, axiosService, login])

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': 
        return <Dashboard/>
      case 'nfl': 
        return <NFL/>
      case 'users': 
        return <Users/>
      default:
        return (
          <NotFound/>
        );
    }
  };

  return(
    <Layout children={renderPage()} currentUser={currentUser} />
  )
}

export default MainPage;