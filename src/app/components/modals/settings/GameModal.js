import { Dialog } from "primereact/dialog";
import { useEffect, useState } from "react";
import { useAxios } from "../../../contexts/AxiosContext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { useToast } from "../../../contexts/ToastContext";
import convertUTCToTimeZone from "../../../utils/utcToTimezone";

const GameModal = ({
  visible = false, 
  onHide,
  onSuccess,
  data,
  type = 'add'
}) => {
  const axiosService = useAxios();
  const showToast = useToast();
  const initialGameData = {
    game_datetime: null,
    home_team: '',
    visitor_team: '',
    favored_spread: '',
    underdog_spread: '',
    favored_ml: '',
    underdog_ml: '',
    over_total: '',
    under_total: '',
    favored_team: '',
    underdog_team: '',
  }
  const [game, setGame] = useState(initialGameData);
  const [selectedTeams, setSelectedTeams] = useState([]);

  const handleOnHide = () => {
    onHide();
    setGame(initialGameData);
    setSaveLoading(false);
  }

  const [saveLoading, setSaveLoading] = useState(false);
  const handleSubmit = () => {
    setSaveLoading(true);
    axiosService.post('/api/games/create', game).then((response) => {
      showToast({
        severity: response.data.status ? 'success' : 'error',
        summary: response.data.status ? 'Success!' : 'Unable to Complete!',
        detail: response.data.message
      });
      if(response.data.status){
        if(onSuccess){
          onSuccess();
        }
      }
      handleOnHide();
      setSaveLoading(false);
    }).catch((error) => {
      console.log(error);
      setSaveLoading(false);
    });
  }

  const handleUpdate = () => {
    setSaveLoading(true);
    axiosService.post('/api/games/update/' + data.id, game).then((response) => {
      showToast({
        severity: response.data.status ? 'success' : 'error',
        summary: response.data.status ? 'Success!' : 'Unable to Complete!',
        detail: response.data.message
      });
      if(response.data.status){
        if(onSuccess){
          onSuccess();
        }
      }
      handleOnHide();
      setSaveLoading(false);
    }).catch((error) => {
      console.log(error);
      setSaveLoading(false);
    });
  }

  const [teams, setTeams] = useState([]);
  const getTeams = () => {
    axiosService.get('/api/teams').then((response) => {
      setTeams(response.data);
    });
  }

  const updateSelectedTeams = () => {
    const filteredTeams = teams.filter(team =>
      team.name === game.favored_team.name || team.name === game.underdog_team.name
    );
    setSelectedTeams(filteredTeams);
  }

  useEffect(() => {
    if (visible && type === 'update' && data) {
      setGame({
        game_datetime: new Date(convertUTCToTimeZone(data.game_datetime)),
        visitor_team: data.visitor_team,
        favored_spread: data.odd.favored_points,
        underdog_spread: data.odd.underdog_points,
        favored_ml: data.odd.favored_ml,
        underdog_ml: data.odd.underdog_ml,
        over_total: data.odd.over_total,
        under_total: data.odd.under_total,
        favored_team: data.odd.favored_team,
        underdog_team: data.odd.underdog_team,
        home_team: data.home_team,
      });
    } else if (visible && type === 'add') {
      setGame(initialGameData);
    }
  }, [visible, type, data]);

  useEffect(() => {
    updateSelectedTeams();
  }, [game.favored_team, game.underdog_team]);

  useEffect(() => {
    if(visible){
      getTeams();
    }
  }, [visible]);

  const handleInputChange = (value, target) => {
    setGame((prevState) => ({
        ...prevState,
        [target]: value
    }));
  };

  const itemTemplate = (game) => {
    return <div className="flex items-center gap-2 border rounded-lg shadow-md px-4 min-w-[250px]" style={{
      backgroundImage: `url(${game?.background_url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <img src={game?.image_url} alt={game?.name} className="w-[50px]"/>
      <p className="font-bold text-white select-none">{game?.name}</p>
    </div>
  }

  const valueTemplate = (game, props) => {
    if(game){
      return <div className="flex items-center gap-2 rounded-lg min-w-[250px]">
        <img src={game?.image_url} alt={game?.name} className="w-[30px]"/>
        <p className="font-bold text-label select-none">{game?.name}</p>
      </div>
    }

    return <span>{props.placeholder}</span>;
  }

  const footer = () => {
    return (
      <>
        <div className="flex justify-end items-center">
          {
            type === "add" ? <Button loading={saveLoading} label="Create Game" className="rounded-lg border-none ring-0 bg-primaryS text-white" onClick={handleSubmit}/> :
            <Button loading={saveLoading} label="Update Game" className="rounded-lg border-none ring-0 bg-primaryS text-white" onClick={handleUpdate}/>
          }
          
        </div>
      </>
    )
  }

  return <Dialog className="lg:w-1/2 w-[95%]" footer={footer} header={`${type === "add" ? 'Create' : 'Update'} Game`} visible={visible} draggable={false} maximizable={false} onHide={handleOnHide}>
    <form onSubmit={(e) => {e.preventDefault()}}>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="font-semibold">Game Date & Time</label>
          <Calendar minDate={new Date(new Date().setMonth(new Date().getMonth() - 1))} placeholder="MM/DD/YYYY HH:mm" value={game.game_datetime} 
            onChange={(e) => handleInputChange(e.value, 'game_datetime')} showTime hourFormat="24"
            showButtonBar stepMinute={1}
          />
        </div>
        <div></div>
        <div className="border rounded-lg shadow-md flex flex-col gap-2 p-5">
          <div className="flex flex-col gap-1">
            <label className="font-semibold">Favored Team</label>
            <Dropdown value={game.favored_team} onChange={(e) => handleInputChange(e.value, 'favored_team')} 
              options={teams.filter(team =>
                team.name !== game.underdog_team.name
              )} 
              optionLabel="name" placeholder="Select a Team" 
              filter valueTemplate={valueTemplate} itemTemplate={itemTemplate} className="w-full" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold">Spread</label>
            <InputNumber minFractionDigits={1} value={game.favored_spread} onValueChange={(e) => handleInputChange(e.value, 'favored_spread')} useGrouping={false} placeholder="e.g 8 or -8"/>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold">Money Line</label>
            <InputNumber minFractionDigits={1} value={game.favored_ml} onValueChange={(e) => handleInputChange(e.value, 'favored_ml')} useGrouping={false} placeholder="e.g 150 or -120"/>
          </div>
        </div>
        
        <div className="border rounded-lg shadow-md flex flex-col gap-2 p-5">

          <div className="flex flex-col gap-1">
            <label className="font-semibold">Underdog Team</label>
            <Dropdown value={game.underdog_team} onChange={(e) => handleInputChange(e.value, 'underdog_team')} 
              options={teams.filter(team =>
                team.name !== game.favored_team.name
              )}
              optionLabel="name" placeholder="Select a Team" 
              filter valueTemplate={valueTemplate} itemTemplate={itemTemplate} className="w-full" />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="font-semibold">Underdog Spread</label>
            <InputNumber minFractionDigits={1} value={game.underdog_spread} onValueChange={(e) => handleInputChange(e.value, 'underdog_spread')} useGrouping={false} placeholder="e.g 8 or -8"/>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold">Underdog Money Line</label>
            <InputNumber minFractionDigits={1} value={game.underdog_ml} onValueChange={(e) => handleInputChange(e.value, 'underdog_ml')} useGrouping={false} placeholder="e.g 120 or -150"/>
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="font-semibold">Total Points Over</label>
          <InputNumber minFractionDigits={1} value={game.over_total} onValueChange={(e) => handleInputChange(e.value, 'over_total')} useGrouping={false} placeholder="e.g 45"/>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-semibold">Total Points Under</label>
          <InputNumber minFractionDigits={1} value={game.under_total} onValueChange={(e) => handleInputChange(e.value, 'under_total')} useGrouping={false} placeholder="e.g 45"/>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-semibold">Home Team</label>
            <Dropdown value={game.home_team} onChange={(e) => handleInputChange(e.value, 'home_team')} 
              options={selectedTeams} // filtered teams based on selected values of favored_team and underdog_team
              optionLabel="name" placeholder="Select a Home Team" 
              filter valueTemplate={valueTemplate} itemTemplate={itemTemplate} className="w-full" />
        </div>
        
      </div>
    </form>
  </Dialog>
}


export default GameModal;