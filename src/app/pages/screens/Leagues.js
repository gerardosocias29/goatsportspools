import { useState } from "react";
import LeagueModal from "../../components/modals/LeagueModal";
import { Button } from "primereact/button";
import LazyTable from "../../components/tables/LazyTable";

const Leagues = ({currentUser}) => {
  const [leagueModalVisible, setModalLeagueVisible] = useState(false);
  const onHide = () => {
    setModalLeagueVisible(false);
    setLeagueModalData({
      id: '',
      name: '',
      password: '',
      user_id: undefined
    });
  }

  const createdByTemplate = (data) => {
    return data.name
  }

  const [refreshTable, setRefreshTable] = useState(false);
  const leagueColumns = [
    { field: 'league_id', header: 'League ID' },
    { field: 'name', header: 'League Name' },
    { field: 'created_by', header: 'Created By', template:createdByTemplate, hasTemplate:true },
  ];

  const [totalLeagues, setTotalLeagues] = useState(0);
  const [leagueModalData, setLeagueModalData] = useState();

  const handleActionsClick = (id, type, data) => {
    if(type == "edit"){
      setLeagueModalData({
        id: id,
        name: data.name,
        password: '',
        user_id: data.user_id
      });
      setModalLeagueVisible(true);
    }
  }

  return(
    <div className="flex flex-col gap-5 p-5">
      <div className="flex justify-between">
        <div className="text-primary text-3xl font-semibold">Leagues</div>
        <Button label="Create League" icon="pi pi-trophy" className="rounded-lg border-primaryS bg-primaryS" onClick={() => setModalLeagueVisible(true)}/>
      </div>
      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
        <div className="grid lg:grid-cols-4 gap-4">
          { currentUser && currentUser.role_id != 3 && 
            <div className="border rounded-lg p-4 border-lightgray shadow-lg border-[1px]">
              <div className="flex justify-between mb-3">
                <div className="w-full">
                  <span className="text-500 font-medium mb-3">Total Leagues</span>
                  <div className="flex gap-4 w-full justify-center px-2">
                    <div>
                      <div className="flex flex-col items-center">
                        <p className="text-4xl text-center">{totalLeagues}</p>
                        <span className="text-sm min-w-[60px] text-center font-bold">Created</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex flex-row items-center justify-center rounded-lg p-3 border-[2px]">
                    <i className="pi pi-trophy text-xl"></i>
                  </div>
                </div>
              </div>
            </div>
          }

          { currentUser && currentUser.role_id == 3 && 
            <div className="border rounded-lg p-4 border-lightgray shadow-lg border-[1px]">
              <div className="flex justify-between mb-3">
                <div className="w-full">
                  <span className="text-500 font-medium mb-3">Joined Leagues</span>
                  <div className="flex gap-4 w-full justify-center px-2">
                    <div>
                      <div className="flex flex-col items-center">
                        <p className="text-4xl text-center">{0}</p>
                        <span className="text-sm min-w-[60px] text-center font-bold">Leagues</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex flex-row items-center justify-center rounded-lg p-3 border-[2px]">
                    <i className="pi pi-trophy text-xl"></i>
                  </div>
                </div>
              </div>
            </div>
          }


        </div>
      </div>
      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
        <LazyTable api={'/api/leagues'} 
          columns={leagueColumns} setTotal={setTotalLeagues}
          refreshTable={refreshTable} setRefreshTable={setRefreshTable}
          actions={true} action_types={{
            edit: true,
            delete: true
          }} actionsClicked={handleActionsClick}
          hasOptions={true} 
        />
      </div>

      <LeagueModal visible={leagueModalVisible} onHide={onHide} currentUser={currentUser} onSuccess={() => setRefreshTable(true)} data={leagueModalData}/>
    </div>
  );
}

export default Leagues;