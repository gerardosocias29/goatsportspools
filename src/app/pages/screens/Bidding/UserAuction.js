import { useEffect, useReducer, useRef, useState } from "react";
import { useAxios } from "../../../contexts/AxiosContext";
import { useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";

const UserAuction = ({ channel, auctionId, currentUser }) => {
  const axiosService = useAxios();
  const [event, setEvent] = useState();
  const navigate = useNavigate();
  
  useEffect(() => {
    if(auctionId){
      axiosService
      .get(`/api/auctions/${auctionId}/join`);

      axiosService
      .get(`/api/auctions/${auctionId}/get-by-id`)
        .then((response) => {
          setEvent(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }

    const handleUnload = () => {
      const url = `${process.env.REACT_APP_API_URL}/api/auctions/${auctionId}/${currentUser.id}/leave`;
      console.log("Sending beacon to:", url);
      navigator.sendBeacon(url);
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);

  }, [auctionId])

  const [activeItem, setActiveItem] = useState();
  const handleActiveItem = (data) => {
    console.log("active-item-event", data)
    setActiveItem(data.data);
  }

  useEffect(() => {
    if (channel) {
      channel.bind("active-item-event", handleActiveItem);
    }

    return () => {
      if (channel) {
        channel.unbind("active-item-event");
      }
    };
  }, [channel]);


  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="text-primary text-3xl font-semibold flex gap-5 items-center">
        <i className="pi pi-arrow-left text-xl cursor-pointer" onClick={() => {
          axiosService.post(`/api/auctions/${auctionId}/${currentUser.id}/leave`);
          navigate("/main?page=ncaa-basketball-auction");
        }}></i>
        {event?.name}
      </div>

      <div className="w-full p-5 bg-white rounded-lg flex flex-col lg:flex-row gap-5">
        <div className="lg:w-1/2 flex flex-col gap-2 relative">
          {/* Livestream */}
          <h2 className="text-2xl font-bold">Live Stream</h2>
          <ReactPlayer 
            url={event && event.stream_url} playIcon={false} controls={false} playing={true} width="100%" 
            height="100%" 
            style={{ aspectRatio: '16/9' }}
          />
          <div
            className="absolute top-0 left-0 w-full h-full"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="lg:w-1/2 flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Item on Bid</h2>
          <p className="text-xl">{activeItem?.name || "No active item on bid yet."}</p>
          <Button
            type="button"
            label="Bid $1"
            className="bg-background border-none rounded-lg ring-0"
          />
          <div className="flex gap-2 items-center">
            <InputNumber inputClassName="w-3/4" placeholder="Custom Bid Amount"/>
            <Button
              type="button"
              label="Submit"
              className="w-1/4 bg-backgroundS border-none rounded-lg ring-0"
            />
          </div>

          <div className="flex gap-2 items-center">
            <i className="pi pi-verified"></i>
            <p>You are winning this item.</p>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default UserAuction;