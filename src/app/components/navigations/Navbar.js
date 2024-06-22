import { useRef, useState } from "react";
import { Sidebar as PrimeSidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import Sidebar from '../navigations/Sidebar';
import { Avatar } from 'primereact/avatar';
import { TieredMenu } from 'primereact/tieredmenu';
import { useNavigate } from "react-router-dom";


const Navbar = ({ currentUser }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const menu = useRef(null);

  const navigateToPage = () => {
    navigate(`/main?page=profile`);
  };

  const items = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: navigateToPage
    },
    { separator: true },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      // command: handleLogout
    },
  ];

  return (
    <>
      <nav className="shadow absolute w-full">
        <div className="mx-auto px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              <PrimeSidebar visible={visible} onHide={() => setVisible(false)}>
                <Sidebar callback={() => setVisible(false)}/>
              </PrimeSidebar>
              <Button icon="pi pi-bars" onClick={() => setVisible(true)} />
            </div>
            <div className="flex flex-1 items-center justify-between">
              <div className="flex flex-shrink-0 items-center gap-3">
                <img className="h-8 w-auto" src="/assets/images/favicon.png" alt="GoatSportsPools" />
                <div className="font-bold">GoatSportsPools</div>
              </div>
              <div className="flex items-center">
                <div className="hover:cursor-pointer select-none gap-2 flex flex-column items-center" onClick={(e) => menu.current.toggle(e)}>
                  <Avatar color="white" icon="pi pi-user" size="medium" shape="circle" style={{ backgroundColor: '#CDCECF' }} />
                  <TieredMenu model={items} popup ref={menu}/>
                  <span className="hidden lg:block leading-[1.5rem]">
                    <span>{currentUser && currentUser.name || ''}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              
            </div>
          </div>
        </div>

      </nav>
    </>
  ); 
}

export default Navbar;