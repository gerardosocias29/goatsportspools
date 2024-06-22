import { useState } from "react";
import { Sidebar as PrimeSidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import Sidebar from '../navigations/Sidebar';


const Navbar = () => {
  const [visible, setVisible] = useState(false);


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
            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex flex-shrink-0 items-center">
                <img className="h-8 w-auto" src="/assets/images/favicon.png" alt="GoatSportsPools" />
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