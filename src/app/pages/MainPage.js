import { useLocation } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import NotFound from "./NotFound";
import Page from "./screens/Page";
import { useAxios } from "../contexts/AxiosContext";
import Dashboard from "./screens/Dashboard";
import Profile from "./screens/Profile";
import { useUser } from "@clerk/clerk-react";
import Users from "./screens/Users";
import Leagues from "./screens/Leagues";
import NFL from "./screens/games/NFL";
import BetHistory from "./screens/BetHistory";
import ManageGames from "./screens/settings/ManageGames";

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

  useEffect(() => {
    if(isLoggedIn && apiToken){
      axiosService.get('/api/me_user').then((response) => {
        // login(response.data.token);
        setCurrentUser(response.data.user);
      }).catch((error) => {
        // logout();
      });
    }
  }, [apiToken, isLoggedIn])

  const refreshCurrentUser = () => {
    axiosService.get('/api/me_user').then((response) => {
      setCurrentUser(response.data.user);
    }).catch((error) => {
      // logout();
    });
  }

  const renderPage = () => {
    const modules = currentUser && currentUser.modules.map((e) => e.page);
    if(modules && modules.includes(currentPage)){
      // console.log(modules);
    } else {
      <NotFound/>
    }

    switch (currentPage) {
      case 'dashboard': 
        return <Dashboard/>
      case 'games/nfl': 
        return <NFL refreshCurrentUser={refreshCurrentUser}/>
      case 'users': 
        return <Users/>
      case 'leagues':
        return <Leagues currentUser={currentUser} refreshCurrentUser={refreshCurrentUser}/>
      case 'bet-history':
        return <BetHistory currentUser={currentUser} refreshCurrentUser={refreshCurrentUser}/>
      case 'settings/game-management':
        return <ManageGames currentUser={currentUser}/>
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