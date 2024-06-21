import { useState } from "react";
import { Sidebar as PrimeSidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import Sidebar from '../navigations/Sidebar';


const Navbar = () => {
  const [visible, setVisible] = useState(false);


  return (
    <>
      <nav class="shadow absolute w-full">
        <div class="mx-auto px-2 sm:px-6 lg:px-8">
          <div class="relative flex h-16 items-center justify-between">
            <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
              <PrimeSidebar visible={visible} onHide={() => setVisible(false)}>
                <Sidebar callback={() => setVisible(false)}/>
              </PrimeSidebar>
              <Button icon="pi pi-bars" onClick={() => setVisible(true)} />
            </div>
            <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <div class="flex flex-shrink-0 items-center">
                <img class="h-8 w-auto" src="/assets/images/favicon.png" alt="GoatSportsPools" />
              </div>
            </div>
            <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              
            </div>
          </div>
        </div>

      </nav>
    </>
  ); 
}

export default Navbar;