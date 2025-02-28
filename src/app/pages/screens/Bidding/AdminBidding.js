import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { useAxios } from "../../../contexts/AxiosContext";
import convertUTCToTimeZone from "../../../utils/utcToTimezone";
import ReactPlayer from "react-player";
import { useToast } from "../../../contexts/ToastContext";

const AdminBidding = ({ pusher, channel, auctionId }) => {
  const axiosService = useAxios();
  const navigate = useNavigate();
  const showToast = useToast();

  // Main auction state
  const [auctionData, setAuctionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bidding state
  const [activeItem, setActiveItem] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [recentBid, setRecentBid] = useState(null);

  const [selectedRegion, setSelectedRegion] = useState("East");
  const [liveStream, setLiveStream] = useState();

  const [currentBidAmount, setCurrentBidAmount] = useState(1);
  const [customBidAmount, setCustomBidAmount] = useState(1);
  const [isBidding, setIsBidding] = useState(false);
  const handlePlaceBid = (customAmount = 0) => {
    setIsBidding(true)
    let bid_amount = currentBidAmount;
    if(customAmount != 0){
      bid_amount = customAmount;
    }

    axiosService.post(`/api/auctions/${auctionId}/${activeItem.id}/bid`, { bid_amount: bid_amount})
    .then((response) => {
      console.log(response);
      setIsBidding(false)
    })
    .catch((error) => {
      setIsBidding(false)
      showToast({
        severity: 'error',
        summary: 'Unable to Bid',
        detail: error.response.data.message,
      });
    })
  }

  
  // Fetch auction data
  useEffect(() => {
  const fetchAuctionData = async () => {
    try {
      setIsLoading(true);
      const response = await axiosService.get(`/api/auctions/${auctionId}/get-by-id`);
      setAuctionData(response.data);
      setLiveStream(response.data.stream_url);
      setError(null);
    } catch (err) {
      setError('Failed to load auction data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

    if (auctionId) {
      fetchAuctionData();
    }
  }, [auctionId]);

  // Setup Pusher listeners
  useEffect(() => {
    if (!channel) return;

    const handleNewBid = async (data) => {
      let auction_id = data.data;
      if(data.auction_item_id != null){
        auction_id = data.auction_item_id;
      }

      if(auction_id == undefined){
        return;
      }

      const response = await axiosService.get(`/api/auctions/${auctionId}/get-by-id`);
      setAuctionData(response.data);

      axiosService.get(`/api/auctions/${auctionId}/${auction_id}/get-active-item`)
      .then((response) => {
        setActiveItem(response.data)
        setRecentBid(data);
        setTimeout(() => setRecentBid(null), 2000);
      })
      .catch(() => {
        setActiveItem(null);
      })
    };

    const handleAuctionMembers = async () => {
      try {
        const response = await axiosService.get(`/api/auctions/${auctionId}/members`);
        setAuctionData(prev => prev ? { ...prev, joined_users: response.data } : null);
      } catch (err) {
        console.error('Failed to update auction members:', err);
      }
    };

    channel.bind("bid-event", handleNewBid);
    channel.bind("auction-members", handleAuctionMembers);

    return () => {
      channel.unbind("bid-event", handleNewBid);
      channel.unbind("auction-members", handleAuctionMembers);
    };
  }, [channel, auctionId, axiosService, activeItem]);

  useEffect(() => {
    if(activeItem){
      if(activeItem.bids?.length > 0){
        const a = activeItem.minimum_bid + (activeItem?.bids[0]?.bid_amount || 0);
        setCurrentBidAmount(a)
        setCustomBidAmount(a)
      } else {
        const b = activeItem.starting_bid + (activeItem?.bids[0]?.bid_amount || 0);
        setCurrentBidAmount(b)
        setCustomBidAmount(b)
      }
    }
  }, [activeItem]);

  // Handle starting an item auction
  const handleStart = async () => {
    if (!activeItem) return;

    try {
      await axiosService.get(`/api/auctions/${auctionId}/${activeItem.id}/set-active-item`);
      setHasStarted(true);
    } catch (err) {
      console.error('Failed to start auction:', err);
    }
  };

  // Handle bid increment/decrement
  const handleBidAdjustment = async (amount) => {
    if (!activeItem || !hasStarted) return;

    try {
      // Implement your bid adjustment logic here
      console.log(`Adjusting bid by ${amount}`);
    } catch (err) {
      console.error('Failed to adjust bid:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-background"></div>
      </div>
    );
  }

  const handleRemoveBidHistory = (bid_id) => {
    axiosService.post(`/api/auctions/remove-bid`, { bid_id: bid_id})
    .then((response) => {
      console.log(response);
      setIsBidding(false)
    })
    .catch((error) => {
      setIsBidding(false)
      showToast({
        severity: 'error',
        summary: 'Unable to remove bid',
        detail: error.response.data.message,
      });
    })
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Auction Items */}
          <section className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="w-full">
                <span className="flex items-center gap-2">
                  <i className="pi pi-arrow-left text-xl cursor-pointer" onClick={() => navigate("/main?page=settings/manage-auction")}></i>
                  <span className="text-2xl font-bold w-full">Auction Items</span>
                </span>
              </div>
              <Dropdown 
                value={selectedRegion} 
                onChange={(e) => setSelectedRegion(e.value)} 
                options={[
                  {name: 'East', value: "East"},
                  {name: 'West', value: "West"},
                  {name: 'Midwest', value: "Midwest"},
                  {name: 'South', value: "South"},
                ]} 
                optionLabel="name" 
                placeholder="Select a City" className="w-full md:w-14rem"
              />
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-2">
              {auctionData?.items.filter(item => item.ncaa_team?.region === selectedRegion).map((item) => (
                <Button 
                  key={item.id}
                  disabled={item.sold_to != null}
                  label={`#${item.id} ${item.name}`}
                  className={`
                    ${activeItem?.id === item.id 
                      ? "bg-background text-white" 
                      : "bg-transparent text-background"}
                    transition-all duration-300 text-left rounded-lg text-xs
                    px-3 py-2
                    ${item.sold_to ? 'opacity-50 select-none' : ''}
                  `}
                  onClick={() => {
                    console.log("ITEM::", item);
                    setActiveItem(item);
                    setHasStarted(false);
                  }}
                />
              ))}
            </div>
          </section>
          
          {/* Auction Members */}
          <section className="bg-white rounded-lg p-6 shadow-md">
            
            <h2 className="text-2xl font-bold mb-4">Auction Members</h2>
            <div className="grid grid-cols-2 gap-4">
              {auctionData?.joined_users.map((member) => (
                <div 
                  key={member.user_id}
                  className="bg-gray-100 flex items-center justify-between rounded-lg px-3 py-2 border border-gray-300"
                >
                  <div className="flex items-center gap-2">
                    <p className="font-medium">#{member.user_id}</p>
                    <p className="text-gray-600">{member.user.name}</p>
                  </div>
                  <Button 
                    size="small"
                    rounded
                    icon="pi pi-dollar"
                    className="bg-white border-none bg-primaryS p-2"
                    tooltip={`Bid $${currentBidAmount} for this user`}
                    data-pr-position="top"
                    disabled={isBidding || !hasStarted}
                    onClick={() => handlePlaceBid(currentBidAmount)}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column - Bidding Details */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-2">Bidding Details</h2>
          <div className="relative">
            <ReactPlayer 
              url={liveStream} 
              playing 
              controls={false}
              width="100%" 
              height="250px"
            />
            <div
              className="absolute top-0 left-0 w-full h-full"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
            
          {activeItem ? (
            <>
              {/* Current Item Info */}
              <div className="flex justify-between mb-6">
                <div>
                  <p className="text-gray-600">#{activeItem.id} - {activeItem.name}</p>
                  <p className="text-3xl font-bold">
                    {
                      activeItem.bids?.length > 0 ?
                      `Next Bid: ${Number(currentBidAmount).toFixed(2)}`
                      : `Next Bid: ${Number(activeItem.starting_bid + (activeItem?.bids[0]?.bid_amount || 0)).toFixed(2)}`
                    }
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-gray-600">
                    {activeItem?.bids[0]
                      ? `${activeItem?.bids[0].user_id} - ${activeItem?.bids[0].user?.name}`
                      : "-"}
                  </p>
                  <p className="text-3xl font-bold">
                    Current: {activeItem?.bids[0]
                      ? `$${Number(activeItem?.bids[0].bid_amount).toFixed(2)}`
                      : "No Bids"}
                  </p>
                </div>
              </div>

              {/* Control Panel */}
              <div className="grid grid-cols-4 gap-6">
                {/* Action Buttons */}
                <div className="col-span-1">
                  <Button 
                    disabled={hasStarted || !activeItem.id}
                    label="Start"
                    className="w-full mb-2 rounded-lg border-background bg-background"
                    onClick={handleStart}
                  />
                  <Button 
                    disabled={!hasStarted}
                    label="End"
                    className="w-full rounded-lg border-primaryS bg-primaryS"
                    onClick={() => setHasStarted(false)}
                  />
                </div>

                {/* Bid Controls */}
                <div className="col-span-3">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p>Starting Bid</p>
                      <InputText
                        value={activeItem.starting_bid}
                        disabled={hasStarted}
                        className="w-full"
                        min={1}
                        readOnly
                      />
                    </div>
                    <div>
                      <p>Minimum Bid</p>
                      <InputText
                        value={activeItem.minimum_bid}
                        disabled={hasStarted}
                        className="w-full"
                        min={1}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bid History */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Bid History</h2>
                {activeItem?.bids?.length === 0 ? (
                  <p className="text-gray-500">No bids yet.</p>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {activeItem.bids.map((bid, i) => (
                      <div
                        key={bid.id}
                        className={`
                          flex items-center justify-between p-3 border-b
                          ${recentBid?.id === bid.id ? 'bg-green-100' : 'hover:bg-gray-50'}
                          transition-all duration-300
                        `}
                      >
                        <span className="font-medium">${Number(bid.bid_amount).toFixed(2)}</span>
                        <span className="text-gray-600">
                          {bid?.user?.name} (#{bid?.user_id})
                        </span>
                        <span className="text-gray-500 text-sm relative pr-10">
                          {convertUTCToTimeZone(bid?.created_at, 'DD/MM/YYYY hh:mm A')}
                          {
                          i == 0 && 
                          <span className="right-0 top-0 absolute " onClick={() => handleRemoveBidHistory(bid.id)}><i className="pi pi-times-circle text-red-500 cursor-pointer"></i></span>
                        }
                        </span>
                        
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Select an item to start bidding
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBidding;