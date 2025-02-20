import React, { useState, useEffect, useRef } from "react";
import Pusher from "pusher-js";
import ReactPlayer from "react-player";
import PlaceBid from "./PlaceBid";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useAxios } from "../../../contexts/AxiosContext";
import moment from "moment";
import convertUTCToTimeZone from "../../../utils/utcToTimezone";
import { useNavigate } from "react-router-dom";

const AdminBidding = ({pusher, channel, auctionId}) => {
  const axiosService = useAxios();
  const navigate = useNavigate();
  const [auctionData, setAuctionData] = useState();
  const [auctionMembers, setAuctionMembers] = useState();

  const [hasStarted, setHasStarted] = useState(false);
  const [activeItem, setActiveItem] = useState();
  
  const [bids, setBids] = useState([]);
  const [recentBid, setRecentBid] = useState(null);
  const [highestBid, setHighestBid] = useState(null);
  const [liveStreamUrl, setLiveStreamUrl] = useState("https://www.youtube.com/watch?v=DPsyuvBom5k");

  useEffect(() => {
    if (channel) {
      channel.bind("new-bid", (data) => {
        setBids((prevBids) => [...prevBids, data]);
        if (!highestBid || data.amount > highestBid.amount) {
          setHighestBid(data);
        }
      });

      channel.bind("auction-members", (data) => {
        console.log("auction-members::", data)
        axiosService
        .get(`/api/auctions/${auctionId}/members`)
          .then((response) => {
            setAuctionMembers(response.data);
          })
          .catch((error) => {
            console.log(error);
          });
      });
    }

    return () => {
      if (channel) {
        channel.unbind("new-bid");
        channel.unbind("auction-members");
      }
    };
  }, [channel, highestBid]);

  useEffect(() => {
    if (bids.length > 0) {
      setRecentBid(bids[bids.length - 1]);
      setTimeout(() => {
        setRecentBid(null); // Reset recent bid opacity after 2 seconds
      }, 2000); // 2 seconds
    }
  }, [bids]);

  useEffect(() => {
    if(auctionId){
      axiosService
      .get(`/api/auctions/${auctionId}/get-by-id`)
        .then((response) => {
          setAuctionData(response.data);
          setAuctionMembers(response.data.joined_users)
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [auctionId])

  const handleStart = () => {
    setHasStarted(true);
    if(activeItem && activeItem.id){
      axiosService.get(`/api/auctions/${auctionId}/${activeItem.id}/set-active-item`)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
    }
  }

  return (
    <div className="p-6 min-h-screen">
      <div className="flex gap-4 items-center mb-5">
        <i className="pi pi-arrow-left text-xl cursor-pointer" onClick={() => {
          navigate("/main?page=settings/manage-bidding");
        }}></i>
      </div>
      <div className="flex gap-10 mb-6">
        <div className="w-full flex gap-5">
          <div className="flex flex-col gap-4">
            
            <div className="relative">
              <h2 className="text-2xl font-bold">Auction Members</h2>
              <div className="grid grid-cols-2 gap-1">
                {
                  auctionMembers && auctionMembers?.length > 0 && auctionMembers.map((joined_user, index) => {
                    return (
                      <div key={index} className="flex flex-col bg-white rounded-lg px-4 py-2">
                        <p>#{joined_user.user_id} - {joined_user.user.name}</p>
                      </div>
                    )
                  })
                }
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Auction Items</h2>
              <div className="grid grid-cols-3 gap-1">
                {
                  auctionData && auctionData.items?.length > 0 && auctionData.items.map((item, index) => {
                    return <Button 
                      disabled={item.sold_to != null}
                      key={index}
                      label={`#${item.id} ${item.name}`} 
                      className={`${activeItem && (activeItem.id == item.id) ? "bg-background text-white border-background" : "text-background border-background bg-transparent"} transition-all duration-300 text-left rounded-lg`}
                      onClick={() => {
                        setActiveItem({ ...item });
                        setHasStarted(false);
                        console.log("item", item, activeItem);
                      }}
                    />
                  })
                }
              </div>
            
            </div>
          </div>
        
          {/* Bidding Details */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Bidding Details</h2>
            <div className="flex justify-between">
              <div>
                <p>{`${activeItem && "#"+activeItem.id || ""} - ${activeItem && activeItem.name || ""}`}</p>
                <p className="text-3xl font-bold">Next: ${activeItem && Number(activeItem.starting_bid).toFixed(2) || "0.00"}</p>
              </div>

              <div>
              <p className="text-right">
                {activeItem?.bids?.length > 0 
                    ? `${activeItem.bids[0]?.user_id || ""} - ${activeItem.bids[0]?.user?.name || ""}` 
                    : "-"}
                </p>
                <p className="text-3xl font-bold">
                  Current: {activeItem?.bids?.[0]?.bid_amount 
                    ? "$"+Number(activeItem.bids[0].bid_amount).toFixed(2) 
                    : "No Bids"}
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="w-full lg:w-1/4 flex flex-col gap-2">
                <p>Start/Sell</p>
                <Button disabled={hasStarted || !activeItem?.id} label="Start" className="rounded-lg border-background bg-background" onClick={() => handleStart()} />
                <Button disabled={!hasStarted} label="Sell" className="rounded-lg border-primaryS bg-primaryS" onClick={() => setHasStarted(false)} />
              </div>
              <div className="w-full lg:w-1/4 flex flex-col gap-2">
                {/* <p>Floor Bid</p>
                <input
                  type="text"
                  placeholder="Item Id"
                  className="w-full p-2 text-black"
                />
                <Button disabled={!hasStarted} label="Submit" className="rounded-lg border-background bg-background" /> */}

              </div>
              <div className="w-full lg:w-1/2 flex flex-col gap-2">
                <div className="flex justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <p>Starting Bid</p>
                    <InputText required 
                      value={activeItem && activeItem.starting_bid} 
                      placeholder="Starting Bid" 
                      onChange={(e) => {}} 
                      style={{width: "120px"}}
                    />
                    
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>Minimum Bid</p>
                    <InputText required 
                      value={activeItem && activeItem.minimum_bid} 
                      placeholder="Minimum Bid" 
                      onChange={(e) => {}} 
                      style={{width: "120px"}}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button disabled={!hasStarted || true} label="+100" className="rounded-lg border-background bg-background" />
                  <Button disabled={!hasStarted || true} label="+250" className="rounded-lg border-background bg-background" />
                  <Button disabled={!hasStarted || true} label="+500" className="rounded-lg border-background bg-background" />
                  <Button disabled={!hasStarted || true} label="+1000" className="rounded-lg border-background bg-background" />
                  <Button disabled={!hasStarted || true} label="-100" className="rounded-lg border-backgroundS bg-backgroundS" />
                  <Button disabled={!hasStarted || true} label="-150" className="rounded-lg border-backgroundS bg-backgroundS" />
                  <Button disabled={!hasStarted || true} label="-250" className="rounded-lg border-backgroundS bg-backgroundS" />
                  <Button disabled={!hasStarted || true} label="+500" className="rounded-lg border-backgroundS bg-backgroundS" />
                  <Button disabled={!hasStarted || true} label="+1000" className="rounded-lg border-backgroundS bg-backgroundS" />
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h2 className="text-2xl">Bid History</h2>
              <div className="">
                {activeItem && activeItem.bids.length === 0 ? (
                  <p>No bids yet.</p>
                ) : (
                  <ul>
                    {activeItem && activeItem.bids.map((bid, index) => (
                      <li key={index} className={`gap-4 flex items-center px-2 py-1 border-b rounded transition-all duration-2000 ${recentBid === bid ? "bg-green-500 opacity-100" : "bg-transparent"}`}>
                        <span>{`$${Number(bid.bid_amount)}`}</span>
                        <span>{`(${bid.user_id}) ${bid.user.name}`}</span>
                        <span>{convertUTCToTimeZone(bid.created_at, 'DD/MM/YYYY hh:mm A')}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* <PlaceBid /> */}
    </div>
  );
};

export default AdminBidding;