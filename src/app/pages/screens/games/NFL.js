import { useEffect, useState } from "react";
import LazyTable from "../../../components/tables/LazyTable";
import { BetDateTemplate, TeamTemplate } from "./NFLTemplates";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { Dropdown } from "primereact/dropdown";
import { useAxios } from "../../../contexts/AxiosContext";
import { Dialog } from "primereact/dialog";
import Table from "../../../components/tables/Table";
import { InputText } from "primereact/inputtext";
import moment from "moment";
import { InputNumber } from "primereact/inputnumber";
import { useToast } from "../../../contexts/ToastContext";
import { decimalToMixedFraction } from "../../../utils/numberFormat";
import convertUTCToTimeZone from "../../../utils/utcToTimezone";
import LeagueJoin from "../../../components/modals/LeagueJoin";
import axios from "axios";

const NFL = ({currentUser, refreshCurrentUser}) => {
  const mainDisabled = process.env.REACT_APP_ENV === "production";
  console.log(mainDisabled)

  const axiosService = useAxios();
  const showToast = useToast();

  const [refreshTable, setRefreshTable] = useState(false);
  const [bets, setBets] = useState([]);
  const wagerTypes = [
    { name: 'Straight', value: 'straight', status: true },
    { name: 'Parlay', value: 'parlay', status: true },
    { name: '6 point Teaser', value: 'teaser_6', status: true, tooltip: '6 point Teaser' },
    { name: '6.5 point Teaser', value: 'teaser_6_5', status: true, tooltip: '6.5 point Teaser' },
    { name: '7 point Teaser', value: 'teaser_7', status: true, tooltip: '7 point teaser' },
  ];

  const [gamesApi, setGamesApi] = useState();

  const [activeWagerType, setActiveWagerType] = useState(wagerTypes[0]);
  const [sameAmountBet, setSameAmountBet] = useState(0);
  const [parlayBetAmount, setParlayBetAmount] = useState(0);
  const [teaserBetAmount, setTeaserBetAmount] = useState(0);

  const isFiveMinutesBeforeGame = (gameDatetime) => {
    const currentUtcTime = moment.utc();
    const gameTime = moment.utc(gameDatetime);
    return currentUtcTime.isSameOrAfter(gameTime.subtract(9, 'minutes'));
  }

  const checkParlayBet = (gameID, points, team, type) => {
    if((joinedLeagues && joinedLeagues.length > 0 ) && selectedLeague && selectedLeague.balance === 0 ) {
      return true;
    }
    if (activeWagerType.value !== "parlay") {
      return false;
    }
    const hasExistingBet = bets.some((bet) => bet.game_id === gameID && bet.type === type);
    if (hasExistingBet) {
      const isCurrentBet = bets.some((bet) => {
        return bet.game_id === gameID && bet.type === type && (bet.points === points || bet.ml === points) && ((team === 'under' || team === 'over') ? bet.team === team : bet.team.id === team);
      });
      if (isCurrentBet) {
        return false;
      }
      return true;
    }
    return false;
  };
  

  const BetTypeTemplate = () => {
    return <div className="text-center">{activeWagerType.name}</div>
  }

  const WagerTypeTemplate = (data) => {
    let type = data;
    switch(data) {
      case 'total': 
        type = 'Total Points';
      break;
      case 'moneyline': 
        type = 'Money Line';
      break;
      case 'spread': 
        type = 'Spread';
      break;
      default:
      break;
    }
    return <div className="text-center">{type}</div>
  }

  const BetDateTemplate = (value, game, field) => {
    // console.log(value, game, field);
    return <div className="text-center">{convertUTCToTimeZone(value, 'MMM DD hh:mmA')}</div>
  }

  const BetTeamTemplate = (value, bet, field) => {
    const { type, team, points, data, ml } =  bet || {};
    
    const gameID = data.id;
    const pointsLabel = type === 'total' ? ( data && data.team === 'over' ? `TOTAL o${points}` : `TOTAL u${points}`) : type === 'moneyline' ? `[${ml}]` : `[${decimalToMixedFraction(points)}]`;
    const totalLabel = type === "total" ? (data && `(${data.odd.favored_team.nickname} vs. ${data.odd.underdog_team.nickname})`) : '';
    return <div className="flex items-center gap-2"><p className="font-bold">{team.name} {pointsLabel}</p> {totalLabel}</div>;
  }

  const BetAmountTemplate = (value, bet) => {
    return (
      <InputNumber 
        inputId="currency-us" 
        className="w-full"
        inputClassName="rounded-lg ring-0"
        value={bet.bet_amount}
        min={1}
        onChange={(e) => handleBetAmountChange(e.value, bet)} 
        minFractionDigits={2}
        useGrouping={false}
      />
    );
  }

  const RiskingWinTemplate = (value, bet) => {
    const { data, bet_amount, type, ml } = bet;
    let win_amount = bet_amount;
    if(type === "moneyline"){
      win_amount = calculateMoneylineWinnings(bet_amount, ml);
    }

    return (
      <>
        <div className="flex gap-2 justify-center">
          <p className="text-green-500 font-bold">${Number(bet_amount || 0).toFixed(2)}</p>/<p className="text-green-500 font-bold">${Number(win_amount || 0).toFixed(2) }</p>
        </div>
      </>
    );
  }

  const calculateMoneylineWinnings = (betAmount, moneylineOdds) => {
    let winnings = 0;
    if (moneylineOdds > 0) {
      winnings = betAmount * (moneylineOdds / 100);
    } else {
      winnings = betAmount * (100 / Math.abs(moneylineOdds));
    }
    return winnings;
  };

  const handleBetAmountChange = (value, bet) => {
    setBets((prevBets) => {
      return prevBets.map((b) => {
        if (b.type === bet.type && b.team === bet.team && b.points === bet.points && b.ml === bet.ml) {
          return { ...b, bet_amount: value };
        }
        return b;
      });
    });
  };

  const handleGlobalBetAmountChange = (globalValue) => {
    const updatedBets = bets.map((b) => {
      return { ...b, bet_amount: globalValue };
    });
    console.log("updatedBets", updatedBets);
    setBets(updatedBets);
  };

  const betsColumns = [
    { field: 'type', header: 'Bet Type', headerClassName: 'w-[120px]', template: BetTypeTemplate, hasTemplate: true },
    { field: 'type', header: 'Wager Type', headerClassName: 'w-[130px]', template: WagerTypeTemplate, hasTemplate: true },
    { field: 'data.game_datetime', header: 'Game', headerClassName: 'w-[100px]', template: BetDateTemplate, hasTemplate: true },
    { field: '', header: 'Team', headerClassName: 'w-[450px]', template: BetTeamTemplate, hasTemplate: true },
    { field: 'bet_amount', header: 'Bet Amount',headerClassName: 'w-[50px]', template: BetAmountTemplate, hasTemplate: true },
    { field: 'riskingwin', header: 'Risking/Win', headerClassName: 'w-[100px]', template: RiskingWinTemplate, hasTemplate: true},
  ]
  const [betsColumn, setBetsColumn] = useState(betsColumns);

  const handleBetActionsClick = (value, type, betData) => {
    console.log(betData, type);
    if (type == "trash") {
      handleBetClick(betData);
    }
  }

  const handleBetClick = (bet) => {
    setBets((prevBets) => {
      const existingBetIndex = prevBets.findIndex(
        (b) => b.type === bet.type && b.team === bet.team && b.points === bet.points && b.ml === bet.ml && b.game_id === bet.game_id
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
      (b) => b.type === bet.type && b.team === bet.team && b.points === bet.points && b.ml === bet.ml && b.game_id === bet.game_id
    );
  };

  const SpreadTemplate = (value, data, field) => {
    const { odd, home_team, visitor_team } = data;

    if (!odd) { return '' }

    let favored_team, underdog_team, favored_points, underdog_points;

    if (odd.favored_team.id === home_team.id) {
      favored_team = home_team;  // home team is favored
      underdog_team = visitor_team;  // visitor team is underdog
      favored_points = odd.underdog_points;
      underdog_points = odd.favored_points;
    } else {
      favored_team = visitor_team;  // visitor team is favored
      underdog_team = home_team;  // home team is underdog
      favored_points = odd.favored_points;
      underdog_points = odd.underdog_points;
    }

    console.log(home_team.name, visitor_team.name)
    console.log(favored_team.name, underdog_team.name)

    return (
      <div className="flex flex-col gap-4">
        <Button disabled={isFiveMinutesBeforeGame(data.game_datetime) || checkParlayBet(data.id, favored_points, favored_team.id, 'spread') || mainDisabled}
          label={decimalToMixedFraction(favored_points, true)}
          className={`${checkParlayBet(data.id, odd.favored_points, odd.favored_team.id)} border-primaryS ring-0 text-primary hover:text-white hover:bg-primaryS w-full bg-transparent rounded-lg ${isBetSelected({game_id: data.id,  type: 'spread', team: odd.favored_team, points: odd.favored_points }) ? 'bg-primaryS text-white' : ''}`}
          onClick={() => handleBetClick({ game_id: data.id, type: 'spread', team: favored_team, points: favored_points, bet_amount: 0, data: data })}
        />
        <Button disabled={isFiveMinutesBeforeGame(data.game_datetime) || checkParlayBet(data.id, underdog_points, underdog_team.id, 'spread') || mainDisabled}
          label={decimalToMixedFraction(underdog_points, true)}
          className={`${checkParlayBet(data.id, odd.underdog_points, odd.underdog_team.id)} border-primaryS ring-0 text-primary hover:text-white hover:bg-primaryS w-full bg-transparent rounded-lg ${isBetSelected({game_id: data.id,  type: 'spread', team: odd.underdog_team, points: odd.underdog_points }) ? 'bg-primaryS text-white' : ''}`}
          onClick={() => handleBetClick({ game_id: data.id, type: 'spread', team: underdog_team, points: underdog_points, bet_amount: 0, data: data })}
        />
      </div>
    );
  }

  const TotalTemplate = (value, data, field) => {
    const { odd } = data;
    if (!odd) { return '' }
    return (
      <div className="flex flex-col gap-4">
        <Button disabled={isFiveMinutesBeforeGame(data.game_datetime) || checkParlayBet(data.id, odd.over_total, "over", 'total') || mainDisabled} label={'o' + decimalToMixedFraction(odd.over_total)}
          className={`border-primaryS ring-0 text-primary hover:text-white hover:bg-primaryS w-full bg-transparent rounded-lg ${isBetSelected({game_id: data.id,  type: 'total', team: 'over', points: odd.over_total }) ? 'bg-primaryS text-white' : ''}`}
          onClick={() => handleBetClick({ game_id: data.id, type: 'total', team: 'over', points: odd.over_total, bet_amount: 0, data: data })}
        />
        <Button disabled={isFiveMinutesBeforeGame(data.game_datetime) || checkParlayBet(data.id, odd.under_total, "under", 'total') || mainDisabled} label={'u' + decimalToMixedFraction(odd.under_total)}
          className={`border-primaryS ring-0 text-primary hover:text-white hover:bg-primaryS w-full bg-transparent rounded-lg ${isBetSelected({game_id: data.id,  type: 'total', team: 'under', points: odd.under_total }) ? 'bg-primaryS text-white' : ''}`}
          onClick={() => handleBetClick({ game_id: data.id, type: 'total', team: 'under', points: odd.under_total, bet_amount: 0, data: data })}
        />
      </div>
    );
  }

  const MoneyLineTemplate = (value, data, field) => {
    if (activeWagerType.value == "teaser_6" || activeWagerType.value == "teaser_6_5" || activeWagerType.value == "teaser_7") { 
      return ""; 
    }

    const { odd, home_team, visitor_team } = data;
    if (!odd) { return '' }

    let favored_team, underdog_team, favored_ml, underdog_ml;

    // Determine if the favored team is home or visitor
    if (odd.favored_team.id === home_team.id) {
      favored_team = home_team;  // home team is favored
      underdog_team = visitor_team;  // visitor team is underdog
      favored_ml = odd.underdog_ml;
      underdog_ml = odd.favored_ml;
    } else {
      favored_team = visitor_team;  // visitor team is favored
      underdog_team = home_team;  // home team is underdog
      favored_ml = odd.favored_ml;
      underdog_ml = odd.underdog_ml;
    }

    return (
      <div className="flex flex-col gap-4">
        {/* Button for the favored team */}
        <Button 
          disabled={isFiveMinutesBeforeGame(data.game_datetime) || checkParlayBet(data.id, favored_ml, favored_team.id, 'moneyline') || mainDisabled}
          label={decimalToMixedFraction(favored_ml, true)}
          className={`border-primaryS ring-0 text-primary hover:text-white hover:bg-primaryS w-full bg-transparent rounded-lg ${isBetSelected({ game_id: data.id, type: 'moneyline', team: favored_team, ml: favored_ml }) ? 'bg-primaryS text-white' : ''}`}
          onClick={() => handleBetClick({ game_id: data.id, type: 'moneyline', team: favored_team, ml: favored_ml, bet_amount: 0, data })}
        />

        {/* Button for the underdog team */}
        <Button 
          disabled={isFiveMinutesBeforeGame(data.game_datetime) || checkParlayBet(data.id, underdog_ml, underdog_team.id, 'moneyline') || mainDisabled}
          label={decimalToMixedFraction(underdog_ml, true)}
          className={`border-primaryS ring-0 text-primary hover:text-white hover:bg-primaryS w-full bg-transparent rounded-lg ${isBetSelected({ game_id: data.id, type: 'moneyline', team: underdog_team, ml: underdog_ml }) ? 'bg-primaryS text-white' : ''}`}
          onClick={() => handleBetClick({ game_id: data.id, type: 'moneyline', team: underdog_team, ml: underdog_ml, bet_amount: 0, data })}
        />
      </div>
    );
  };


  const gamesColumn = [
    { field: 'game_datetime', header: 'Date', template: BetDateTemplate, hasTemplate: true, headerClassName: 'w-[120px]', headerStyle: { minWidth: '120px' } },
    { field: 'team', header: 'Team', template: TeamTemplate, hasTemplate: true, headerStyle: { minWidth: '400px' } },
    { field: 'spread', header: 'Spread', headerClassName: 'w-[290px]', template: SpreadTemplate, hasTemplate: true, headerStyle: { minWidth: '150px' } },
    { field: 'tp', header: 'Total Points', headerClassName: 'w-[290px]', template: TotalTemplate, hasTemplate: true, headerStyle: { minWidth: '150px' } },
    { field: 'ml', header: 'Money Line', headerClassName: 'w-[290px]', template: MoneyLineTemplate, hasTemplate: true, headerStyle: { minWidth: '150px' } },
  ];

  const [selectedLeague, setSelectedLeague] = useState();
  const [joinedLeagues, setJoinedLeagues] = useState();
  const getJoinedLeagues = () => {
    axiosService.get('/api/leagues/joined').then((response) => {
      if (response.data.status) {
        setJoinedLeagues(response.data.leagues_joined);
        setSelectedLeague(response.data.leagues_joined[0] || null);
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  const [modalWagerVisible, setModalWagerVisisble] = useState(false);

  const getWagerTypeId = (wager_type) => {
    let wager_type_id = 0;
    switch(wager_type){
      case 'spread': 
        wager_type_id = 1;
      break;
      case 'total': 
        wager_type_id = 2;
      break;
      case 'moneyline': 
        wager_type_id = 3;
      break;
      default:
      break;
    }
    return wager_type_id;
  }

  const [placeBetButton, setPlaceBetButton] = useState(false);
  const handlePlaceBets = () => {
    const invalidBets = bets.filter(b => b.bet_amount < 1);
    if (invalidBets.length > 0) {
      showToast({
        severity: 'error',
        summary: 'Invalid Bet Amount',
        detail: 'The minimum bet amount is 1.',
      });
      return;
    }

    // if(activeWagerType.value === "parlay"){
    //   showToast({
    //     severity: 'info',
    //     summary: 'Under Maintenance!',
    //     detail: 'This type of bets is still under development.'
    //   });
    //   return ;
    // }
    
    setPlaceBetButton(true);
    const updatedBets = bets.map((b) => ({
      league_id: selectedLeague.id,
      pool_id: 1,
      wager_type_id: getWagerTypeId(b.type),
      odd_id: b.data.odd.id,
      game_id: b.data.id,
      team_id: b.team === "under" ? -1 : (b.team === "over" ? 0 : b.team.id),
      team_name: b.team.name,
      pick_odd: b.type === "moneyline" ? b.ml : b.points,
      wager_amount: b.bet_amount,
      bet_type: activeWagerType.value
    }));

    let postData = {
      bets: updatedBets,
      wager_type: activeWagerType.value
    }
    if(activeWagerType.value === "parlay"){
      postData.wager_amount = parlayBetAmount;
      postData.wager_win_amount = (parlayWinnings.payout * 1);
      postData.league_id = selectedLeague.id;
    } 

    if(activeWagerType.value.includes('teaser')){
      postData.wager_amount = teaserBetAmount;
      postData.wager_win_amount = (teaserWinnings.payout * 1);
      postData.league_id = selectedLeague.id;
    }
    
    axiosService.post('/api/bets/wager', postData).then((response) => {
      if(response.data.status){
        setModalWagerVisisble(false)
        setBets([]);
        setSameAmountBet(0);
      }
      showToast({
        severity: response.data.status ? 'success' : 'error',
        summary: response.data.status ? 'Success!' : 'Failed!',
        detail: response.data.message,
      });
      setPlaceBetButton(false);
      getJoinedLeagues();
    }).catch((error) => {
      console.log(error);
      setPlaceBetButton(false);
    });

  }


  useEffect(() => {
    getJoinedLeagues();
  }, []);


  const [parlayWinnings, setParlayWinnings] = useState({
    payout: 0,
    return: 0
  });

  const [teaserWinnings, setTeaserWinnings] = useState({
    payout: 0,
    return: 0
  });

  const calculateParlayPayout = (wager) => {
    const parlayOdds = {
      2: 2.6,
      3: 6,
      4: 11,
      5: 22,
      6: 45,
      7: 90,
      8: 180
    };
    
    function americanToDecimal(americanOdds) {
      if (americanOdds > 0) {
        return (americanOdds / 100) + 1;
      } else {
        return (100 / Math.abs(americanOdds)) + 1;
      }
    }

    let combinedOdds = 1;

    bets.forEach(bet => {
      if (bet.type === 'moneyline') {
        combinedOdds *= americanToDecimal(bet.ml);
      } else {
        combinedOdds *= 2;
      }
    });

    let potentialPayout = wager * combinedOdds;

    const totalReturn = potentialPayout + wager;

    setParlayWinnings((prevState) => ({
      ...prevState,
      payout: potentialPayout.toFixed(2),
      return: totalReturn.toFixed(2)
    }));
  }
  
  const calculateTeaserPayout = (wager) => {
    let teaserPoints = activeWagerType.value === "teaser_7" ? 7 : (activeWagerType.value === "teaser_6_5" ? 6.5 : 6)

    const teaserOdds = {
      6: {
        2: -110,
        3: 160,
        4: 260,
        5: 400,
        6: 600,
        7: 900,
        8: 1400
      },
      6.5: {
        2: -120,
        3: 150,
        4: 240,
        5: 360,
        6: 550,
        7: 800,
        8: 1200
      },
      7: {
        2: -130,
        3: 140,
        4: 200,
        5: 320,
        6: 450,
        7: 700,
        8: 1000
      }
    };

    const odds = teaserOdds[teaserPoints][bets.length];
    let potentialPayout;
  
    if (odds < 0) {
      // Negative odds (e.g., -110): Wager to win a fixed amount
      potentialPayout = wager * (100 / Math.abs(odds));
    } else {
      // Positive odds (e.g., +160): Wager to win odds amount
      potentialPayout = wager * (odds / 100);
    }
  
    const totalReturn = potentialPayout + wager;

    setTeaserWinnings((prevState) => ({
      ...prevState,
      payout: potentialPayout.toFixed(2),
      return: totalReturn.toFixed(2)
    }));
  }

  const handleParlayBetAmountChange = (e) => {
    setParlayBetAmount(e.value);
  }

  const handleTeaserBetAmountChange = (e) => {
    setTeaserBetAmount(e.value);
  }

  useEffect(() => {
    calculateParlayPayout(parlayBetAmount);
  }, [parlayBetAmount])

  useEffect(() => {
    calculateTeaserPayout(teaserBetAmount);
  }, [teaserBetAmount])


  const handleContinue = () => {
    if(selectedLeague){
      if(activeWagerType.value === "parlay"){
        if(bets.length < 2 || bets.length > 8) {
          showToast({
            severity: 'error',
            summary: 'Failed!',
            life: 5000,
            detail: 'Parlay bets require a minimum of 2 teams and a maximum of 8 teams.',
          });
          return;
        }
      }
      setModalWagerVisisble(true);
    }
  }

  return (
    <div className="flex flex-col gap-5 p-5" id="NFL">
      <div className="flex items-center gap-2 justify-between">
        <div className="text-primary text-3xl font-semibold">NFL</div>
        <div>
          <p className="font-bold text-primary">Current Balance: {Number(selectedLeague && selectedLeague.balance).toFixed(2)}</p>
        </div> 
        <div className="flex items-center gap-4">
          {
            (joinedLeagues && joinedLeagues.length > 0) ? (
              <>
                <p className="font-bold text-primary">League: </p>
                <Dropdown 
                  placeholder="Select League"
                  className="rounded-lg w-[300px]"
                  value={selectedLeague}
                  onChange={(e) => setSelectedLeague(e.value)}
                  options={joinedLeagues}
                  optionLabel="name"
                />
              </>
            ) : ""
          }
          
        </div>
      </div>

      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-1">
        <div>
          <div className="font-bold mb-2">Bet Type <i className="pi pi-question-circle"></i><Tooltip target={'.pi-question-circle'} /></div>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            {wagerTypes.map((wt, i) => (
              <div key={i}>
                <div key={i}
                  data-pr-tooltip={wt.tooltip} data-pr-position="bottom"
                  aria-disabled={!wt.status}
                  className={`${wt.status ? 'cursor-pointer' : 'cursor-not-allowed'} ${wt.value} select-none rounded-lg shadow-lg border px-4 py-2 text-center hover:bg-primaryS hover:text-white ${activeWagerType.value === wt.value ? 'bg-primaryS text-white' : 'bg-white'}`}
                  onClick={() => {
                    if(wt.status){
                      setActiveWagerType(wt); 
                      setBets([]);
                      if(wt.value === "parlay" || wt.value == "teaser_6" || wt.value == "teaser_6_5" || wt.value == "teaser_7"){
                        const updatedBetsColumns = betsColumns.filter(column => column.field !== 'bet_amount' && column.field !== "riskingwin");
                        setBetsColumn(updatedBetsColumns);
                      } else {
                        setBetsColumn(betsColumns);
                      }
                      setGamesApi(wt.value);
                      setRefreshTable(true);
                    }
                  }}
                >
                  <h2 className="text-lg font-semibold">{wt.name}</h2>
                </div>
                <Tooltip target={`.${wt.value}`} />
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
            additionalApi={gamesApi}
          />
        </div>
        {
          ((selectedLeague && selectedLeague.balance !== 0)) ? <div className="flex items-center justify-end gap-5">
            <Button label={`Clear Bets`}
              disabled={bets && bets.length < 1}
              className="mt-5 rounded-lg text-primaryS border-primaryS bg-transparent ring-0 w-[200px] hover:bg-primaryS hover:text-white" 
              onClick={() => selectedLeague && setBets([])} 
            />
            <Button label={`Continue`}
              disabled={(!selectedLeague || mainDisabled)}
              className="mt-5 rounded-lg bg-background text-white border-background ring-0 w-[200px]" 
              onClick={handleContinue} 
            />
          </div> : null
        }
        
      </div>
      <Dialog header={
        () => {
          return (
            <div className="flex justify-between">
              <p className="font-bold">Your Bets</p>
              <p className="font-bold text-primary mr-5">Current Balance: {Number(selectedLeague && selectedLeague.balance).toFixed(2)}</p>
            </div>
          )
        }
      } footer={() => {
        return <div className="flex flex-col gap-2">
          {
            activeWagerType.value === "parlay" && 
              (
                <>
                  <div className="flex items-center gap-2 justify-end">
                    <label>Bet Amount</label>
                    <InputNumber 
                      inputId="currency-us" 
                      className=""
                      inputClassName="rounded-lg ring-0"
                      value={parlayBetAmount} 
                      useGrouping={false}
                      min={1}
                      onChange={handleParlayBetAmountChange} 
                      minFractionDigits={2}
                    />
                  </div>
                  <div className="text-xl flex items-center gap-1 justify-end">
                    <span>Potential Payout:</span>
                    <span className="font-bold text-green-500">${parlayWinnings.payout || 0.00}</span>
                  </div>
                  <div className="text-xl flex items-center gap-1 justify-end">
                    <span>Total Returns:</span>
                    <span className="font-bold text-green-500">${parlayWinnings.return || 0.00}</span>
                  </div>
                </>
              )
          }
          {
            activeWagerType.value.includes('teaser') && 
              (
                <>
                  <div className="flex items-center gap-2 justify-end">
                    <label>Teaser Bet Amount</label>
                    <InputNumber 
                      inputId="currency-us" 
                      className=""
                      inputClassName="rounded-lg ring-0"
                      value={teaserBetAmount} 
                      useGrouping={false}
                      min={1}
                      onChange={handleTeaserBetAmountChange} 
                      minFractionDigits={2}
                    />
                  </div>
                  <div className="text-xl flex items-center gap-1 justify-end">
                    <span>Potential Payout:</span>
                    <span className="font-bold text-green-500">${teaserWinnings.payout || 0.00}</span>
                  </div>
                  <div className="text-xl flex items-center gap-1 justify-end">
                    <span>Total Returns:</span>
                    <span className="font-bold text-green-500">${teaserWinnings.return || 0.00}</span>
                  </div>
                </>
              )
          }
          {
            activeWagerType.value === "straight" &&
              <div className="flex items-center gap-2 justify-end">
                <label>Use same amount for all bets</label>
                <InputNumber 
                  inputId="currency-us" 
                  className=""
                  inputClassName="rounded-lg ring-0"
                  value={sameAmountBet} 
                  useGrouping={false}
                  min={1}
                  onChange={(e) => {
                    setSameAmountBet(e.value); 
                    handleGlobalBetAmountChange(e.value);
                  }} 
                  minFractionDigits={2}
                />
              </div>
          }
          
          <Button label="Place Your Bets" loading={placeBetButton} className="w-full bg-primaryS rounded-lg border-primaryS ring-0 text-white" onClick={handlePlaceBets} />
        </div>
      }}
        visible={modalWagerVisible} 
        draggable={false} maximizable={false} 
        className="w-[95%] lg:w-2/3" onHide={() => {
          setModalWagerVisisble(false)
          setSameAmountBet();
          setParlayBetAmount(0);
          setPlaceBetButton(false);
        }}>
        <Table data={bets} 
          columns={betsColumn} 
          actions={true} action_types={{ delete: true }} actionsClicked={handleBetActionsClick} customActionsWidth="1rem"
          paginator={false}
          scrollable={true} scrollHeight="450px"
        />
      </Dialog>

    </div>
  );
}

export default NFL;