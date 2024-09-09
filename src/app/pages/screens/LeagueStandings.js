import { useEffect, useState } from "react";
import { useAxios } from "../../contexts/AxiosContext";
import { Dropdown } from "primereact/dropdown";
import Table from "../../components/tables/Table";
import { Badge } from "primereact/badge";
import { Button } from "primereact/button";
import BetHistoryModal from "../../components/modals/BetHistoryModal";
import { decimalToMixedFraction } from "../../utils/numberFormat";
import convertUTCToTimeZone from "../../utils/utcToTimezone";
import moment from "moment";

const LeagueStandings = ({currentUser}) => {
  const axiosService = useAxios();
  const [activeLeague, setActiveLeague] = useState();
  const [leagues, setLeagues] = useState();

  const NameTemplate = (value, data) => {
    return <div className="flex items-center gap-1">{value} {data.you ? <Badge severity="success" value="You"></Badge> : ''}</div>
  }

  const BalanceTemplate = (value) => {
    const formattedValue = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return <span className="text-right">{formattedValue}</span>;
  };

  const RankTemplate = (value) => {
    return value === 1 ? '$200 October winner' : value  
  }

  const columns = [
    { field: 'rank', header: 'Rank', template: RankTemplate, hasTemplate: true, headerStyle: { textAlign: "center" } },
    { field: 'name', header: 'Name', template: NameTemplate, hasTemplate: true },
    { field: 'email', header: 'Email', headerStyle: { textAlign: "center" } },
    { field: 'phone', header: 'Phone', headerStyle: { textAlign: "center" } },
    { field: 'balance', header: 'Balance', template: BalanceTemplate, hasTemplate: true, headerStyle: { textAlign: "right" } }
    // { field: 'win_bets.length', header: 'Wins', headerStyle: { textAlign: "center" } },
    // { field: 'lose_bets.length', header: 'Losses', headerStyle: { textAlign: "center" }},
    // { field: 'tie_bets.length', header: 'Ties', headerStyle: {textAlign: "center"}},
  ]
  
  const sortLeagues = (leagues) => {
    return leagues.map(league => {
      const sortedParticipants = [...league.participants].sort((a, b) => a.rank - b.rank);
      return {
        ...league,
        participants: sortedParticipants,
        highestRank: Math.min(...sortedParticipants.map(p => p.rank))
      };
    }).sort((a, b) => a.highestRank - b.highestRank);
  };

  const getLeagues = () => {
    axiosService.get('/api/leagues/active-leagues').then((response) => {
      const sortedLeagues = sortLeagues(response.data.leagues);
      setLeagues(sortedLeagues);
      setActiveLeague(sortedLeagues[0]);
    }).catch((error) => {
      console.log(error);
    }); 
  }

  const getUserBets = (user_id) => {
    axiosService.get('/api/bets/get-one/'+user_id).then((response) => {
      console.log("response::", response.data);
      handleViewBetsClick(response.data);
    }).catch((error) => {
      console.log(error);
    }); 
  }

  const customActions = (data) => {
    return (
      <>
        <div className="flex gap-1 items-center justify-end">
          <Button className="text-white bg-primaryS border-primaryS rounded-lg text-sm" 
            label="Bet History"
            icon="pi pi-eye"
            onClick={() => getUserBets(data.id)}
          />
        </div>
      </>
    );
  }

  const TicketNumberTemplate = (value, rowData) => {
    if(rowData.bet_group != null){
      return <p className="text-center">-</p>
    }
    
    return <p className="text-center">{value}</p>
  }

  const TypeTemplate = (value, rowData) => {
    if(rowData.bet_group != null){
      const { wager_type } = rowData.bet_group;
      return <p className="text-center">{wager_type.name}</p>
    }
    
    return <p className="text-center">{value}</p>
  }

  const GameDateTemplate = (value, rowData) => {
    if(rowData.bet_group != null){
      return <p className="text-center">-</p>
    }
    return <p className="text-center">{convertUTCToTimeZone(value, 'MMM DD hh:mmA')}</p>
  }

  const RiskWinTemplate = (value, rowData, field) => {
    if(rowData.bet_group != null){
      const { wager_amount, wager_win_amount, wager_result } = rowData.bet_group;
      if(wager_result !== "pending"){
        return <p className="text-center font-bold">-</p>
      }
      return <p className="text-center font-bold">${Number(wager_amount).toFixed(2)} / ${Number(wager_win_amount).toFixed(2)}</p>
    }

    if(rowData.wager_result !== "pending"){
      return <p className="text-center font-bold">-</p>
    }

    return <p className="text-center font-bold">${Number(rowData.wager_amount).toFixed(2)} / ${Number(rowData.wager_win_amount).toFixed(2)}</p>
  }

  const WinLossTemplate = (value, rowData, field) => {
    if(rowData.bet_group != null){
      const { wager_amount, wager_win_amount, wager_result } = rowData.bet_group;

      const new_amount = wager_result === "win" ? "$" + Number(wager_win_amount).toFixed(2) : (wager_result === "lose" ? "-$" +Number(wager_amount).toFixed(2) : '-')
      return <p className="text-center font-bold">{new_amount}</p>
    }

    const amount = rowData.wager_result === "win" ? "$" + Number(rowData.wager_win_amount).toFixed(2) : (rowData.wager_result === "lose" ? "-$" +Number(rowData.wager_amount).toFixed(2) : '-')
    return <p className="text-center font-bold">{amount}</p>
  }

  const ResultTemplate = (value, rowData) => {
    if(rowData.bet_group != null){
      const { wager_result } = rowData.bet_group;
      return <p className={`rounded-lg text-center text-sm tracking-wide p-2 ${wager_result === "win" ? 'text-green-500' : (wager_result === "lose" ? 'text-red-500' : 'bg-gray-200')}`}>{wager_result?.toUpperCase()}</p>
    }
    return <p className={`rounded-lg text-center text-sm tracking-wide p-2 ${value === "win" ? 'text-green-500' : (value === "lose" ? 'text-red-500' : (value === "push" ? '' : 'bg-gray-200'))}`}>{value?.toUpperCase()}</p>
  }

  const DatePlaceTemplate = (value) => {
    return <p className="text-center">{moment(value).format('DD/MM/YYYY hh:mmA')}</p>
  }

  const DescriptionTemplate = (value, rowData, field) => {
    if(rowData.bet_group != null){
      const { wager_type } = rowData.bet_group;
      return <p>{wager_type.description}</p>
    }

    const { game, team } = rowData;

    const gameID = game.id;

    let favoredTeamId = rowData.odd.favored_team.id;
    let underdogTeamId = rowData.odd.underdog_team.id;
    let favoredTeamNickname = '';
    let favoredTeamScore = '';
    let underdogTeamNickname = '';
    let underdogTeamScore = '';

    if (favoredTeamId === game.home_team_id) {
      favoredTeamNickname = game.home_team.nickname;
      favoredTeamScore = game.home_team_score;
    } else if (favoredTeamId === game.visitor_team_id) {
      favoredTeamNickname = game.visitor_team.nickname;
      favoredTeamScore = game.visitor_team_score;
    }
    if (underdogTeamId === game.home_team_id) {
      underdogTeamNickname = game.home_team.nickname;
      underdogTeamScore = game.home_team_score;
    } else if (underdogTeamId === game.visitor_team_id) {
      underdogTeamNickname = game.visitor_team.nickname;
      underdogTeamScore = game.visitor_team_score;
    }

    const pointsLabel = rowData.wager_type_id === 2 ? ( rowData.team_id === 0 ? `TOTAL o${decimalToMixedFraction(rowData.picked_odd)}` : `TOTAL u${decimalToMixedFraction(rowData.picked_odd)}`) : rowData.wager_type_id === 3 ? `[${decimalToMixedFraction(rowData.picked_odd, true)}]` : `[${decimalToMixedFraction(rowData.picked_odd, true)}]`;
    const totalLabel = ( `(${favoredTeamNickname} - ${favoredTeamScore} vs. ${underdogTeamNickname} - ${underdogTeamScore})`);
    return <p><span className="font-bold">{team?.name} {pointsLabel}</span> {totalLabel}</p>
  }

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);
  const handleModalOnHide = () => {
    setModalVisible(false);
    setModalData([]);
  }

  const [modalVisible1, setModalVisible1] = useState(false);
  const [modalData1, setModalData1] = useState([]);
  const handleModalOnHide1 = () => {
    setModalVisible1(false);
    setModalData1([]);
  }

  const handleViewBetsClick = (data) => {
    setModalData(data);
    setModalVisible(true);
  }

  const handleViewBetsClick1 = (rowData) => {
    console.log(rowData);
    setModalData1(rowData.bet_group.bets);
    setModalVisible1(true);
  }

  const ActionsTemplate = (value, rowData) => {
    if(rowData.bet_group != null){
      return <div className="flex justify-center">
        <Button className="text-white bg-primaryS rounded-lg ring-0 text-sm" icon="pi pi-eye" text aria-label="View" label="View Bets" 
          onClick={(e) => handleViewBetsClick1(rowData) }
        />
      </div>
    }
    return "";    
  }

  const betsColumn = [
    { field: 'ticket_number', header: 'Ticket #', headerClassName: 'w-[120px]', template: TicketNumberTemplate, hasTemplate: true },
    { field: 'wager_type.name', header: 'Type', headerClassName: 'w-[120px]', template: TypeTemplate, hasTemplate: true },
    { field: 'game.game_datetime', header: 'Game Date', headerClassName: 'w-[100px]', template: GameDateTemplate, hasTemplate: true },
    { field: 'team.name', header: 'Description', headerClassName: 'w-[450px]', template: DescriptionTemplate, hasTemplate: true },
    { field: 'wager_amount', header: 'Risk/Win', headerClassName: 'w-[130px]', template: RiskWinTemplate, hasTemplate: true },
    { field: '', header: 'Win/Loss Dollar Amount', headerClassName: 'w-[120px]', template: WinLossTemplate, hasTemplate: true },
    { field: 'wager_result', header: 'Result', headerClassName: 'w-[130px]', template: ResultTemplate, hasTemplate: true },
    { field: 'created_at', header: 'Date Placed', headerClassName: 'w-[130px]', template: DatePlaceTemplate, hasTemplate: true },
    { field: 'actions', header: '', headerClassName: 'w-[200px]', template: ActionsTemplate, hasTemplate: true },
  ];


  useEffect(() => {
    getLeagues();
  }, []);

  const handleOnSelect = (e) => {
    if(e) {
      getUserBets(e && e.id);
      console.log("e::::", e);  
    }
    return ;
    // handleViewBetsClick(e.bets);
    // setModalVisible(true);
  }

  const handleOnSelect1 = (e) => {
    console.log("handleOnSelect1::", e);
    if(e.bet_group != null){
      handleViewBetsClick1(e);
      setModalVisible1(true);
    }
  }

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex items-center gap-2 justify-between">
        <div className="text-primary text-3xl font-semibold">League Standings</div>
        <div className="flex items-center gap-4">
          <p className="font-bold text-primary">League: </p>
          <Dropdown
            placeholder="Select League"
            className="rounded-lg w-[300px]"
            value={activeLeague}
            onChange={(e) => setActiveLeague(e.value)}
            options={leagues}
            optionLabel="name"
          />
        </div>
      </div>
      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
        <Table columns={columns} data={activeLeague && activeLeague.participants || []} scrollHeight="100%" paginator={false}
          actions={false} customActions={customActions}
          selectionMode="single" handleOnSelect={handleOnSelect}
        />

      <BetHistoryModal 
        visible={modalVisible} data={modalData}
        onHide={handleModalOnHide} columns={betsColumn}
        scrollable={false} scrollHeight="100%" handleOnSelect={handleOnSelect1}
      />

      <BetHistoryModal 
        visible={modalVisible1} data={modalData1}
        onHide={handleModalOnHide1} columns={betsColumn.filter(d => (d.field !== "actions" && d.field !== "wager_amount" && d.field !== "") )}
        scrollable={false} scrollHeight="100%"
        classname="lg:w-1/2" handleOnSelect={handleOnSelect1}
      />
      
      </div>
    </div>
  );
}

export default LeagueStandings;