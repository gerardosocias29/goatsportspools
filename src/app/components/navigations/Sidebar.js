import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineDashboard } from "react-icons/ai";
import { FaFootballBall, FaUsers } from 'react-icons/fa';

const Sidebar = ({ onToggleSidebar, callback = null, currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = new URLSearchParams(location.search).get("page") || "";

  const modules = [
    {label: 'Dashboard', page: 'dashboard', icon: <AiOutlineDashboard /> },
    {label: 'NFL', page: 'nfl', icon: <FaFootballBall /> },
    {label: 'Users', page: 'users', icon: <FaUsers /> },
  ];

  const navigateToPage = (page) => {
    navigate(`/main?page=${page}`);
    if(callback) {
      callback();
    }
  };

  return (
    <div id="Sidebar">
      <ul className="py-2">
        {modules.map((e, index) => (
          <li
            key={index}
            onClick={() => navigateToPage(e.page)}
            className={`${currentPage === e.page ? 'bg-background text-white rounded-lg' : ''}
                m-2 py-2 px-4 cursor-pointer flex gap-2 items-center
            `}
          >
            {e.icon} {e.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
