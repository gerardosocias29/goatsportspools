import { useEffect, useState } from "react";
import LazyTable from "../../../components/tables/LazyTable";
import { BetDateTemplate, TeamTemplate } from "./NFLTemplates";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { Dropdown } from "primereact/dropdown";
import { useAxios } from "../../../contexts/AxiosContext";
import { Dialog } from "primereact/dialog";
import Table from "../../../components/tables/Table";
import moment from "moment";

const NFL = () => {
  const axiosService = useAxios();

  const [refreshTable, setRefreshTable] = useState(false);
  const [bets, setBets] = useState([]);
  const wagerTypes = [
    { name: 'Parlay', value: 'parlay' },
    { name: 'Straight', value: 'straight' },
    { name: 'Teaser', value: 'teaser' },
  ];

  const [activeWagerType, setActiveWagerType] = useState(wagerTypes[0]);
  const BetTypeTemplate = () => {
    return <div className="text-center">{activeWagerType.name}</div>
  }
  const WagerTypeTemplate = (data) => {
    let type = data;
    switch(data) {
      case 'total': type = 'Total Points'; break;
      case 'moneyline': type = 'Money Line'; break;
      case 'spread': type = 'Spread'; break;
    }
    return <div className="text-center">{type}</div>
  }
  const BetDateTemplate = (value, game) => {
    return <div className="text-center">{moment(game.data?.game_datetime).format('MMM DD')}</div>
  }
  const betsColumn = [
    { field: 'type', header: 'Bet Type', headerClassName: 'w-[120px]', template: BetTypeTemplate, hasTemplate: true},
    { field: 'type', header: 'Wager Type', headerClassName: 'w-[150px]', template: WagerTypeTemplate, hasTemplate: true},
    { field: 'type', header: 'Game Date', headerClassName: 'w-[150px]', template: BetDateTemplate, hasTemplate: true},
    { field: '', header: 'Team'},
    { field: '', header: 'Bet Amount'},
  ]

  const handleBetActionsClick = (value, type, betData) =>{
    console.log(betData, type);
    if(type == "trash"){
      handleBetClick(betData);
    }
  }

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
          onClick={() => handleBetClick({ type: 'spread', team: odd.favored_team, points: odd.favored_points, bet_amount: 0, data: data })}
        />
        <Button label={odd.underdog_points}
          className={`border-primaryS ring-0 text-primary hover:text-white hover:bg-primaryS w-full bg-transparent rounded-lg ${isBetSelected({ type: 'spread', team: odd.underdog_team, points: odd.underdog_points }) ? 'bg-primaryS text-white' : ''}`}
          onClick={() => handleBetClick({ type: 'spread', team: odd.underdog_team, points: odd.underdog_points, bet_amount: 0, data: data })}
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
          onClick={() => handleBetClick({ type: 'total', team: 'over', points: odd.over_total, bet_amount: 0, data: data })}
        />
        <Button label={'u' + odd.under_total}
          className={`border-primaryS ring-0 text-primary hover:text-white hover:bg-primaryS w-full bg-transparent rounded-lg ${isBetSelected({ type: 'total', team: 'under', points: odd.under_total }) ? 'bg-primaryS text-white' : ''}`}
          onClick={() => handleBetClick({ type: 'total', team: 'under', points: odd.under_total, bet_amount: 0, data: data })}
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
          onClick={() => handleBetClick({ type: 'moneyline', team: odd.favored_team, ml: odd.favored_ml, bet_amount: 0, data: data })}
        />
        <Button label={odd.underdog_ml}
          className={`border-primaryS ring-0 text-primary hover:text-white hover:bg-primaryS w-full bg-transparent rounded-lg ${isBetSelected({ type: 'moneyline', team: odd.underdog_team, ml: odd.underdog_ml }) ? 'bg-primaryS text-white' : ''}`}
          onClick={() => handleBetClick({ type: 'moneyline', team: odd.underdog_team, ml: odd.underdog_ml, bet_amount: 0, data: data })}
        />
      </div>
    );
  }

  const gamesColumn = [
    { field: 'game_datetime', header: 'Date', template: BetDateTemplate, hasTemplate: true, headerClassName: 'w-[120px]' },
    { field: 'team', header: 'Team', template: TeamTemplate, hasTemplate: true },
    { field: 'spread', header: 'Spread', headerClassName: 'w-[290px]', template: SpreadTemplate, hasTemplate: true },
    { field: 'tp', header: 'Total Points', headerClassName: 'w-[290px]', template: TotalTemplate, hasTemplate: true },
    { field: 'ml', header: 'Money Line', headerClassName: 'w-[290px]', template: MoneyLineTemplate, hasTemplate: true },
  ];

  const [selectedLeague, setSelectedLeague] = useState();
  const [joinedLeagues, setJoinedLeagues] = useState();
  const getJoinedLeagues = () => {
    axiosService.get('/api/leagues/joined').then((response) => {
      if(response.data.status){
        setJoinedLeagues(response.data.leagues_joined);
        setSelectedLeague(response.data.leagues_joined[0] || []);
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  const [modalWagerVisible, setModalWagerVisisble] = useState(false);


  useEffect(() => {
    getJoinedLeagues();
  }, []);

  return (
    <div className="flex flex-col gap-5 p-5" id="NFL">
      <div className="flex items-center gap-2 justify-between">
        <div className="text-primary text-3xl font-semibold">NFL</div>
        <div className="flex items-center gap-4">
          <p className="font-bold text-primary">League: </p>
          <Dropdown 
            placeholder="Select League"
            className="rounded-lg w-[300px]"
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.value)}
            options={joinedLeagues}
            optionLabel="name"
          />
        </div>
      </div>

      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-1">
        <div>
          <div className="font-bold mb-2">Bet Type <i className="pi pi-question-circle"></i><Tooltip target={'.pi-question-circle'} /></div>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            {wagerTypes.map((wt, i) => (
              <div key={i}
                className={`cursor-pointer select-none rounded-lg shadow-lg border p-4 text-center hover:bg-primaryS hover:text-white ${activeWagerType.value === wt.value ? 'bg-primaryS text-white' : 'bg-white'}`}
                onClick={() => {
                  setActiveWagerType(wt); 
                  setBets([]);
                }}
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
          <Button label="Continue" className="mt-5 rounded-lg bg-background text-white border-background ring-0 w-[200px]" onClick={() => setModalWagerVisisble(true)}/>
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
      <Dialog header="Your Bets" visible={modalWagerVisible} draggable={false} maximizable={false} className="w-2/3" onHide={() => setModalWagerVisisble(false)}>
        <Table data={bets} 
          columns={betsColumn} 
          actions={true} action_types={{delete: true}} actionsClicked={handleBetActionsClick}
          paginator={false}
          scrollable={true} scrollHeight="450px"
        />
        <Button label="Place Your Bets" className="w-full mt-5 bg-primaryS rounded-lg border-primaryS ring-0 text-white" onClick={() => alert('Bet placed!')} />
        
      </Dialog>
    </div>
  );
}

export default NFL;