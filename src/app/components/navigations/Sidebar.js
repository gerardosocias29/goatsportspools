import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoIosLogOut } from "react-icons/io";
import { AiOutlineDashboard } from "react-icons/ai";
import { AuthContext } from "../../contexts/AuthContext";

const Sidebar = ({ onToggleSidebar, callback = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = new URLSearchParams(location.search).get("page") || "";
  const { logout } = useContext(AuthContext);

  const modules = [
    {label: 'Dashboard', page: 'dashboard', icon: <AiOutlineDashboard /> },
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
      <ul>
        {modules.map((e, index) => (
          <li
            key={index}
            onClick={() => navigateToPage(e.page)}
            className={`${currentPage === e.page ? 'bg-BrandGreen border-BrandGreen border-l-2' : ''}
                p-4 cursor-pointer flex gap-2 items-center text-sm
                hover:border-l-2 hover:border-BrandGreen hover:bg-BrandGreen hover:bg-opacity-20`}
          >
            {e.icon} {collapsed ? null : e.label}
          </li>
        ))}
        <li
          onClick={() => logout()}
          className={`
            p-4 cursor-pointer flex gap-2 items-center text-sm
            hover:border-l-2 hover:border-BrandGreen hover:bg-BrandGreen hover:bg-opacity-20`}
        >
          <IoIosLogOut />{collapsed ? null : 'Logout'}
        </li>
        <li
          className='p-4 cursor-pointer flex gap-2 items-center text-sm
            border-t border-[rgba(255,255,255,0.1)] border-solid'
          onClick={toggleSidebar}
        >
          {collapsed? <i className="pi pi-caret-right" /> : <i className="pi pi-caret-left" />} {collapsed ? null : 'Collapse'}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
