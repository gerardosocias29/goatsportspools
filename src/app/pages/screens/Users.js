import { Button } from "primereact/button";
import LazyTable from "../../components/tables/LazyTable";

const Users = () => {

  const userColumns = [
    { field: 'name', header: 'Name' },
    { field: 'email', header: 'Email' },
    { field: 'username', header: 'Username' },
  ];

  const customActions = (data) => {
    return (
      <>
        <Button label="Make League Admin"/>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-primary text-3xl font-semibold">Users</div>
      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
        <div className="grid lg:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4 border-lightgray shadow-lg border-[1px]">
            <div className="flex justify-between mb-3">
              <div className="w-full">
                <span className="text-500 font-medium mb-3">League Admin</span>
                <div className="flex gap-4 w-full justify-center px-2">
                  <div>
                    <div className="flex flex-col items-center">
                      <p className="text-4xl text-center">87</p>
                      <span className="text-sm min-w-[60px] text-center font-bold">Members</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex flex-row items-center justify-center rounded-lg p-3 border-[2px]">
                  <i className="pi pi-users text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4 border-lightgray shadow-lg border-[1px]">
            <div className="flex justify-between mb-3">
              <div className="w-full">
                <span className="text-500 font-medium mb-3">Active Users</span>
                <div className="flex gap-4 w-full justify-center px-2">
                  <div>
                    <div className="flex flex-col items-center">
                      <p className="text-4xl text-center">87</p>
                      <span className="text-sm min-w-[60px] text-center font-bold">Members</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex flex-row items-center justify-center rounded-lg p-3 border-[2px]">
                  <i className="pi pi-users text-xl"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">

        <LazyTable api={'/api/users'} columns={userColumns} actions={true} customActions={customActions} hasOptions={true} />
      </div>
    </div>
  );
}

export default Users;