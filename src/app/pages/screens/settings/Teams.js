import { useEffect, useState } from "react";
import { useAxios } from "../../../contexts/AxiosContext";
import Table from "../../../components/tables/Table";

const Teams = () => {
  const axiosService = useAxios();

  const [teams, setTeams] = useState();
  const getTeams = () => {
    axiosService.get('/api/teams/all').then((response) => {
      console.log(response.data);
      setTeams(response.data);
    }).catch((error) => {
      console.log(error);
    });
  }

  const imageTemplate = (value, data, field) => {
    return (
      <>
        <div className="p-2 flex justify-center">
          <div className="flex items-center gap-2 border rounded-lg shadow-md px-4 w-[250px]" style={{
            backgroundImage: `url(${data.team.background_url})`,
            backgroundSize: 'cover', // Ensures the image covers the entire div
            backgroundPosition: 'center', // Centers the image within the div
          }}>
            <img src={data.team.image_url} alt={data.team.name} className="w-[50px]"/>
            <p className="font-bold text-white select-none">{data.team.name}</p>
          </div>
        </div>
      </>
    );
  }

  const columns = [
    { field: '', header: 'Team Name', template: imageTemplate, hasTemplate: true, headerStyle: { width: "40%" }},
    { field: 'team.code', header: 'Code', headerStyle: {textAlign: "center", width: "20%"}},
    { field: 'standings', header: 'Win - Lose - Tie', headerStyle: {textAlign: "center"}},
  ];
  
  useEffect(() => {
    getTeams();
  }, []);

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex items-center gap-2 justify-between">
        <div className="text-primary text-3xl font-semibold">Teams</div>
      </div>
      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
        <Table columns={columns} data={teams} scrollHeight="100%" paginator={false}/>
      </div>
    </div>
  )
}

export default Teams;