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
import AdminBidding from "./screens/Bidding/AdminBidding";
import Pusher from "pusher-js";
import ManageBidding from "./screens/Bidding/ManageBidding";

const MainPage = () => {
  const axiosService = useAxios();  
  const location = useLocation();
  const currentPage = new URLSearchParams(location.search).get("page") || "games/nfl";
  const { isLoggedIn, login, apiToken} = useContext(AuthContext);

  const [currentUser, setCurrentUser] = useState();
  const { isSignedIn, isLoaded, isLoggedIn: isLoggedInFromUser } = useUser();

  const [isLoading, setIsLoading] = useState(false);
  
  const [pusher, setPusher] = useState(null);
  const [channel, setChannel] = useState(null);

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
      setIsLoading(true);
      axiosService.get('/api/me_user').then((response) => {
        // login(response.data.token);
        setCurrentUser(response.data.user);
        setIsLoading(false);

        const pusherInstance = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
          cluster: process.env.REACT_APP_PUSHER_CLUSTER,
        });
  
        const biddingChannel = pusherInstance.subscribe("bidding-channel");
        setPusher(pusherInstance);
        setChannel(biddingChannel);

      }).catch((error) => {
        // logout();
      });
    }

    return () => {
      if (pusher) {
        pusher.unsubscribe("bidding-channel");
      }
    };
  }, [apiToken, isLoggedIn])

  const refreshCurrentUser = () => {
    axiosService.get('/api/me_user').then((response) => {
      setCurrentUser(response.data.user);
    }).catch((error) => {
      // logout();
    });
  }

  const renderPage = () => {
    const defaultPages = ['faq', 'contactus']; // Define default pages
    const modules = currentUser && currentUser.modules.map((e) => {
      let pages = [e.page];
      if (e.sub_modules && e.sub_modules.length > 0) {
        const subModulePages = e.sub_modules.map((sub) => sub.page);
        pages = pages.concat(subModulePages);
      }
      return pages;  // Return an array of pages for this module
    }).flat();  // Flatten the resulting array
    const allPages = modules ? [...modules, ...defaultPages] : defaultPages;
    if (allPages.includes(currentPage)) {
      // console.log(allPages, currentPage);
    } else {
      return isLoading ? null : <NotFound/>;
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
      case 'ncaa-basketball-auction': 
        return <AdminBidding pusher={pusher} channel={channel}/>
      case 'settings/manage-bidding': 
        return <ManageBidding />
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