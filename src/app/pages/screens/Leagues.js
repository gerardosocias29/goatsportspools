import { useEffect, useState } from "react";
import LeagueModal from "../../components/modals/LeagueModal";
import { Button } from "primereact/button";
import LazyTable from "../../components/tables/LazyTable";
import LeagueJoin from "../../components/modals/LeagueJoin";
import { useAxios } from "../../contexts/AxiosContext";

const Leagues = ({currentUser}) => {
  const axiosService = useAxios();
  const [leagueModalVisible, setModalLeagueVisible] = useState(false);

  const [leagueJoinModalVisible, setModalLeagueJoinVisible] = useState(false);
  const [leagueJoinData, setLeagueJoinData] = useState();
  const onJoinHide = () => {
    setModalLeagueJoinVisible(false);
    setLeagueJoinData();
  }

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
    { field: 'location', header: 'League Location' },
    // { field: 'created_by', header: 'Created By', template:createdByTemplate, hasTemplate:true },
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
    } else if(type == 'join') {
      
      setLeagueJoinData(data);
      setModalLeagueJoinVisible(true);

    }
  }

  const customActions = (data) => {
    return (
      <div className="flex justify-end gap-1">
        {
          currentUser && currentUser.role_id != 3 && currentUser.id == data.user_id && (
            <Button className="text-white bg-primary rounded-lg text-sm" icon="pi pi-pencil text-sm" tooltip="Edit" data-pr-position="top" onClick={(e) => handleActionsClick(data.id, 'edit', data) }/>
          )
        }
        {
          currentUser && currentUser.role_id != 1 && !data.has_joined && (
            <>
              <Button className="text-white bg-primaryS border-primaryS rounded-lg text-sm w-[110px]" label="Join League" tooltip="Join League" data-pr-position="top" onClick={(e) => handleActionsClick(data.id, 'join', data) }/>
            </>
          )
        }

        {
          data.has_joined && <Button className="text-white bg-green-700 border-green-700 rounded-lg text-sm w-[110px]" disabled label="Joined"/>
        }
      </div>
    );
  }

  const [leaguesJoined, setLeaguesJoined] = useState(0);
  const getLeaguesJoined = () => {
    axiosService.get('/api/leagues/leagues-joined').then((response) => {
      setLeaguesJoined(response.data.leagues_joined);
    }).catch((error) => {
      console.log(error);
    });
  }

  useEffect(() => {
    if(currentUser && currentUser.role_id != 3){
      getLeaguesJoined();
    }
  }, []);

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

          { currentUser && currentUser.role_id != 1 && 
            <div className="border rounded-lg p-4 border-lightgray shadow-lg border-[1px]">
              <div className="flex justify-between mb-3">
                <div className="w-full">
                  <span className="text-500 font-medium mb-3">Joined Leagues</span>
                  <div className="flex gap-4 w-full justify-center px-2">
                    <div>
                      <div className="flex flex-col items-center">
                        <p className="text-4xl text-center">{leaguesJoined}</p>
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
          actions={true} customActions={customActions} customActionsWidth={'300px'}
          hasOptions={true} 
        />
      </div>
      

      <LeagueModal header={`${leagueModalData && leagueModalData.id != '' ? 'Update League' : 'Create League'}`} visible={leagueModalVisible} onHide={onHide} currentUser={currentUser} onSuccess={() => setRefreshTable(true)} data={leagueModalData}/>
      <LeagueJoin visible={leagueJoinModalVisible} onHide={onJoinHide} currentUser={currentUser} data={leagueJoinData} onSuccess={() => setRefreshTable(true)} />
    </div>
  );
}

export default Leagues;