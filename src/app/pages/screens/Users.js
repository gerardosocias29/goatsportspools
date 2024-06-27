import { Button } from "primereact/button";
import LazyTable from "../../components/tables/LazyTable";
import { useEffect, useState } from "react";
import { useAxios } from "../../contexts/AxiosContext";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useToast } from "../../contexts/ToastContext";

const Users = () => {
  const axiosService = useAxios();
  const [refreshTable, setRefreshTable] = useState(false);
  const showToast = useToast();

  const roleTemplate = (role) => {
    return role && role.name || '';
  }

  const userColumns = [
    { field: 'name', header: 'Name' },
    { field: 'email', header: 'Email' },
    { field: 'username', header: 'Username' },
    { field: 'role', header: 'Role', template: roleTemplate, hasTemplate: true },
  ];

  const makeLeagueAdmin = (user) => {
    confirmDialog({
      message: 'Are you sure you want to make this user a League Admin?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'rounded-lg bg-primaryS border-primaryS text-white',
      accept: () => {
        axiosService.post('/api/users/update-role/' + user.id).then((response) => {
          console.log(response);
          if(response.data.status){
            showToast({
              severity: 'success',
              summary: 'Success',
              detail: response.data.message,
            });
            setRefreshTable(true);

          } else {
            showToast({
              severity: 'error',
              summary: 'Failed!',
              detail: response.data.message,
            });
          }
        }).catch((error) => {
          console.log(error);
        });
      }
    });
  }

  const customActions = (user) => {
    return user.role.id == 3 ? (
      <>
        <Button label="Make League Admin" className="text-sm rounded-lg bg-primaryS border-primaryS" onClick={() => makeLeagueAdmin(user)}/>
      </>
    ) : null;
  }

  const [cardData, setCardData] = useState();
  const getCardData = () => {
    axiosService.get('/api/users/card-data').then((response) => {
      setCardData(response.data);
    }).catch((error) => {
      // logout();
    });
  }
  
  useEffect(() => {
    getCardData();
  }, []);

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
                      <p className="text-4xl text-center">{cardData && cardData.active_league_admin || 0}</p>
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
                      <p className="text-4xl text-center">{cardData && cardData.active_users || 0}</p>
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

        <LazyTable api={'/api/users'} 
          columns={userColumns}
          refreshTable={refreshTable} setRefreshTable={setRefreshTable}
          actions={true} customActions={customActions} 
          hasOptions={true} 
        />
      </div>
      <ConfirmDialog />
    </div>
  );
}

export default Users;