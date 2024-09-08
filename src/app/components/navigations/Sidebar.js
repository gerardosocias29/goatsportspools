import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineDashboard } from "react-icons/ai";
import { FaFootballBall, FaRunning, FaTrophy, FaUsers, FaCogs, FaRegQuestionCircle, FaQuestionCircle, FaHistory } from 'react-icons/fa';
import { FaCircleDollarToSlot } from "react-icons/fa6";
import { TbPlayFootball } from "react-icons/tb";
import { GiAmericanFootballHelmet, GiPodiumWinner } from "react-icons/gi";
import { PiUsersFour } from "react-icons/pi";
import { Button } from "primereact/button";
import { useAxios } from "../../contexts/AxiosContext";
import LeagueJoin from "../modals/LeagueJoin";

const Sidebar = ({ currentUser, callback }) => {
  const navigate = useNavigate();
  const axiosService = useAxios();
  const location = useLocation();
  const currentPage = new URLSearchParams(location.search).get("page") || "";
  const [expandedItem, setExpandedItem] = useState(null); // State to track expanded item

  const changeIcon = (icon_name) => {
    switch(icon_name) {
      case 'icon-dashboard': return <AiOutlineDashboard />;
      case 'icon-nfl': return <GiAmericanFootballHelmet />;
      case 'icon-games': return <FaFootballBall />;
      case 'icon-users': return <FaUsers />;
      case 'icon-leagues': return <FaTrophy />;
      case 'icon-running': return <FaRunning />;
      case 'icon-bet-history': return <FaCircleDollarToSlot />;
      case 'icon-settings': return <FaCogs />;
      case 'icon-game-management': return <TbPlayFootball />;
      case 'icon-league-standings': return <GiPodiumWinner />;
      case 'icon-teams': return <PiUsersFour />;
      case 'icon-hiw': return <FaQuestionCircle />;
      case 'icon-history': return <FaHistory />
      default: return null;
    }
  };

  const navigateToPage = (page) => {
    navigate(`/main?page=${page}`);
    if(callback){
      callback();
    }
  };

  const toggleExpand = (index) => {
    setExpandedItem(expandedItem === index ? null : index);
  };

  const [leagueJoinModalVisible, setModalLeagueJoinVisible] = useState(false);
  const [leagueJoinData, setLeagueJoinData] = useState();
  const onJoinHide = () => {
    setModalLeagueJoinVisible(false);
  }

  const handleSuccess = () => {
    if(currentUser && currentUser.role_id != 1){
      window.location.reload();
    }
  }

  const getDefaultLeague = () => {
    axiosService.get('/api/leagues/default').then((response) => {
      setLeagueJoinData({
        id: response.data.league_id,
        name: response.data.name
      });
    }).catch((error) => {
      console.log(error);
    });
  }

  const [joinedLeagues, setJoinedLeagues] = useState();
  const getJoinedLeagues = () => {
    axiosService.get('/api/leagues/joined').then((response) => {
      if (response.data.status) {
        setJoinedLeagues(response.data.leagues_joined);
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  useEffect(() => {
    getJoinedLeagues();
    getDefaultLeague();
  }, [currentUser]);

  return (
    <div id="Sidebar" className="h-full relative flex flex-col justify-between">
      <ul className="py-2">
        {currentUser && currentUser.modules.map((e, index) => (
          e.sub_modules.length < 1 ? 
            <li
              key={index}
              onClick={() => navigateToPage(e.page)}
              className={`${currentPage === e.page ? 'bg-background text-white' : ''}
                  m-2 py-2 px-4 cursor-pointer flex gap-2 items-center hover:border-background hover:border transition rounded-lg
              `}
            >
              {changeIcon(e.icon)} {e.name}
            </li>
          : <li
            key={index}
            className={`m-2 cursor-pointer flex flex-col gap-2 items-center`}
            >
              <div 
                className="flex items-center justify-between w-full hover:border-background hover:border rounded-lg py-2 px-4"
                onClick={() => toggleExpand(index)}
              >
                <span className="flex items-center gap-2">{changeIcon(e.icon)} {e.name}</span>
                <i className={`pi pi-angle-up transition ${expandedItem === index ? 'rotate-180' : ''}`} />
                
              </div>
              {(expandedItem === index || e.sub_modules.filter((e) => e.page === currentPage).length > 0) && (
                <ul className="w-full">
                  {e.sub_modules.map((sub, i) => (
                    <li key={i} onClick={() => navigateToPage(sub.page)}
                      className={`${currentPage === sub.page ? 'bg-background text-white' : ''}
                        m-2 py-2 px-4 cursor-pointer flex gap-2 items-center ml-6 border-l hover:border-background rounded-lg hover:border transition
                      `}
                    >
                      {changeIcon(sub.icon)} {sub.name}
                    </li>
                  ))}
                </ul>
              )}
            </li>
        ))}
      </ul>

      <div className="flex flex-col gap-4 px-5">
        {
          joinedLeagues && joinedLeagues.length < 1 && <Button onClick={() => setModalLeagueJoinVisible(true)} className="rounded-lg ring-0 border-none bg-primaryS" label="Join League"/>
        }
        
        <div className="flex items-center justify-center gap-3 p-4">
          <p className="text-sm font-bold text-primary cursor-pointer" onClick={() => navigateToPage('contactus')}>Contact Us</p>
          <p>|</p>
          <p className="text-sm font-bold text-primary cursor-pointer" onClick={() => navigateToPage('faq')}>FAQ</p>
        </div>
        
      </div>

      <LeagueJoin visible={leagueJoinModalVisible} onHide={onJoinHide} currentUser={currentUser} data={leagueJoinData} onSuccess={handleSuccess} />
    </div>
  );
};

export default Sidebar;