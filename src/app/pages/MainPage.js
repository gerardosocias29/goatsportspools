import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { useContext, useEffect, useRef, useState } from "react";
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
import SquaresPool from "../components/pool-ui/SquaresPool";
import OpenBets from "./screens/OpenBets";
import Cookies from 'js-cookie';
import GameHistory from "./screens/games/GameHistory";
import AdminBidding from "./screens/Bidding/AdminBidding";
import Pusher from "pusher-js";
import ManageAuction from "./screens/Bidding/ManageAuction";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useToast } from "../contexts/ToastContext";
import NCAABasketballAuction from "./screens/Bidding/NCAABasketballAuction";
import UserAuction from "./screens/Bidding/UserAuction";

const MainPage = () => {
  const navigate = useNavigate();
  const axiosService = useAxios();  
  const location = useLocation();
  const currentPage = new URLSearchParams(location.search).get("page") || "games/nfl";
  const { isLoggedIn, login, apiToken} = useContext(AuthContext);
  const showToast = useToast();

  const toastBC = useRef(null);

  const [currentUser, setCurrentUser] = useState();
  const { isSignedIn, isLoaded, isLoggedIn: isLoggedInFromUser } = useUser();

  const [isLoading, setIsLoading] = useState(false);

  const [pusher, setPusher] = useState();
  const [channel, setChannel] = useState();

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

  const updateQueryParam = (key, value) => {
    const location = window.location;
    const searchParams = new URLSearchParams(location.search);
  
    // Update or add the parameter
    searchParams.set(key, value);
  
    // Replace state without navigation
    window.history.replaceState(null, "", `${location.pathname}?${searchParams.toString()}`);
  };

  useEffect(() => {
    if (isLoggedIn && apiToken) {
      setIsLoading(true);
      axiosService.get('/api/me_user')
        .then((response) => {
          setCurrentUser(response.data.user);
          setIsLoading(false);
  
          if (!pusher) {
            const pusherInstance = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
              cluster: process.env.REACT_APP_PUSHER_CLUSTER,
            });
  
            const biddingChannel = pusherInstance.subscribe("bidding-channel");
            
            setPusher(pusherInstance);
            setChannel(biddingChannel);
  
            return () => {
              pusherInstance.unsubscribe("bidding-channel");
              pusherInstance.disconnect();
            };
          }
        })
        .catch(() => {});
    }
  }, [apiToken, isLoggedIn]);

  const auctionStartedHandler = (data) => {
    console.log("active-auction-event", data)
    if (currentUser?.role_id !== 3) {
      if(data.data.status == "live"){
        navigate(`/main?page=settings/manage-auction&auction_id=${data.data.id}`);
      } else {
        navigate(`/main?page=settings/manage-auction`);
      }
      
    }
  };

  useEffect(() => {
    if (channel) {
      channel.bind("active-auction-event-" + currentUser.id, auctionStartedHandler);
    }

    return () => {
      if (channel) {
        channel.unbind("active-auction-event-" + currentUser.id);
      }
    };
  }, [channel]);

  const refreshCurrentUser = () => {
    axiosService.get('/api/me_user').then((response) => {
      setCurrentUser(response.data.user);
    }).catch((error) => {
      // logout();
    });
  }

  const renderPage = () => {
    const defaultPages = ['faq', 'contactus', 'squares']; // Define default pages
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
      case 'squares':
        return <SquaresPool currentUser={currentUser} refreshCurrentUser={refreshCurrentUser}/>
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
        const p = new URLSearchParams(location.search);
        if(p.get("auction_id")){
          return <UserAuction channel={channel} auctionId={p.get("auction_id")} currentUser={currentUser}/>
        }
        return <NCAABasketballAuction pusher={pusher} channel={channel}/>
      case 'settings/manage-auction': 
        const params = new URLSearchParams(location.search);
        if(params.get("auction_id")){
          return <AdminBidding pusher={pusher} channel={channel} auctionId={params.get("auction_id")} currentUser={currentUser}/>
        }
        return <ManageAuction pusher={pusher} channel={channel} currentUser={currentUser} />
      default:
        return (
          <NotFound/>
        );
    }
  };

  return(
    <>
      <Layout children={isLoggedIn && apiToken ? renderPage() : null} currentUser={currentUser} />
    </>
  )
}

export default MainPage;