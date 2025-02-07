import React, { useState, useEffect, useRef } from "react";
import Pusher from "pusher-js";
import ReactPlayer from "react-player";
import PlaceBid from "./PlaceBid";
import { Button } from "primereact/button";

const AdminBidding = ({pusher, channel}) => {
  
  const [bids, setBids] = useState([]);
  const [recentBid, setRecentBid] = useState(null);
  const [highestBid, setHighestBid] = useState(null);
  const [liveStreamUrl, setLiveStreamUrl] = useState("https://www.youtube.com/watch?v=DPsyuvBom5k");

  const playerRef = useRef(null);

  const handlePause = () => {
    const currentTime = playerRef.current.getCurrentTime();
    setTimeout(() => {
      playerRef.current.seekTo(currentTime);
    }, 100); // Wait for the pause to take effect, then seek to the current time
  };

  useEffect(() => {
    if (channel) {
      channel.bind("new-bid", (data) => {
        setBids((prevBids) => [...prevBids, data]);
        if (!highestBid || data.amount > highestBid.amount) {
          setHighestBid(data);
        }
      });
    }

    return () => {
      if (channel) {
        channel.unbind("new-bid");
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

  return (
    <div className="p-6 min-h-screen">
      <div className="flex gap-4 mb-6">
        <div className="w-full lg:w-1/2 flex flex-col gap-5">
          <div>
            <h2 className="text-2xl">Stream</h2>
            <ReactPlayer 
              ref={playerRef}
              url={liveStreamUrl} playIcon={false} controls={false} playing width="100%" 
              height="358px" 
              style={{ aspectRatio: '16/9' }}
              onPause={handlePause}
            />
            <input
              type="text"
              placeholder="Enter Live Stream URL"
              className="w-full p-2 mt-2 text-black"
              value={liveStreamUrl}
              onChange={(e) => setLiveStreamUrl(e.target.value)}
            />
          </div>
          <div>
            <h2 className="text-2xl">Auction Items</h2>
            <div className="flex flex-col gap-1">
              <Button label="#101: Signed NCAA Basketball" className="text-left rounded-lg text-background border-background bg-transparent" />
              <Button label="#102: Autographed NCAA Basketball Jersey" className="text-left rounded-lg text-background border-background bg-transparent" />
              <Button label="#103: NCAA Championship Ticket Stub Collection" className="text-left rounded-lg text-background border-background bg-transparent" />
              <Button label="#104: Limited Edition NCAA Final Four Basketball" className="text-left rounded-lg text-background border-background bg-transparent" />
              <Button label="#105: Game-Worn NCAA Jersey" className="text-left rounded-lg text-background border-background bg-transparent" />
              <Button label="#106: NCAA Basketball Poster Signed by Players" className="text-left rounded-lg text-background border-background bg-transparent" />
              <Button label="#107: NCAA March Madness Commemorative Hat" className="text-left rounded-lg text-background border-background bg-transparent" />
              <Button label="#108: Autographed NCAA Basketball Shoes" className="text-left rounded-lg text-background border-background bg-transparent" />
              <Button label="#109: NCAA Basketball Game Program (Final Four)" className="text-left rounded-lg text-background border-background bg-transparent" />
              <Button label="#110: NCAA Tournament VIP Experience Package" className="text-left rounded-lg text-background border-background bg-transparent" />
            </div>
           
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <h2 className="text-2xl">Bidding Details</h2>
          <div className="flex justify-between">
            <div>
              <p>#101 Signed Gibson Les Paul Guitar</p>
              <p className="text-3xl font-bold">Next: $4,000.00</p>
            </div>

            <div>
              <p className="text-right">100 - Gerardo Socias Jr</p>
              <p className="text-3xl font-bold">Current: $3,000.00</p>
            </div>
          </div>
          <div className="flex gap-5">
            <div className="w-full lg:w-1/4 flex flex-col gap-2">
              <p>Start/Sell</p>
              <Button label="Start" className="rounded-lg border-background bg-background" />
              <Button label="Sell" className="rounded-lg border-primaryS bg-primaryS" />
            </div>
            <div className="w-full lg:w-1/4 flex flex-col gap-2">
              <p>Floor Bid</p>
              <input
                type="text"
                placeholder="Floor Bid"
                className="w-full p-2 text-black"
              />
              <Button label="Submit" className="rounded-lg border-background bg-background" />

            </div>
            <div className="w-full lg:w-1/2 flex flex-col gap-2">
              <div className="flex justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <p>Starting Bid</p>
                  <input
                    type="text"
                    placeholder="Starting Bid"
                    className="w-full p-2 text-black"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p>Minimum Bid</p>
                  <input
                    type="text"
                    placeholder="Minimum Bid"
                    className="w-full p-2 text-black"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button label="+100" className="rounded-lg border-background bg-background" />
                <Button label="+250" className="rounded-lg border-background bg-background" />
                <Button label="+500" className="rounded-lg border-background bg-background" />
                <Button label="+1000" className="rounded-lg border-background bg-background" />
                <Button label="-100" className="rounded-lg border-backgroundS bg-backgroundS" />
                <Button label="-150" className="rounded-lg border-backgroundS bg-backgroundS" />
                <Button label="-250" className="rounded-lg border-backgroundS bg-backgroundS" />
                <Button label="+500" className="rounded-lg border-backgroundS bg-backgroundS" />
                <Button label="+1000" className="rounded-lg border-backgroundS bg-backgroundS" />
              </div>
            </div>
          </div>

          <div className="mt-5">
            <h2 className="text-2xl">Bid History</h2>
            <div className="">
              {bids.length === 0 ? (
                <p>No bids yet.</p>
              ) : (
                <ul>
                  {bids.map((bid, index) => (
                    <li key={index} className={`px-2 py-1 rounded transition-all duration-2000 ${recentBid === bid ? "bg-green-500 opacity-100" : "bg-transparent"}`}>
                      {bid.username}: ${bid.amount}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      

      <PlaceBid />
    </div>
  );
};

export default AdminBidding;