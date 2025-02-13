import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useState } from "react";
import { useAxios } from "../../../contexts/AxiosContext";
import { useToast } from "../../../contexts/ToastContext";

const SetStreamUrlDialog = ({
  visible = false,
  header = "Set Stream URL",
  auctionId,
  onHide,
  onSuccess,
}) => {
  const showToast = useToast();
  const axiosService = useAxios();
  const [streamUrl, setStreamUrl] = useState("https://www.youtube.com/watch?v=DPsyuvBom5k");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      new URL(streamUrl); // Validate URL format
    } catch (_) {
      showToast({
        severity: "error",
        summary: "Invalid URL",
        detail: "Please enter a valid stream URL.",
      });
      return;
    }
  
    axiosService
      .post(`/api/auctions/${auctionId}/set-stream-url`, { stream_url: streamUrl })
      .then((response) => {
        if(!response.data.status) {
          showToast({
            severity: response.data.status ? "success" : "error",
            summary: response.data.status ? "Success!" : "Error!",
            detail: response.data.message,
          });
        }
        onSuccess();
        onHide();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  
  return (
    <Dialog className="lg:w-1/3 w-[95%]" header={header} visible={visible} draggable={false} maximizable={false} onHide={onHide}>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="flex flex-col">
          <label className="font-semibold">Stream URL</label>
          <InputText required value={streamUrl} placeholder="Livestream Link e.g Youtube or Twitch" onChange={(e) => setStreamUrl(e.target.value)} />
        </div>

        <div className="flex justify-end">
          <Button type="submit" label="Start Auction" icon="pi pi-check" className="rounded-lg border-primaryS bg-primaryS" />
        </div>
      </form>
    </Dialog>
  );
};

export default SetStreamUrlDialog;