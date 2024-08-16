import { useEffect, useState } from "react";
import { useAxios } from "../../contexts/AxiosContext";
import { Dropdown } from "primereact/dropdown";
import Table from "../../components/tables/Table";

const LeagueStandings = ({currentUser}) => {
  const axiosService = useAxios();
  const [activeLeague, setActiveLeague] = useState();
  const [leagues, setLeagues] = useState();

  const columns = [
    { field: 'rank', header: 'Rank' },
    { field: 'name', header: 'Name' },
    { field: 'email', header: 'Email' },
    { field: 'pivot.balance', header: 'Balance', headerStyle: { textAlign: "right" } }
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

  useEffect(() => {
    getLeagues();
  }, []);

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
        <Table columns={columns} data={activeLeague && activeLeague.participants || []} scrollHeight="100%" paginator={false}/>
      </div>
    </div>
  );
}

export default LeagueStandings;