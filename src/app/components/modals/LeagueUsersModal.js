import { Dialog } from "primereact/dialog";
import Table from "../tables/Table";
import { Button } from "primereact/button";
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { useToast } from "../../contexts/ToastContext";
import { useState } from "react";
import { useAxios } from "../../contexts/AxiosContext";

export default function LeagueUsersModal({
  visible = false,
  onHide,
  onSuccess,
  data = []
}) {
  const showToast = useToast();
  const axiosService = useAxios();
  const [rebuyLoading, setRebuyLoading] = useState(false);
  const acceptRebuy = (league_id, user_id) => {
    setRebuyLoading(true);
    showToast({ severity: 'info', summary: 'Updating!', detail: 'Please wait!', life: 1000 });
    const postData = {
      league_id: league_id,
      user_id: user_id,
    }
    axiosService.post('/api/leagues/rebuy', postData).then((response) => {
      if(response.data.status){
        onSuccess();
      }
      showToast({
        severity: response.data.status ? 'success' : 'error',
        summary: response.data.status ? 'Success!' : 'Failed!',
        detail: response.data.message
      });
      setRebuyLoading(false);
    }).catch((error) => {
      console.log(error);
      setRebuyLoading(false);
      showToast({ severity: 'error', summary: 'Failed!', detail: 'Rebuy unsuccessful!' });
    });
    
  }

  const handleOnHide = () => {
    onHide();
    setRebuyLoading(false)
  }

  const handleActionsClick = (id, type, data) => {
    if(type==="rebuy"){
      confirmPopup({
        tagKey: 'ASDKJAHSDKB',
        message: `Are you sure you're rebuying $30,000.00 for ${data.user.name}?`,
        icon: 'pi pi-info-circle',
        acceptClassName: 'ring-0 bg-primary rounded-lg border-primary',
        accept: () => { acceptRebuy(data.league_id, data.user.id) }
      });


    }
  }

  const customActions = (data) => {
    return (
      <div className="flex justify-end gap-1">
        <Button loading={rebuyLoading} className="text-white border-primaryS bg-primaryS ring-0 rounded-lg text-sm" icon="pi pi-dollar text-sm" tooltip="Rebuy" label="Rebuy" data-pr-position="top" onClick={(e) => handleActionsClick(data.id, 'rebuy', data) }/>
      </div>
    )
  }

  const UserNameTemplate = (value) => {
    return <div className="flex items-center justify-center">
      {value}
    </div>
  }

  const RebuyTemplate = (value = []) => {
    return <div className="flex items-center justify-center">
      {value}
    </div>
  } 

  return (
    <>
      <Dialog className="lg:w-1/2 w-[95%]" header={'League Users'} visible={visible} draggable={false} maximizable={false} onHide={handleOnHide}>
        <ConfirmPopup tagKey="ASDKJAHSDKB" />
        <Table data={data.league_users} 
          hasOptions={true}
          columns={[
            {field: 'user.name', header: 'User', template: UserNameTemplate, hasTemplate: true, headerStyle: { minWidth: '200px' }},
            {field: 'balance', header: 'Balance', template: UserNameTemplate, hasTemplate: true, headerStyle: { minWidth: '150px' }},
            {field: 'rebuys', header: 'Rebuy Count', template: RebuyTemplate, hasTemplate: true, headerStyle: { minWidth: '50px' }},
          ]} 
          actions={true} customActions={customActions}
          paginator={false}
          scrollable={true} scrollHeight="450px"
        />        
      </Dialog>
    </>
  );
}