import { useEffect, useState } from "react";
import { Sidebar as PrimeSidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import Sidebar from '../navigations/Sidebar';
import { UserButton } from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if(!isSignedIn && isLoaded){
      navigate('/login');
    }
  }, [isSignedIn, isLoaded])

  return (
    <>
      <nav className="shadow absolute w-full">
        <div className="mx-auto px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              
            </div>
            <div className="flex flex-1 items-center justify-between">
              <div className="flex flex-shrink-0 items-center gap-3">
                <div className="lg:hidden">
                  <PrimeSidebar visible={visible} onHide={() => setVisible(false)}>
                    <Sidebar callback={() => setVisible(false)}/>
                  </PrimeSidebar>
                  <Button className="bg-transparent text-primary border-none" icon="pi pi-bars" onClick={() => setVisible(true)} />
                </div>
                <img className="h-8 w-auto" src="/assets/images/favicon.png" alt="GoatSportsPools" />
                <div className="font-bold">GoatSportsPools</div>
              </div>
             
              <div className="flex items-center">
                {/* <div className="hover:cursor-pointer select-none gap-2 flex flex-column items-center" onClick={(e) => menu.current.toggle(e)}>
                  <Avatar image={currentUser && currentUser.avatar} className="border" color="white" icon="pi pi-user" size="large" shape="circle" style={{ backgroundColor: '#CDCECF' }} />
                  <TieredMenu model={items} popup ref={menu}/>
                  <span className="hidden lg:block leading-[1.5rem]">
                    <span>{currentUser && currentUser.name || ''}</span>
                  </span>
                </div> */}
                {
                  isSignedIn && (
                    <div className="flex items-center gap-4">
                      { isLoaded && <p className="select-none">{user.fullName}</p>}
                      <UserButton afterSignOutUrl='/login' />
                    </div>
                  )
                }
              </div>
            </div>
          </div>
        </div>

      </nav>
    </>
  ); 
}

export default Navbar;