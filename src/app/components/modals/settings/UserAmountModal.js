import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { useAxios } from "../../../contexts/AxiosContext";
import { useToast } from "../../../contexts/ToastContext";

const UserAmountModal = ({
  visible = false,
  header = "Set Escrowed and Total Budget",
  auctionId,
  onHide,
  onSuccess,
  data = null
}) => {
  const showToast = useToast();
  const axiosService = useAxios();

  const [newData, setNewData] = useState({
    escrowed_amount: null,
    total_budget: null,
    user_id: 0
  });

  useEffect(() => {
    if(data){
      setNewData(data);
    }
  }, [data])

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if(auctionId){
      axiosService
      .post(`/api/auctions/${auctionId}/set-amounts`, newData)
      .then((response) => {
        showToast({
          severity: response.data.status ? "success" : "error",
          summary: response.data.status ? "Success!" : "Error!",
          detail: response.data.message,
        });
        onSuccess();
        onHide();
      })
      .catch((error) => {
        console.log(error);
      });
    }
    
  };
  
  return (
    <Dialog className="lg:w-1/3 w-[95%]" header={header} visible={visible} draggable={false} maximizable={false} onHide={onHide}>
      <form onSubmit={handleSubmit} className="grid gap-4">
        
        <div className="flex flex-col">
          <label className="font-semibold">Escrowed Amount</label>
          <InputText 
            keyfilter={'num'}
            placeholder="∞" 
            value={newData.escrow_amount}
            onChange={(e) => setNewData((prev) => ({
              ...prev,
              escrow_amount: e.target.value
            }))} 
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold">Total Budget</label>
          <InputText 
            keyfilter={'num'}
            placeholder="∞" 
            value={newData.total_budget}
            onChange={(e) => setNewData((prev) => ({
              ...prev,
              total_budget: e.target.value
            }))} 
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" label="Update" icon="pi pi-check" className="rounded-lg border-primaryS bg-primaryS" />
        </div>
      </form>
    </Dialog>
  );
};

export default UserAmountModal;