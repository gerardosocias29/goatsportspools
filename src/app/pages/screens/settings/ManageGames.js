import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { useState } from "react";
import LazyTable from "../../../components/tables/LazyTable";
import moment from "moment";
import { decimalToMixedFraction } from "../../../utils/numberFormat";
import { TeamTemplate } from "../games/NFLTemplates";
import convertUTCToTimeZone from "../../../utils/utcToTimezone";
import AnnounceWinnerModal from "../../../components/modals/settings/AnnounceWinnerModal";

const ManageGames = () => {

  const [gameTypes, setGameTypes] = useState([
    { name: 'NFL (National Football League)', value: 'nfl' }
  ]);
  const [selectedGameType, setSelectedGameType] = useState(gameTypes[0].value);
  const [refreshTable, setRefreshTable] = useState(false);

  const GameDateTemplate = (value, game) => {
    return <div className="text-center">{convertUTCToTimeZone(game.game_datetime, 'MMM DD hh:mmA')}</div>
  }

  const FavoredOddTemplate = (value, game) => {
    const { odd } = game;
    const { favored_team, favored_points, favored_ml } = odd;

    return <div className="flex items-center gap-2 justify-center select-none">
      <div className="flex flex-col items-center gap-2 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <img src={favored_team.image_url} alt={favored_team.name} className="w-[50px]"/>
          <p className="font-bold select-none">{favored_team.nickname}</p>
        </div>
        <div className="flex gap-2 items-center py-1 px-4 border rounded-lg shadow-md">
          <span className="font-bold">Spread: </span>{decimalToMixedFraction(favored_points)}
        </div>
        <div className="flex gap-2 items-center py-1 px-4 border rounded-lg shadow-md">
          <span className="font-bold">Money Line: </span>{decimalToMixedFraction(favored_ml)}
        </div>
      </div>
    </div>
  }

  const UnderdogOddTemplate = (value, game) => {
    const { odd } = game;
    const { underdog_team, underdog_points, underdog_ml } = odd;

    return <div className="flex items-center gap-2 justify-center select-none">
      <div className="flex flex-col items-center gap-2 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <img src={underdog_team.image_url} alt={underdog_team.name} className="w-[50px]"/>
          <p className="font-bold select-none">{underdog_team.nickname}</p>
        </div>
        <div className="flex gap-2 items-center py-1 px-4 border rounded-lg shadow-md">
          <span className="font-bold">Spread: </span>{decimalToMixedFraction(underdog_points)}
        </div>
        <div className="flex gap-2 items-center py-1 px-4 border rounded-lg shadow-md">
          <span className="font-bold">Money Line: </span>{decimalToMixedFraction(underdog_ml)}
        </div>
      </div>
    </div>
  }

  const TotalPointsOddTemplate = (value, game) => {
    const { odd } = game;
    const { over_total, under_total } = odd;

    return <div className="flex items-center gap-2 justify-center select-none">
      <div className="flex flex-col items-center gap-2 p-4 rounded-lg">
        <div className="flex gap-2 items-center py-1 px-4 border rounded-lg shadow-md w-[120px] justify-center">
          <span className="font-bold">Over: </span>{decimalToMixedFraction(over_total)}
        </div>
        <div className="flex gap-2 items-center py-1 px-4 border rounded-lg shadow-md w-[120px] justify-center">
          <span className="font-bold">Under: </span>{decimalToMixedFraction(under_total)}
        </div>
      </div>
    </div>
  }

  const GameOddTemplate = (value) => {
    return <div className="flex items-center gap-2 justify-center select-none">
      <div className="flex flex-col items-center gap-2 p-4 rounded-lg">
        <div className="flex gap-2 items-center py-1 px-4 border rounded-lg shadow-md w-[70px] justify-center">
          <span className="font-bold">{value}</span>
        </div>
      </div>
    </div>
  }


  const gamesColumn = [
    { field: 'game_datetime', header: 'Date',   template: GameDateTemplate,       hasTemplate: true, headerClassName: 'w-[120px]', headerStyle: { minWidth: '120px' } },
    { field: 'team', header: 'Team',            template: TeamTemplate,           hasTemplate: true, headerStyle: { minWidth: '400px' } },
    { field: '', header: 'Favored Odd',         template: FavoredOddTemplate,     hasTemplate: true, headerClassName: 'w-[290px]', headerStyle: { minWidth: '150px' } },
    { field: '', header: 'Underdog Odd',        template: UnderdogOddTemplate,    hasTemplate: true, headerClassName: 'w-[290px]', headerStyle: { minWidth: '150px' } },
    { field: '', header: 'Total Points Odd',    template: TotalPointsOddTemplate, hasTemplate: true, headerClassName: 'w-[290px]', headerStyle: { minWidth: '150px' } },
    // { field: 'standard_odd', header: 'Game Odd',template: GameOddTemplate,        hasTemplate: true, headerClassName: 'w-[120px]', headerStyle: { minWidth: '100px' } },
  ];

  const [announceWinnerModal, setAnnounceWinnerModal] = useState(false);
  const [announceWinnerData, setAnnounceWinnerData] = useState();

  const customActions = (data) => {
    return (
      <div className="flex justify-end gap-1">
        <Button className="text-white bg-primary rounded-lg text-sm" icon="pi pi-pencil text-sm" tooltip="Edit" data-pr-position="top" onClick={(e) => {}}/>
        <Button className="text-white bg-primaryS border-primaryS rounded-lg text-sm" label="Announce Winner" onClick={(e) => {
          setAnnounceWinnerData(data);
          setAnnounceWinnerModal(true);
          console.log(data);
        } }/>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex items-center gap-2 justify-between">
        <div className="text-primary text-3xl font-semibold">Game Management</div>
        <div className="flex items-center gap-4">
          <p className="font-bold text-primary">Game Type: </p>
          <Dropdown 
            placeholder="Select Game"
            className="rounded-lg w-[300px]"
            value={selectedGameType}
            onChange={(e) => setSelectedGameType(e.value)}
            options={gameTypes}
            optionLabel="name"
          />
        </div>
        <Button label="Create Game" icon="pi pi-plus" className="rounded-lg border-primaryS bg-primaryS" onClick={() => {}}/>
      </div>
      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
        <LazyTable api={'/api/games'}
          columns={gamesColumn}
          refreshTable={refreshTable} setRefreshTable={setRefreshTable}
          actions={true} customActions={customActions} customActionsWidth="300px"
          hasOptions={true}
        />
      </div>

      <AnnounceWinnerModal 
        visible={announceWinnerModal}
        data={announceWinnerData}
        onHide={() => setAnnounceWinnerModal(false)}
      />
    </div>
  );
}

export default ManageGames;