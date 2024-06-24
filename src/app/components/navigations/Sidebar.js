import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoIosLogOut } from "react-icons/io";
import { AiOutlineDashboard } from "react-icons/ai";
import { AuthContext } from "../../contexts/AuthContext";
import { FaFootballBall, FaUser } from 'react-icons/fa';

const Sidebar = ({ onToggleSidebar, callback = null, currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = new URLSearchParams(location.search).get("page") || "";
  const { logout } = useContext(AuthContext);

  const modules = [
    {label: 'Dashboard', page: 'dashboard', icon: <AiOutlineDashboard /> },
    {label: 'NFL', page: 'nfl', icon: <FaFootballBall /> },
    // {label: 'Profile', page: 'profile', icon: <FaUser/> },
  ];

  const [collapsed, setCollapsed] = useState(false);

  const navigateToPage = (page) => {
    navigate(`/main?page=${page}`);
    if(callback) {
      callback();
    }
  };

  const toggleSidebar = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    onToggleSidebar(newCollapsedState); 
  };

  return (
    <div id="Sidebar">
      <ul className="py-2">
        {modules.map((e, index) => (
          <li
            key={index}
            onClick={() => navigateToPage(e.page)}
            className={`${currentPage === e.page ? 'bg-background text-white rounded-lg' : ''}
                m-2 py-2 px-4 cursor-pointer flex gap-2 items-center text-sm
            `}
          >
            {e.icon} {collapsed ? null : e.label}
          </li>
        ))}
        {/* <li
          onClick={() => logout()}
          className={`
            m-2 py-2 px-4 cursor-pointer flex gap-2 items-center text-sm
            hover:bg-background hover:text-white rounded-lg`}
        >
          <IoIosLogOut />{collapsed ? null : 'Logout'}
        </li> */}
        {/* <li
          className='p-4 cursor-pointer flex gap-2 items-center text-sm
            border-t border-[rgba(255,255,255,0.1)] border-solid'
          onClick={toggleSidebar}
        >
          {collapsed? <i className="pi pi-caret-right text-sm" /> : <i className="pi pi-caret-left text-sm" />}
        </li> */}
      </ul>
    </div>
  );
};

export default Sidebar;
