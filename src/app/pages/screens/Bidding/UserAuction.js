import { useEffect, useState } from "react";
import { useAxios } from "../../../contexts/AxiosContext";
import { useNavigate } from "react-router-dom";

const UserAuction = ({ channel, auctionId }) => {
  const axiosService = useAxios();
  const [event, setEvent] = useState();
  const navigate = useNavigate();
  
  useEffect(() => {
    if(auctionId){
      axiosService
      .get(`/api/auctions/${auctionId}/get-by-id`)
        .then((response) => {
          setEvent(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [auctionId])

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="text-primary text-3xl font-semibold flex gap-5 items-center">
        <i className="pi pi-arrow-left text-xl cursor-pointer" onClick={() => {
          navigate("/main?page=ncaa-basketball-auction");
        }}></i>
        {event?.name}
      </div>

    </div>
  );
}

export default UserAuction;