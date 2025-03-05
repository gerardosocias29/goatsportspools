import React, { useState, useEffect } from "react";
import Pusher from "pusher-js";
import { Button } from "primereact/button";
import PlaceBid from "./PlaceBid";
import axios from "axios";
import { useAxios } from "../../../contexts/AxiosContext";
import convertUTCToTimeZone from "../../../utils/utcToTimezone";
import { useNavigate } from "react-router-dom";

const NCAABasketballAuction = ({ pusher, channel }) => {

  const axiosService = useAxios();
  const navigate = useNavigate();

  const [upcomingAuctions, setUpcomingAuctions] = useState([]);
  const [liveAuction, setLiveAuction] = useState({});
  const [userAuctionedItems, setUserAuctionedItems] = useState([]);

  useEffect(() => {
    if (channel) {
      channel.bind("bid-event", (data) => {
        console.log("New Bid:", data);
      });

      channel.bind("active-auction-event-all", (data) => {
        console.log(data)
        if(data.status == "live"){
          axiosService.get("/api/auctions/live").then((response) => {
            setLiveAuction(response.data);
          })
        } else {
          setLiveAuction({});
        }
      });
    }

    return () => {
      if (channel) {
        channel.unbind("bid-event");
        channel.unbind("active-auction-event-all");
      }
    };
  }, [channel]);

  const fetchAuctions = async () => {
    try {
      const [upcomingRes, liveRes, userRes] = await Promise.all([
        axiosService.get("/api/auctions/upcoming"),
        axiosService.get("/api/auctions/live"),
        axiosService.get("/api/auctions/my-items"),
      ]);
  
      setUpcomingAuctions(upcomingRes.data);
      setLiveAuction(liveRes.data);
      setUserAuctionedItems(userRes.data);
    } catch (error) {
      console.error("Error fetching auction data:", error);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [])

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="text-primary text-3xl font-semibold">
        NCAA Basketball Auction
      </div>

      {/* Live Auction */}
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-red-600">Live Auction</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          { Object.keys(liveAuction).length > 0 ? (
            <div className="cursor-pointer lg:col-span-1 shadow-lg p-4 bg-primaryS rounded-lg text-white flex justify-between"
              onClick={() => {
                navigate(`/main?page=ncaa-basketball-auction&auction_id=${liveAuction.id}`)
              }}
            >
              <div>
                <p className="text-xl font-bold">{liveAuction.name}</p>
                <p className="text-sm">No. of Items: {liveAuction.items?.length}</p>
                <p className="text-sm">Items Sold: {liveAuction.items?.filter(item => item.sold_to !== null)?.length}</p>
              </div>
              <span className="flex items-center">
                <i className="pi pi-chevron-right"></i>
              </span>
            </div>
          ) : (
            <div className="col-span-4 shadow-lg p-4 bg-white rounded-lg">
              <p className="text-gray-500">No active auction at the moment.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-blue-600">Upcoming Auctions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {upcomingAuctions.length > 0 ? (
            upcomingAuctions.map((auction) => (
              <div key={auction.id} className="lg:col-span-1 shadow-lg p-4 bg-white rounded-lg">
                <div>
                  <p className="text-xl font-bold">{auction.name}</p>
                  <p>Starts at {convertUTCToTimeZone(auction.event_date, "MMM DD, YYYY hh:mm A")}</p>
                  <p className="text-sm">No. of Items: {auction.items?.length}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-4 shadow-lg p-4 bg-white rounded-lg">
              <p className="text-gray-500">No upcoming auctions at the moment.</p>
            </div>
          )}

        </div>
      </div>

      {/* User's Auctioned Items */}
      <div className="p-4 border rounded-lg bg-white shadow-lg">
        <h2 className="text-xl font-bold text-green-600">Your Auctioned Items</h2>
        {userAuctionedItems.length > 0 ? (
          userAuctionedItems.map((item) => (
            <div key={item.id} className="p-4 border-b text-xs">
              <p>
                <span className="p-2 rounded-lg border bg-gray-100">{item.name}</span> - Sold for <span className="text-green-600 font-bold">${Number(item.sold_amount).toFixed(2)}</span>
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">You have not auctioned any items.</p>
        )}
      </div>
    </div>
  );
};

export default NCAABasketballAuction;
