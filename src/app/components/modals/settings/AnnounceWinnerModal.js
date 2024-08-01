import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { useState } from "react";
import { useAxios } from "../../../contexts/AxiosContext";
import { useToast } from "../../../contexts/ToastContext";

const AnnounceWinnerModal = ({
  visible = false, 
  header = "Announce Winner",
  onHide,
  onSuccess,
  data,
}) => {
  const showToast = useToast();
  const axiosService = useAxios();
  const [homeTeamScore, setHomeTeamScore] = useState();
  const [visitorTeamScore, setVisitorTeamScore] = useState();

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSend = {
      game_id: data.id,
      home_team_score: homeTeamScore,
      visitor_team_score: visitorTeamScore,
    }

    axiosService.post('/api/games/announce-winner', dataToSend).then((response) => {
      showToast({
        severity: response.data.status ? 'success' : 'error',
        summary: response.data.status ? 'Success!' : 'Failed!',
        detail: response.data.message
      });
      handleOnHide();
    }).catch((error) => {
      console.log(error);
    });
  }

  const handleOnHide  = () => {
    setHomeTeamScore();
    setVisitorTeamScore();
    onHide();
}

  return <Dialog className="lg:w-1/4 w-[95%]" header={header} visible={visible} draggable={false} maximizable={false} onHide={handleOnHide}>
    <form onSubmit={handleSubmit}>
      <div className="grid lg:grid-cols-1 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="home_team_score" className="font-semibold">{data && data.home_team.name} Score</label>
          <InputNumber required useGrouping={false} id="home_team_score" value={homeTeamScore} placeholder={`${data && data.home_team.name} Score`} onChange={(e) => setHomeTeamScore(e.value)} className="text-sm"/>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="visitor_team_score" className="font-semibold">{data && data.visitor_team.name} Score</label>
          <InputNumber required useGrouping={false} id="visitor_team_score" value={visitorTeamScore} placeholder={`${data && data.visitor_team.name} Score`} onChange={(e) => setVisitorTeamScore(e.value)} className="text-sm"/>
        </div>

        <div className="flex justify-end">
          <Button type="submit" label="Submit Scores" icon="pi pi-trophy" className="rounded-lg border-primaryS bg-primaryS" />
        </div>
      </div>
    </form>
  </Dialog>
}

export default AnnounceWinnerModal;