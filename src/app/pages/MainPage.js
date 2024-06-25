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

const MainPage = () => {
  const axiosService = useAxios();  
  const location = useLocation();
  const currentPage = new URLSearchParams(location.search).get("page") || "dashboard";
  const { logout, isLoggedIn, apiToken} = useContext(AuthContext);

  const [currentUser, setCurrentUser] = useState();
  const { isSignedIn, user, isLoaded } = useUser();

  useEffect(() => {
    if(isSignedIn && isLoaded){
      console.log('user::', user);
      const newUser = {
        name: user.fullName,
        first_name: user.firstName,
        last_name: user.lastName,
        id: user.id,
        avatar: user.imageUrl,
        username: user.username,
        email: user.primaryEmailAddress.emailAddress
      }
      axiosService.get('/api/user-details', newUser).then((response) => {
        // if(response.data.status){
        //   setCurrentUser(response.data.user);
        // } else {
        //   logout();
        // }
        console.log(response.data);
      }).catch((error) => {
        // logout();
      });
    }
  }, [isSignedIn, isLoaded])

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': 
        return <Dashboard/>
      case 'nfl': 
        return <NFL/>
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