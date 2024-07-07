import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineDashboard } from "react-icons/ai";
import { FaFootballBall, FaRunning, FaTrophy, FaUsers } from 'react-icons/fa';
import { FaCircleDollarToSlot } from "react-icons/fa6";

const Sidebar = ({ currentUser, callback }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = new URLSearchParams(location.search).get("page") || "";
  const [expandedItem, setExpandedItem] = useState(null); // State to track expanded item

  const changeIcon = (icon_name) => {
    switch(icon_name) {
      case 'icon-dashboard': return <AiOutlineDashboard />;
      case 'icon-nfl': return <FaFootballBall />;
      case 'icon-users': return <FaUsers />;
      case 'icon-leagues': return <FaTrophy />;
      case 'icon-running': return <FaRunning />;
      case 'icon-bet-history': return <FaCircleDollarToSlot />;
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

  return (
    <div id="Sidebar">
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
              {expandedItem === index && (
                <ul className="w-full">
                  {e.sub_modules.map((sub, i) => (
                    <li key={i} onClick={() => navigateToPage(sub.page)}
                      className={`${currentPage === sub.page ? 'bg-background text-white' : ''}
                        py-2 px-4 cursor-pointer flex gap-2 items-center ml-6 border-l hover:border-background rounded-lg hover:border transition
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
    </div>
  );
};

export default Sidebar;