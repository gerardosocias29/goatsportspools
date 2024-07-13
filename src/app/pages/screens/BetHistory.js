import moment from "moment";
import LazyTable from "../../components/tables/LazyTable";
import { decimalToMixedFraction } from "../../utils/numberFormat";
import convertUTCToTimeZone from "../../utils/utcToTimezone";

const BetHistory = () => {

  const TicketNumberTemplate = (value) => {
    return <p className="text-center">{value.toUpperCase()}</p>
  }

  const GameDateTemplate = (value) => {
    return <p className="text-center">{convertUTCToTimeZone(value, 'MMM DD hh:mmA')}</p>
  }

  const RiskWinTemplate = (value, rowData, field) => {
    return <p className="text-center font-bold">${Number(rowData.wager_amount).toFixed(2)} / ${Number(rowData.wager_win_amount).toFixed(2)}</p>
  }

  const WinLossTemplate = (value, rowData, field) => {
    const amount = rowData.wager_result === "win" ? "$" + Number(rowData.wager_win_amount).toFixed(2) : (rowData.wager_result === "lose" ? "-$" +Number(rowData.wager_amount).toFixed(2) : '-')
    return <p className="text-center font-bold">{amount}</p>
  }

  const ResultTemplate = (value) => {
    return <p className={`rounded-lg text-center text-sm tracking-wide p-2 ${value === "win" ? 'text-green-500' : (value === "lose" ? 'text-red-500' : 'bg-gray-200')}`}>{value?.toUpperCase()}</p>
  }

  const DatePlaceTemplate = (value) => {
    return <p className="text-center">{moment(value).format('DD/MM/YYYY hh:mmA')}</p>
  }

  const DescriptionTemplate = (value, rowData, field) => {
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

    const pointsLabel = rowData.wager_type_id === 2 ? ( rowData.team_id === 0 ? `TOTAL o${rowData.picked_odd}` : `TOTAL u${rowData.picked_odd}`) : rowData.wager_type_id === 3 ? `[${rowData.picked_odd}]` : `[${decimalToMixedFraction(rowData.picked_odd)}]`;
    const totalLabel = ( `(${favoredTeamNickname} - ${favoredTeamScore} vs. ${underdogTeamNickname} - ${underdogTeamScore})`);
    return <p>NFL [{gameID}] <span className="font-bold">{team?.name} {pointsLabel}</span> {totalLabel}</p>
  }

  const betsColumn = [
    { field: 'ticket_number', header: 'Ticket #', headerClassName: 'w-[120px]', template: TicketNumberTemplate, hasTemplate: true },
    { field: 'wager_type.name', header: 'Type', headerClassName: 'w-[120px]', template: TicketNumberTemplate, hasTemplate: false },
    { field: 'game.game_datetime', header: 'Game Date', headerClassName: 'w-[100px]', template: GameDateTemplate, hasTemplate: true },
    { field: 'team.name', header: 'Description', headerClassName: 'w-[450px]', template: DescriptionTemplate, hasTemplate: true },
    { field: 'wager_amount', header: 'Risk/Win', headerClassName: 'w-[130px]', template: RiskWinTemplate, hasTemplate: true },
    { field: '', header: 'Win/Loss Amount', headerClassName: 'w-[120px]', template: WinLossTemplate, hasTemplate: true },
    { field: 'wager_result', header: 'Result', headerClassName: 'w-[130px]', template: ResultTemplate, hasTemplate: true },
    { field: 'created_at', header: 'Date Placed', headerClassName: 'w-[130px]', template: DatePlaceTemplate, hasTemplate: true },
  ];

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="text-primary text-3xl font-semibold">Bet History</div>
      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
        <div className="grid lg:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4 border-lightgray shadow-lg border-[1px] border-l-[5px] border-l-red-500">
            <div className="flex justify-between mb-3">
              <div className="w-full">
                <span className="text-500 font-medium mb-3">Amount at Risk</span>
                <div className="flex gap-4 w-full justify-center px-2">
                  <div>
                    <div className="flex flex-col items-center text-red-500">
                      <p className="text-4xl text-center">{0}</p>
                      <span className="text-sm min-w-[60px] text-center font-bold">Risking</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex flex-row items-center justify-center rounded-lg p-3 border-[2px]">
                  <i className="pi pi-dollar text-xl"></i>
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
    </div>
  );
}

export default BetHistory;