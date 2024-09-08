import { useEffect, useState } from "react";
import LeagueModal from "../../components/modals/LeagueModal";
import { Button } from "primereact/button";
import LazyTable from "../../components/tables/LazyTable";
import LeagueJoin from "../../components/modals/LeagueJoin";
import { useAxios } from "../../contexts/AxiosContext";
import LeagueUsersModal from "../../components/modals/LeagueUsersModal";

const Leagues = ({currentUser, refreshCurrentUser}) => {
  const axiosService = useAxios();
  const [leagueModalVisible, setModalLeagueVisible] = useState(false);

  const [leagueUsersData, setLeagueUsersData] = useState([]);
  const [leagueUsersModalVisible, setLeagueUsersModalVisible] = useState(false);
  const onUsersModalHide = () => {
    setLeagueUsersModalVisible(false);
    setLeagueUsersData([]);
  }

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

  const LeagueBalanceTemplate = (data) => {
    return <p className="text-center">{data}</p>
  }

  const [refreshTable, setRefreshTable] = useState(false);
  const [leagueColumns, setLeagueColumns] = useState([
    { field: 'league_id', header: 'League ID' },
    { field: 'name', header: 'League Name' },
    { field: 'balance', header: 'Your League Balance', template: LeagueBalanceTemplate, hasTemplate: true },
    // { field: 'created_by', header: 'Created By', template:createdByTemplate, hasTemplate:true },
  ]);

  const [totalLeagues, setTotalLeagues] = useState(0);
  const [leagueModalData, setLeagueModalData] = useState();

  const handleActionsClick = (id, type, data) => {
    if(type === "edit"){
      setLeagueModalData({
        id: id,
        name: data.name,
        password: data.old_password,
        user_id: data.user_id
      });
      setModalLeagueVisible(true);
    } else if(type === 'join') {
      setLeagueJoinData({
        id: data.league_id,
        name: data.name,
      });
      setModalLeagueJoinVisible(true);

    } else if(type === "users"){
      axiosService.get('/api/leagues/get/' + data.id).then((response) => {
        setLeagueUsersData(response.data);
        setLeagueUsersModalVisible(true);
      });
    }
  }

  const customActions = (data) => {
    return (
      <div className="flex justify-end gap-1">
        {
          currentUser && (currentUser.role_id != 3) && (
            <>
              <Button className="text-white border-primary bg-primary rounded-lg text-sm" icon="pi pi-pencil text-sm" tooltip="Edit" data-pr-position="top" onClick={(e) => handleActionsClick(data.id, 'edit', data) }/>
              <Button className="text-white border-primaryS bg-primaryS rounded-lg text-sm" icon="pi pi-users text-sm" tooltip="Users" data-pr-position="top" onClick={(e) => handleActionsClick(data.id, 'users', data) }/>
            </>
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
          currentUser.role_id != 1 &&
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

  const [leaguesCreated, setLeaguesCreated] = useState(0);
  const getLeaguesCreated = () => {
    axiosService.get('/api/leagues/leagues-created').then((response) => {
      setLeaguesCreated(response.data.leagues_created);
    }).catch((error) => {
      console.log(error);
    });
  }

  useEffect(() => {
    getLeaguesJoined();
    if(currentUser && currentUser.role_id === 2){
      getLeaguesCreated();
    }
    if(currentUser && currentUser.role_id !== 3){
      setLeagueColumns(prevColumns => [
        ...prevColumns,
        { field: 'total_users', header: 'Total Users', template: LeagueBalanceTemplate, hasTemplate: true }
      ]);
    }
  }, []);

  const handleLeagueUsersModalSuccess = () => {
    axiosService.get('/api/leagues/get/' + leagueUsersData.id).then((response) => {
      setLeagueUsersData(response.data);
      setLeagueUsersModalVisible(true);
    });
  }

  const handleSuccess = () => {
    setRefreshTable(true);
    if(currentUser && currentUser.role_id != 1){
      getLeaguesJoined();
      refreshCurrentUser();
    }
  }

  return(
    <div className="flex flex-col gap-5 p-5">
      <div className="flex justify-between">
        <div className="text-primary text-3xl font-semibold">Leagues</div>
        <div className="flex gap-2">
          {
            currentUser && currentUser.role_id != 3 && <Button label="Create League" icon="pi pi-trophy" className="rounded-lg border-primaryS bg-primaryS" onClick={() => setModalLeagueVisible(true)}/>
          }
          {
            // currentUser && currentUser.role_id != 1 && <Button label="Join A League" icon="pi pi-trophy" className="rounded-lg border-background bg-background" onClick={() => handleActionsClick(null, 'join', { id: null, name: ''})}/>
          }
        </div>
        
      </div>
      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
        <div className="grid lg:grid-cols-6 gap-4">
          { currentUser && currentUser.role_id != 3 && 
            <div className="border rounded-lg p-4 border-lightgray shadow-lg border-[1px]">
              <div className="flex justify-between mb-3 relative">
                <div className="w-full flex flex-col gap-1">
                  <span className="text-500 text-sm font-medium mb-3">Total Leagues</span>
                  <div className="flex gap-4 w-full justify-center px-2">
                    <div>
                      <div className="flex flex-col items-center">
                        <p className="text-2xl text-center">{currentUser && currentUser.role_id === 1 ? totalLeagues : leaguesCreated}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0">
                  <div className="flex flex-row items-center justify-center rounded-lg p-3 border-[2px]">
                    <i className="pi pi-trophy text-sm"></i>
                  </div>
                </div>
              </div>
            </div>
          }

          { currentUser && currentUser.role_id != 1 && 
            <div className="border rounded-lg p-4 border-lightgray shadow-lg border-[1px]">
              <div className="flex justify-between mb-3 relative">
                <div className="w-full flex flex-col gap-1">
                  <span className="text-500 text-sm font-medium mb-3">Joined Leagues</span>
                  <div className="flex gap-4 w-full justify-center px-2">
                    <div>
                      <div className="flex flex-col items-center">
                        <p className="text-2xl text-center">{leaguesJoined}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0">
                  <div className="flex flex-row items-center justify-center rounded-lg p-3 border-[2px]">
                    <i className="pi pi-trophy text-sm"></i>
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
      <LeagueJoin visible={leagueJoinModalVisible} onHide={onJoinHide} currentUser={currentUser} data={leagueJoinData} onSuccess={handleSuccess} />
      <LeagueUsersModal visible={leagueUsersModalVisible} onHide={onUsersModalHide} data={leagueUsersData} onSuccess={handleLeagueUsersModalSuccess} />
    </div>
  );
}

export default Leagues;