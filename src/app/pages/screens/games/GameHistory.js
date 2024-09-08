import { useEffect, useState } from "react";
import Table from "../../../components/tables/Table"
import { useAxios } from "../../../contexts/AxiosContext";
import convertUTCToTimeZone from "../../../utils/utcToTimezone";
import { TeamTemplateWithScores } from "./NFLTemplates";

const GameHistory = () => {

  const axiosService = useAxios();

  const BetDateTemplate = (value, game, field) => {
    return <div className="text-center">{convertUTCToTimeZone(value, 'MMM DD hh:mmA')}</div>
  }

  const StatusTemplate = (value, game, field) => {
    return <div className="text-center">{game.home_team_score === 0 && game.visitor_team_score === 0 ? 'Pending Scores' : 'Completed'}</div>
  }

  const columns = [
    { field: 'game_datetime', header: 'Game Date', template: BetDateTemplate, hasTemplate: true, headerClassName: 'w-[200px]', headerStyle: { minWidth: '120px' } },
    { field: 'team', header: 'Team', template: TeamTemplateWithScores, hasTemplate: true, headerStyle: { minWidth: '400px' } },
    { field: 'status', header: 'Status', template: StatusTemplate, hasTemplate: true},
  ];


  const [recentGames, setRecentGames] = useState([]);
  const getRecentGames = () => {
    axiosService.get('/api/games/recent').then((response) => {
      setRecentGames(response.data)
    })
    .catch((error) => {
      console.log(error)
    });
  }

  useEffect(() => {
    getRecentGames()
  }, []);

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex items-center gap-2 justify-between">
        <div className="text-primary text-3xl font-semibold">Game History</div>
      </div>
      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
        <Table columns={columns} data={recentGames} scrollHeight="100%" paginator={false}/>
      </div>
    </div>
  )
}

export default GameHistory