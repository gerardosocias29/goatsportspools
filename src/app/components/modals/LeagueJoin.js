import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Password } from "primereact/password";
import { useState } from "react";
import { useAxios } from "../../contexts/AxiosContext";
import { useToast } from "../../contexts/ToastContext";
import { InputText } from "primereact/inputtext";

export default function LeagueJoin({
  visible = false, 
  header = "Join A League",
  onHide,
  onSuccess,
  currentUser,
  data
}) {
  const axiosService = useAxios();
  const showToast = useToast();

  const handleOnHide  = () => {
    setPassword('');
    setLeagueId('');
    onHide();
  }

  const [password, setPassword] = useState();
  const [leagueId, setLeagueId] = useState(data && data.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    const postData = {
      password: password,
      league_id: (data && data.id) ? data.id : leagueId
    }
    axiosService.post('/api/leagues/join', postData).then((response) => {
      if(response.data.status){
        showToast({
          severity: 'success',
          summary: 'Success',
          detail: response.data.message,
        });
        if(onSuccess){
          onSuccess();
        }
        handleOnHide();
      } else {
        showToast({
          severity: 'error',
          summary: 'Failed',
          detail: response.data.message,
        });
      }
    }).catch((error) => {
      console.log(error);
    });
    console.log(postData);
  }

  return (
    <>
      <Dialog className="lg:w-1/4 w-[95%]" header={(data && data.name) ? `Joining ${data.name}` : header} visible={visible} draggable={false} maximizable={false} onHide={handleOnHide}>
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-1 gap-4">
            { 
              data && data.name &&
              <div className="text-center">
                <p>To join <b>{data && data.name}</b>, you need a password.</p>
                <p>Enter the password below:</p>
              </div>
            }
            
            {
              data && !data.id && (
                <>
                  <div className="text-center">
                    <p>To join a league, you need a <b>League ID</b> and <b>Password</b>.</p>
                    <p>Enter the <b>League ID</b> and <b>Password</b> below:</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="league_id" className="font-semibold">League ID</label>
                    <InputText required id="league_id" autoComplete="new-username" value={leagueId} className="w-full text-sm" placeholder="XXXXX-XXX-XXXXX" onChange={(e) => setLeagueId(e.target.value)}/>
                </div>
                </>
              )
            }
            
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="font-semibold">Password</label>
              <Password required id="password" autoComplete="new-password" value={password} inputClassName="w-full" placeholder="Password" toggleMask={false} feedback={false} onChange={(e) => setPassword(e.target.value)} className="text-sm"/>
            </div>

            <div className="flex justify-end">
              <Button type="submit" label="Join League" icon="pi pi-trophy" className="rounded-lg border-primaryS bg-primaryS" />
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
}