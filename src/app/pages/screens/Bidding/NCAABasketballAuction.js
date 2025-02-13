import React, { useState, useEffect } from "react";
import Pusher from "pusher-js";
import { Button } from "primereact/button";
import PlaceBid from "./PlaceBid";
import axios from "axios";
import { useAxios } from "../../../contexts/AxiosContext";

const NCAABasketballAuction = ({ pusher, channel }) => {

  const axiosService = useAxios();

  const [upcomingAuctions, setUpcomingAuctions] = useState([]);
  const [liveAuction, setLiveAuction] = useState(null);
  const [userAuctionedItems, setUserAuctionedItems] = useState([]);

  useEffect(() => {
    fetchAuctions();

    if (channel) {
      channel.bind("bid-event", (data) => {
        console.log("New Bid:", data);
        if (liveAuction && liveAuction.id === data.auction_id) {
          setLiveAuction((prev) => ({
            ...prev,
            current_bid: data.bid_amount,
            highest_bidder: data.user,
          }));
        }
      });

      channel.bind("active-item-event", (data) => {
        console.log("Active Item Update:", data);
        setLiveAuction(data);
      });
    }

    return () => {
      if (channel) {
        channel.unbind("bid-event");
        channel.unbind("active-item-event");
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

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="text-primary text-3xl font-semibold">
        NCAA Basketball Auction
      </div>

      {/* Live Auction */}
      {liveAuction ? (
        <div className="p-4 border rounded-lg bg-white shadow-md">
          <h2 className="text-2xl font-bold text-red-600">Live Auction</h2>
          <p className="text-lg">Item: {liveAuction.item_name}</p>
          <p className="text-lg">Current Bid: ${liveAuction.current_bid}</p>
          <p className="text-lg">Highest Bidder: {liveAuction.highest_bidder?.name}</p>
          <PlaceBid auctionId={liveAuction.id} />
        </div>
      ) : (
        <p className="text-gray-500">No active auction at the moment.</p>
      )}

      {/* Upcoming Auctions */}
      <div className="p-4 border rounded-lg bg-white shadow-md">
        <h2 className="text-xl font-bold text-blue-600">Upcoming Auctions</h2>
        {upcomingAuctions.length > 0 ? (
          upcomingAuctions.map((auction) => (
            <div key={auction.id} className="p-2 border-b">
              <p>{auction.item_name} - Starts at {auction.start_time}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No upcoming auctions.</p>
        )}
      </div>

      {/* User's Auctioned Items */}
      <div className="p-4 border rounded-lg bg-white shadow-md">
        <h2 className="text-xl font-bold text-green-600">Your Auctioned Items</h2>
        {userAuctionedItems.length > 0 ? (
          userAuctionedItems.map((item) => (
            <div key={item.id} className="p-2 border-b">
              <p>{item.item_name} - Sold for ${item.final_bid || "Pending"}</p>
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
