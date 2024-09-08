import { useLocation } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import NotFound from "./NotFound";
import { useAxios } from "../contexts/AxiosContext";
import Dashboard from "./screens/Dashboard";
import { useUser } from "@clerk/clerk-react";
import Users from "./screens/Users";
import Leagues from "./screens/Leagues";
import NFL from "./screens/games/NFL";
import BetHistory from "./screens/BetHistory";
import ManageGames from "./screens/settings/ManageGames";
import LeagueStandings from "./screens/LeagueStandings";
import Teams from "./screens/settings/Teams";
import HowItWorks from "./screens/HowItWorks";
import FAQ from "./FAQ";
import ContactUs from "./screens/ContactUs";
import OpenBets from "./screens/OpenBets";
import Cookies from 'js-cookie';
import GameHistory from "./screens/games/GameHistory";

const MainPage = () => {
  const axiosService = useAxios();  
  const location = useLocation();
  const currentPage = new URLSearchParams(location.search).get("page") || "games/nfl";
  const { isLoggedIn, login, apiToken} = useContext(AuthContext);

  const [currentUser, setCurrentUser] = useState();
  const { isSignedIn, isLoaded, isLoggedIn: isLoggedInFromUser } = useUser();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if(isSignedIn && isLoaded && !isLoggedIn){
      setIsLoading(true);
      // console.log("cookies::::", Cookies.get('__session'))
      axiosService.get('/api/user-details', {token: Cookies.get('__session')}).then((response) => {
        login(response.data.token);
        setIsLoading(false);
      }).catch((error) => {
        // logout();
        setIsLoading(false);
        // window.location.reload();
      });
    }
  }, [isLoggedInFromUser, isLoaded])

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
        return <NFL currentUser={currentUser} refreshCurrentUser={refreshCurrentUser}/>
      case 'games/history': 
        return <GameHistory currentUser={currentUser}/>
      case 'users': 
        return <Users/>
      case 'leagues':
        return <Leagues currentUser={currentUser} refreshCurrentUser={refreshCurrentUser}/>
      case 'league-standings':
        return <LeagueStandings currentUser={currentUser}/>
      case 'bet-history':
        return <BetHistory currentUser={currentUser} refreshCurrentUser={refreshCurrentUser}/>
      case 'open-bets':
        return <OpenBets currentUser={currentUser} refreshCurrentUser={refreshCurrentUser}/>
      case 'settings/game-management':
        return <ManageGames currentUser={currentUser}/>
      case 'settings/teams':
        return <Teams currentUser={currentUser}/>
      case 'how-it-works':
        return <HowItWorks currentUser={currentUser}/>
      case 'contactus':
        return <ContactUs currentUser={currentUser}/>
      case 'faq':
        return <FAQ currentUser={currentUser}/>
      default:
        return (
          <NotFound/>
        );
    }
  };

  return(
    <Layout children={isLoggedIn && apiToken ? renderPage() : null} currentUser={currentUser} />
  )
}

export default MainPage;