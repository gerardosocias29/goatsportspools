import { useState } from "react";
import LeagueModal from "../../components/modals/LeagueModal";
import { Button } from "primereact/button";
import LazyTable from "../../components/tables/LazyTable";

const Leagues = () => {
  const [leagueModalVisible, setModalLeagueVisible] = useState(false);
  const onHide = () => {
    setModalLeagueVisible(false);
  }

  const [refreshTable, setRefreshTable] = useState(false);
  const leagueColumns = [
    { field: 'league_id', header: 'League ID' },
    { field: 'name', header: 'League Name' },
  ];

  return(
    <div className="flex flex-col gap-5 p-5">
      <div className="flex justify-between">
        <div className="text-primary text-3xl font-semibold">Leagues</div>
        <Button label="Create League" icon="pi pi-trophy" className="rounded-lg border-primaryS bg-primaryS" onClick={() => setModalLeagueVisible(true)}/>
      </div>
      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
        <LazyTable api={'/api/leagues'} 
          columns={leagueColumns}
          refreshTable={refreshTable} setRefreshTable={setRefreshTable}
          // actions={true} customActions={customActions} 
          // hasOptions={true} 
        />
      </div>


      <LeagueModal visible={leagueModalVisible} onHide={onHide}/>
    </div>
  );
}

export default Leagues;