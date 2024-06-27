import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineDashboard } from "react-icons/ai";
import { FaFootballBall, FaTrophy, FaUsers } from 'react-icons/fa';

const Sidebar = ({ currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = new URLSearchParams(location.search).get("page") || "";

  const changeIcon = (icon_name) => {
    switch(icon_name) {
      case 'icon-dashboard': return <AiOutlineDashboard />;
      case 'icon-nfl': return <FaFootballBall />;
      case 'icon-users': return <FaUsers />;
      case 'icon-leagues': return <FaTrophy />;

    }
  }

  const navigateToPage = (page) => {
    navigate(`/main?page=${page}`);
  };

  return (
    <div id="Sidebar">
      <ul className="py-2">
        {currentUser && currentUser.modules.map((e, index) => (
          <li
            key={index}
            onClick={() => navigateToPage(e.page)}
            className={`${currentPage === e.page ? 'bg-background text-white rounded-lg' : ''}
                m-2 py-2 px-4 cursor-pointer flex gap-2 items-center
            `}
          >
            {changeIcon(e.icon)} {e.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
