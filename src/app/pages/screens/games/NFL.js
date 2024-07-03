import { useState } from "react";
import LazyTable from "../../../components/tables/LazyTable";
import { DateTemplate, TeamTemplate } from "./NFLTemplates";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";

const NFL = () => {
  const [refreshTable, setRefreshTable] = useState(false);
  const [bets, setBets] = useState([]);
  const wagerTypes = [
    { name: 'Parlay', value: 'parlay' },
    { name: 'Straight', value: 'straight' },
    { name: 'Teaser', value: 'teaser' },
  ];

  const [activeWagerType, setActiveWagerType] = useState(wagerTypes[0]);

  const handleBetClick = (bet) => {
    setBets((prevBets) => {
      const existingBetIndex = prevBets.findIndex(
        (b) => b.type === bet.type && b.team === bet.team && b.points === bet.points && b.ml === bet.ml
      );
      if (existingBetIndex > -1) {
        // Remove existing bet
        return prevBets.filter((_, index) => index !== existingBetIndex);
      } else {
        // Add new bet
        return [...prevBets, bet];
      }
    });
  };

  const isBetSelected = (bet) => {
    return bets.some(
      (b) => b.type === bet.type && b.team === bet.team && b.points === bet.points && b.ml === bet.ml
    );
  };

  const SpreadTemplate = (value, data, field) => {
    const { odd } = data;
    if (!odd) { return '' }
    return (
      <div className="flex flex-col gap-4">
        <Button label={odd.favored_points}
          className={`border-primaryS ring-0 text-primary hover:text-white hover:bg-primaryS w-full bg-transparent rounded-lg ${isBetSelected({ type: 'spread', team: odd.favored_team, points: odd.favored_points }) ? 'bg-primaryS text-white' : ''}`}
          onClick={() => handleBetClick({ type: 'spread', team: odd.favored_team, points: odd.favored_points })}
        />
        <Button label={odd.underdog_points}
          className={`border-primaryS ring-0 text-primary hover:text-white hover:bg-primaryS w-full bg-transparent rounded-lg ${isBetSelected({ type: 'spread', team: odd.underdog_team, points: odd.underdog_points }) ? 'bg-primaryS text-white' : ''}`}
          onClick={() => handleBetClick({ type: 'spread', team: odd.underdog_team, points: odd.underdog_points })}
        />
      </div>
    );
  }

  const TotalTemplate = (value, data, field) => {
    const { odd } = data;
    if (!odd) { return '' }
    return (
      <div className="flex flex-col gap-4">
        <Button label={'o' + odd.over_total}
          className={`border-primaryS ring-0 text-primary hover:text-white hover:bg-primaryS w-full bg-transparent rounded-lg ${isBetSelected({ type: 'total', team: 'over', points: odd.over_total }) ? 'bg-primaryS text-white' : ''}`}
          onClick={() => handleBetClick({ type: 'total', team: 'over', points: odd.over_total })}
        />
        <Button label={'u' + odd.under_total}
          className={`border-primaryS ring-0 text-primary hover:text-white hover:bg-primaryS w-full bg-transparent rounded-lg ${isBetSelected({ type: 'total', team: 'under', points: odd.under_total }) ? 'bg-primaryS text-white' : ''}`}
          onClick={() => handleBetClick({ type: 'total', team: 'under', points: odd.under_total })}
        />
      </div>
    );
  }

  const MoneyLineTemplate = (value, data, field) => {
    const { odd } = data;
    if (!odd) { return '' }
    return (
      <div className="flex flex-col gap-4">
        <Button label={odd.favored_ml}
          className={`border-primaryS ring-0 text-primary hover:text-white hover:bg-primaryS w-full bg-transparent rounded-lg ${isBetSelected({ type: 'moneyline', team: odd.favored_team, ml: odd.favored_ml }) ? 'bg-primaryS text-white' : ''}`}
          onClick={() => handleBetClick({ type: 'moneyline', team: odd.favored_team, ml: odd.favored_ml })}
        />
        <Button label={odd.underdog_ml}
          className={`border-primaryS ring-0 text-primary hover:text-white hover:bg-primaryS w-full bg-transparent rounded-lg ${isBetSelected({ type: 'moneyline', team: odd.underdog_team, ml: odd.underdog_ml }) ? 'bg-primaryS text-white' : ''}`}
          onClick={() => handleBetClick({ type: 'moneyline', team: odd.underdog_team, ml: odd.underdog_ml })}
        />
      </div>
    );
  }

  const gamesColumn = [
    { field: 'game_datetime', header: 'Date', template: DateTemplate, hasTemplate: true, headerClassName: 'w-[120px]' },
    { field: 'team', header: 'Team', template: TeamTemplate, hasTemplate: true },
    { field: 'spread', header: 'Spread', headerClassName: 'w-[290px]', template: SpreadTemplate, hasTemplate: true },
    { field: 'tp', header: 'Total Points', headerClassName: 'w-[290px]', template: TotalTemplate, hasTemplate: true },
    { field: 'ml', header: 'Money Line', headerClassName: 'w-[290px]', template: MoneyLineTemplate, hasTemplate: true },
  ];

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex items-center gap-2 text-primary text-3xl font-semibold">NFL</div>

      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-1">
        <div>
          <div className="font-bold mb-2">Bet Type <i className="pi pi-question-circle"></i><Tooltip target={'.pi-question-circle'} /></div>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            {wagerTypes.map((wt, i) => (
              <div key={i}
                className={`cursor-pointer select-none rounded-lg shadow-lg border p-4 text-center hover:bg-primaryS hover:text-white ${activeWagerType.value === wt.value ? 'bg-primaryS text-white' : 'bg-white'}`}
                onClick={() => setActiveWagerType(wt)}
              >
                <h2 className="text-xl font-semibold">{wt.name}</h2>
              </div>
            ))}
          </div>
          
        </div>

        <div>
          <div className="font-bold mb-2 mt-5">Games</div>

          <LazyTable api={'/api/games'}
            columns={gamesColumn}
            refreshTable={refreshTable} setRefreshTable={setRefreshTable}
            rowLimit={1000}
            scrollable={true}
            scrollHeight="520px"
            paginator={false}
          />
        </div>
        <div className="flex items-center justify-end ">
          <Button label="Continue" className="mt-5 rounded-lg bg-background text-white border-background ring-0 w-[200px]"/>
        </div>

        {/* <div className="">
          <div className="font-bold mb-2">Your Bets</div>
          <ul>
            {bets.map((bet, index) => (
              <li key={index} className="flex justify-between items-center border-b py-2">
                <span>{bet.type}: {bet.points}</span>
                <Button icon="pi pi-times" className="p-button-danger p-button-rounded p-button-sm" onClick={() => handleBetClick(bet)} />
              </li>
            ))}
          </ul>
          <div className="font-bold mt-5">Total Bets: {bets.length}</div>
          <Button label="Place Bet" className="w-full mt-5 bg-primaryS text-white" onClick={() => alert('Bet placed!')} />
        </div> */}
      </div>
    </div>
  );
}

export default NFL;