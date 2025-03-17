import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { useAxios } from "../../../contexts/AxiosContext";
import convertUTCToTimeZone from "../../../utils/utcToTimezone";
import ReactPlayer from "react-player";
import { useToast } from "../../../contexts/ToastContext";
import { InputNumber } from "primereact/inputnumber";
import { Badge } from "primereact/badge";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import TournamentBracket from "./TournamentBracket";

const AdminBidding = ({ pusher, channel, auctionId }) => {
  const axiosService = useAxios();
  const navigate = useNavigate();
  const showToast = useToast();

  const [showBracket, setShowBracket] = useState(false); 

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
  const [userOnBid, setUserOnBid] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [bidConfirmation, setBidConfirmation] = useState(false);

  const regions = [
    {name: 'East', value: "East", icon: 'pi pi-compass'},
    {name: 'West', value: "West", icon: 'pi pi-compass'},
    {name: 'Midwest', value: "Midwest", icon: 'pi pi-compass'},
    {name: 'South', value: "South", icon: 'pi pi-compass'},
  ];

  const handlePlaceBid = (customAmount = 0, user_id = null) => {
    // if (bidConfirmation) {
    //   setBidConfirmation(false);
      
    // } else {
    //   setBidConfirmation(true);
    //   setTimeout(() => setBidConfirmation(false), 3000);
    // }
    setIsBidding(true);
    let data = {
      bid_amount: currentBidAmount,
    };
    if(customAmount !== 0){
      data.bid_amount = customAmount;
    }
    if(user_id !== null){
      data.user_id = user_id;
    }

    axiosService.post(`/api/auctions/${auctionId}/${activeItem.id}/bid`, data)
      .then((response) => {
        setIsBidding(false);
        showToast({
          severity: response.data.status ? 'success' : 'error',
          summary: response.data.status ? 'Bid Placed' : 'Bid Error',
          detail: response.data.status ? `Successfully placed bid of $${data.bid_amount}` : response.data.message,
        });
      })
      .catch((error) => {
        setIsBidding(false);
        showToast({
          severity: 'error',
          summary: 'Unable to Bid',
          detail: error.response?.data?.message || 'An error occurred',
        });
      });
  };

  // Fetch auction data
  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        setIsLoading(true);
        const response = await axiosService.get(`/api/auctions/${auctionId}/get-by-id`);
        setAuctionData(response.data);
        setLiveStream(response.data.stream_url);
        setError(null);

        const activeItemId = response.data.active_item_id;
        const matchedItem = response.data.items?.find((e) => e.id === activeItemId) || null;
        setActiveItem(matchedItem);
        setHasStarted(true);

        if(response.data?.items?.length < 1){
          setShowBracket(true);
        }

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

      if(auction_id === undefined){
        return;
      }

      const response = await axiosService.get(`/api/auctions/${auctionId}/get-by-id`);
      setAuctionData(response.data);

      axiosService.get(`/api/auctions/${auctionId}/${auction_id}/get-active-item`)
        .then((response) => {
          setActiveItem(response.data);
          setRecentBid(data);
          setTimeout(() => setRecentBid(null), 2000);
        })
        .catch(() => {
          setActiveItem(null);
        });
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
        setCurrentBidAmount(a);
        setCustomBidAmount(a);
      } else {
        const b = activeItem.starting_bid;
        setCurrentBidAmount(b);
        setCustomBidAmount(b);
      }
    }
  }, [activeItem]);

  const getUsers = () => {
    axiosService.get('/api/users/all').then((response) => {setUsers(response.data);});
  };

  useEffect(() => {
    getUsers();  
  }, []);

  // Handle starting an item auction
  const [startedItem, setStartedItem] = useState(null);
  const handleStart = async () => {
    if (!activeItem) return;
    setStartedItem(activeItem)
    try {
      await axiosService.get(`/api/auctions/${auctionId}/${activeItem.id}/set-active-item`);
      setHasStarted(true);
      showToast({
        severity: 'success',
        summary: 'Auction Started',
        detail: `Bidding for ${activeItem.name} has begun`,
      });
    } catch (err) {
      console.error('Failed to start auction:', err);
      showToast({
        severity: 'error',
        summary: 'Failed to Start',
        detail: 'Could not start the auction',
      });
    }
  };

  const handleEndAuction = async () => {
    try {
      // handle end auction
      axiosService.post(`/api/auctions/${auctionId}/${activeItem.id}/end-active-item`, {
        sold_to: activeItem.bids?.length > 0 ? activeItem.bids[0].user_id : 0,
        sold_amount: activeItem.bids?.length > 0 ? activeItem.bids[0].bid_amount : 0,
      }).then( async (response) => {
        console.log(response);
        setHasStarted(false);
        showToast({
          severity: 'info',
          summary: 'Item Auction Ended',
          detail: activeItem.bids?.length > 0 
            ? `Item sold to ${activeItem.bids[0].user?.name} for $${activeItem.bids[0].bid_amount}`
            : 'Item Auction ended with no bids',
        });

        setStartedItem(null);
        setActiveItem(null);

        const r = await axiosService.get(`/api/auctions/${auctionId}/get-by-id`);
        setAuctionData(r.data);

      }).catch((error) => {
        console.log(error);
      })
      

    } catch (err) {
      console.error('Failed to end auction:', err);
    }
  };

  const handleRemoveBidHistory = (bid_id) => {
    if (window.confirm("Are you sure you want to remove this bid?")) {
      axiosService.post(`/api/auctions/remove-bid`, { bid_id: bid_id})
        .then(() => {
          showToast({
            severity: 'success',
            summary: 'Bid Removed',
            detail: 'The bid has been removed successfully',
          });
        })
        .catch((error) => {
          showToast({
            severity: 'error',
            summary: 'Unable to remove bid',
            detail: error.response?.data?.message || 'An error occurred',
          });
        });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="4" fill="var(--surface-ground)" animationDuration=".5s" />
      </div>
    );
  }

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.id?.toString().includes(searchTerm)
  );

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50">
      {/* <Button label="Manage Tournament Bracket" onClick={() => setShowBracket(true)} /> */}
      <TournamentBracket auctionId={auctionId} data={auctionData} visible={showBracket} 
        onHide={() => {
          setShowBracket(false)
          setTimeout(() => {
            if(auctionData?.items?.length < 1){
              setShowBracket(true);
            }
          }, 2000)
        }} 
        onSuccess={ async () => {
          setShowBracket(false);
          const response = await axiosService.get(`/api/auctions/${auctionId}/get-by-id`);
          setAuctionData(response.data);

        }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-4">
          {/* Auction Items */}
          <Card className="shadow-md" pt={{content: {className: "p-0"}}}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
              <div className="flex items-center gap-2">
                <Button 
                  icon="pi pi-arrow-left" 
                  className="p-button-rounded p-button-text" 
                  onClick={() => navigate("/main?page=settings/manage-auction")}
                  tooltip="Back to Auctions"
                  tooltipOptions={{position: 'bottom'}}
                />
                <h2 className="text-2xl font-bold m-0">Auction Items</h2>
              </div>
              <Dropdown 
                value={selectedRegion} 
                onChange={(e) => setSelectedRegion(e.value)} 
                options={regions} 
                optionLabel="name"
                itemTemplate={(option) => (
                  <div className="flex items-center gap-2">
                    <i className={option.icon}></i>
                    <span>{option.name}</span>
                  </div>
                )}
                placeholder="Select Region" 
                className="w-full md:w-48"
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
              {auctionData?.items
                .filter(item => item?.region === selectedRegion)
                .map((item) => (
                  <Button 
                    key={item.id}
                    disabled={item.sold_to != null}
                    className={`
                      ${activeItem?.id === item.id 
                        ? "bg-background text-white" 
                        : "bg-transparent text-background border-1 border-background"}
                      transition-all duration-300 text-left rounded-lg p-button-sm
                      flex items-center justify-between
                      ${item.sold_to ? 'opacity-50 select-none' : ''}
                    `}
                    onClick={() => {
                      if(startedItem?.id == item.id) {
                        setActiveItem(startedItem);
                        setHasStarted(true);
                      } else {
                        setActiveItem(item);
                        setHasStarted(false);
                      }
                    }}
                  >
                    <span className="truncate">#{item.seed} {item.description} {item.name}</span>
                    {item.sold_to && <i className="pi pi-check-circle ml-1"></i>}
                  </Button>
                ))}
            </div>
          </Card>
          
          {/* Auction Members */}
          <Card className="shadow-md" pt={{content: {className: "p-0"}}}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
              <h2 className="text-2xl font-bold m-0 w-full">Auction Members</h2>
              <div className="w-full md:w-auto">
                <InputText 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  placeholder="Search members" 
                  className="w-full p-input-icon-left"
                />
              </div>
            </div>
            
            {userOnBid && hasStarted && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-blue-800 mb-1">Bidding for: {userOnBid.name}</p>
                    <div className="p-inputgroup">
                      <InputNumber 
                        min={1} 
                        value={customBidAmount} 
                        onChange={(e) => setCustomBidAmount(e.value)} 
                        mode="currency" 
                        currency="USD" 
                        locale="en-US"
                        className="w-full"
                      />
                      <Button
                        type="button"
                        icon={"pi pi-dollar"}
                        tooltip={`Place Bid: $${customBidAmount}`}
                        className={`p-button-success border-none`}
                        disabled={isBidding}
                        onClick={() => handlePlaceBid(customBidAmount, userOnBid.id)}
                      />
                    </div>
                  </div>
                  <Button 
                    icon="pi pi-times" 
                    className="p-button-rounded p-button-text p-button-danger" 
                    onClick={() => setUserOnBid(null)}
                    tooltip="Cancel"
                  />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredUsers.length > 0 ? filteredUsers.map((member) => (
                <div 
                  key={member.id}
                  className={`
                    ${member.id === userOnBid?.id 
                      ? 'border-background bg-blue-50' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'}
                    flex items-center justify-between rounded-lg px-3 py-2 border cursor-pointer transition-all
                  `}
                  onClick={() => userOnBid?.id === member.id ? setUserOnBid(null) : setUserOnBid(member)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center 
                      ${auctionData?.joined_users.find((d) => d.user_id === member.id) 
                        ? "bg-green-100 text-green-600" 
                        : "bg-gray-100 text-gray-400"}`}>
                      <i className="pi pi-user"></i>
                    </div>
                    <div>
                      <p className="font-medium text-sm mb-0 leading-tight">{member.name}</p>
                      <p className="text-xs text-gray-500 mb-0">ID: {member.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {auctionData?.joined_users.find((d) => d.user_id === member.id) && (
                      <Tag severity="success" value="Online" className="mr-2" />
                    )}
                  </div>
                </div>
              )) : (
                <div className="col-span-2 text-center py-4 text-gray-500">
                  No members match your search
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Bidding Details */}
        <div className="lg:col-span-7">
          <Card className="shadow-md" pt={{content: {className: "p-0"}}}>
            <div className="grid grid-cols-1 gap-4">
              {/* Live Stream Section */}
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center">
                  <i className="pi pi-video text-red-500 mr-2"></i>
                  Live Stream
                  {hasStarted && <Badge value="LIVE" severity="danger" className="ml-2"></Badge>}
                </h2>
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <ReactPlayer 
                    url={liveStream} 
                    playing 
                    controls={true}
                    width="100%" 
                    height="300px"
                    config={{
                      youtube: {
                        playerVars: { showinfo: 1 }
                      }
                    }}
                  />
                </div>
              </div>
              
              <Divider />
              
              {/* Bidding Details Section */}
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <i className="pi pi-dollar text-green-500 mr-2"></i>
                  Bidding Details
                </h2>
                
                {activeItem ? (
                  <>
                    {/* Current Item Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <p className="text-gray-600 mb-1">Current Item</p>
                          <p className="text-xl font-bold mb-1">#{activeItem.seed} {activeItem.description} {activeItem.name} - {activeItem.region}</p>
                          <Tag 
                            severity={hasStarted ? "success" : "warning"} 
                            value={hasStarted ? "Bidding Active" : "Not Started"} 
                          />
                        </div>

                        <div className="text-right">
                          <p className="text-gray-600 mb-1">Current Highest Bidder</p>
                          <p className="text-xl font-bold mb-1">
                            {activeItem?.bids[0]
                              ? `${activeItem?.bids[0].user?.name}`
                              : "No Bids Yet"}
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {activeItem?.bids[0]
                              ? `$${Number(activeItem?.bids[0].bid_amount).toFixed(2)}`
                              : "$0.00"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Control Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      {/* Action Buttons */}
                      <div className="md:col-span-1">
                        <div className="flex flex-col gap-2">
                          <Button 
                            disabled={hasStarted || !activeItem.id}
                            label="Start Bidding"
                            icon="pi pi-play"
                            className="p-button-success w-full"
                            onClick={handleStart}
                          />
                          <Button 
                            disabled={!hasStarted}
                            label="End Bidding"
                            icon="pi pi-stop"
                            className="p-button-danger w-full"
                            onClick={handleEndAuction}
                          />
                        </div>
                      </div>

                      {/* Bid Controls */}
                      <div className="md:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="w-full">
                            <p className="mb-1 font-medium">Starting Bid</p>
                            <InputNumber
                              value={activeItem.starting_bid}
                              disabled
                              className="w-full"
                              mode="currency"
                              currency="USD"
                              locale="en-US"
                              inputClassName="w-[100px]"
                            />
                          </div>
                          <div className="w-full">
                            <p className="mb-1 font-medium">Minimum Bid Increment</p>
                            <InputNumber
                              value={activeItem.minimum_bid}
                              disabled
                              className="w-full"
                              mode="currency"
                              currency="USD"
                              locale="en-US"
                              inputClassName="w-[100px]"
                            />
                          </div>
                        </div>
                        
                        {hasStarted && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="mt-4 text-xs p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="font-medium text-center text-green-800 mb-2">Next Minimum Bid</p>
                              <div className="text-center gap-2 text-2xl font-bold text-green-800">
                                ${Number(currentBidAmount).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bid History */}
                    <div className="mt-6">
                      <h3 className="text-xl font-bold mb-3 flex items-center">
                        <i className="pi pi-history mr-2"></i>
                        Bid History
                        {activeItem?.bids?.length > 0 && (
                          <Badge value={activeItem.bids.length} className="ml-2"></Badge>
                        )}
                      </h3>
                      
                      {activeItem?.bids?.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                          <i className="pi pi-info-circle text-4xl text-gray-400 mb-2"></i>
                          <p className="text-gray-500">No bids have been placed yet.</p>
                        </div>
                      ) : (
                        <div className="border border-gray-200 rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200 text-xs">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bidder</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {activeItem.bids.map((bid, i) => (
                                <tr
                                  key={bid.id}
                                  className={`
                                    ${recentBid?.id === bid.id ? 'bg-green-50' : 'hover:bg-gray-50'}
                                    transition-all duration-300
                                  `}
                                >
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span className="font-medium text-green-600">${Number(bid.bid_amount).toFixed(2)}</span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                                        <i className="pi pi-user text-gray-600"></i>
                                      </div>
                                      <div>
                                        <p className="font-medium mb-0">{bid?.user?.name}</p>
                                        <p className="text-xs text-gray-500 mb-0">ID: {bid?.user_id}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {convertUTCToTimeZone(bid?.created_at, 'DD/MM/YYYY hh:mm A')}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-right">
                                    {i === 0 && (
                                      <Button
                                        icon="pi pi-trash"
                                        className="p-button-rounded p-button-text p-button-danger p-button-sm"
                                        onClick={() => handleRemoveBidHistory(bid.id)}
                                        tooltip="Remove Bid"
                                      />
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <i className="pi pi-info-circle text-5xl text-gray-400 mb-3"></i>
                    <p className="text-gray-500 text-lg">Select an item from the list to start bidding</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminBidding;