import moment from "moment";
import LazyTable from "../../components/tables/LazyTable";
import { decimalToMixedFraction } from "../../utils/numberFormat";
import convertUTCToTimeZone from "../../utils/utcToTimezone";
import { Button } from "primereact/button";
import BetHistoryModal from "../../components/modals/BetHistoryModal";
import { useEffect, useState } from "react";
import { useAxios } from "../../contexts/AxiosContext";

const BetHistory = () => {
  const axiosService = useAxios();
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
      const { wager_amount, wager_win_amount } = rowData.bet_group;
      return <p className="text-center font-bold">${Number(wager_amount).toFixed(2)} / ${Number(wager_win_amount).toFixed(2)}</p>
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
    return <p>NFL [{gameID}] <span className="font-bold">{team?.name} {pointsLabel}</span> {totalLabel}</p>
  }

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);
  const handleModalOnHide = () => {
    setModalVisible(false);
    setModalData([]);
  }

  const handleViewBetsClick = (rowData) => {
    // console.log(rowData.bet_group.bets);
    setModalData(rowData.bet_group.bets);
    setModalVisible(true);
  }

  const ActionsTemplate = (value, rowData) => {
    if(rowData.bet_group != null){
      return <div className="flex justify-center">
        <Button className="text-white bg-primaryS rounded-lg ring-0 text-sm" icon="pi pi-eye" text aria-label="View" label="View Bets" 
          onClick={(e) => handleViewBetsClick(rowData) }
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
    { field: '', header: 'Win/Loss Amount', headerClassName: 'w-[120px]', template: WinLossTemplate, hasTemplate: true },
    { field: 'wager_result', header: 'Result', headerClassName: 'w-[130px]', template: ResultTemplate, hasTemplate: true },
    { field: 'created_at', header: 'Date Placed', headerClassName: 'w-[130px]', template: DatePlaceTemplate, hasTemplate: true },
    { field: 'actions', header: 'Actions', headerClassName: 'w-[200px]', template: ActionsTemplate, hasTemplate: true },
  ];

  const [amountAtRisk, setAmountAtRisk] = useState(0.00);
  const [totalBalance, setTotalBalance] = useState(0.00);
  const fetchAmountAtRisk = () => {
    axiosService.get('/api/bets/amount-at-risks').then((response) => {
      setAmountAtRisk(response.data.at_risk);
      setTotalBalance(response.data.total_balance);
    });
  }

  useEffect(() => {
    fetchAmountAtRisk();
  }, [])

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="text-primary text-3xl font-semibold">Bet History</div>
      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
        <div className="grid lg:grid-cols-6 gap-4">
          <div className="border rounded-lg p-4 border-lightgray shadow-lg border-[1px]">
            <div className="flex justify-between mb-3 relative">
              <div className="w-full flex flex-col gap-1">
                <span className="text-500 text-sm font-medium mb-3">Amount at Risk</span>
                <div className="flex gap-4 w-full justify-center px-2">
                  <div>
                    <div className="flex flex-col items-center text-red-500">
                      <p className="text-2xl text-center">{Number(amountAtRisk).toFixed(2) || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0">
                <div className="flex flex-row items-center justify-center rounded-lg p-3 border-[2px]">
                  <i className="pi pi-dollar text-sm"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4 border-lightgray shadow-lg border-[1px]">
            <div className="flex justify-between mb-3 relative">
              <div className="w-full flex flex-col gap-1">
                <span className="text-500 text-sm font-medium mb-3">Total Balance</span>
                <div className="flex gap-4 w-full justify-center px-2">
                  <div>
                    <div className="flex flex-col items-center text-green-500">
                      <p className="text-2xl text-center">{Number(totalBalance).toFixed(2) || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0">
                <div className="flex flex-row items-center justify-center rounded-lg p-3 border-[2px]">
                  <i className="pi pi-dollar text-sm"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
        <LazyTable
          api={'/api/bets'}
          columns={betsColumn} 
          hasOptions={true}
        />
      </div>

      <BetHistoryModal 
        visible={modalVisible} data={modalData}
        onHide={handleModalOnHide} columns={betsColumn.filter(d => (d.field !== "actions" && d.field !== "wager_amount" && d.field !== "") )}
      />
    </div>
  );
}

export default BetHistory;