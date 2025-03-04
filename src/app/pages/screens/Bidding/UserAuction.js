import { useEffect, useState } from "react";
import { useAxios } from "../../../contexts/AxiosContext";
import { useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { useToast } from "../../../contexts/ToastContext";
import { Badge } from "primereact/badge";
import convertUTCToTimeZone from "../../../utils/utcToTimezone";

const UserAuction = ({ channel, auctionId, currentUser }) => {
  const axiosService = useAxios();
  const [event, setEvent] = useState();
  const navigate = useNavigate();
  const showToast = useToast();
  
  // States for auction
  const [activeItem, setActiveItem] = useState();
  const [currentBidAmount, setCurrentBidAmount] = useState(1);
  const [customBidAmount, setCustomBidAmount] = useState(1);
  const [isBidding, setIsBidding] = useState(false);
  const [bidHistory, setBidHistory] = useState([]);
  const [isUserWinning, setIsUserWinning] = useState(false);
  
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
        
      // Get bid history
      // axiosService
      // .get(`/api/auctions/${auctionId}/bid-history`)
      //   .then((response) => {
      //     setBidHistory(response.data || []);
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //   });

      // Implement bid increment on the ADMIN Page
      // Show all bid history on user auction
    }

    const handleUnload = () => {
      const url = `${process.env.REACT_APP_API_URL}/api/auctions/${auctionId}/${currentUser.id}/leave`;
      console.log("Sending beacon to:", url);
      navigator.sendBeacon(url);
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);

  }, [auctionId]);

  const handlePlaceBid = (customAmount = 0) => {
    setIsBidding(true);

    let bid_amount = currentBidAmount;
    if(customAmount !== 0){
      bid_amount = customAmount;
    }

    axiosService.post(`/api/auctions/${auctionId}/${activeItem.id}/bid`, { bid_amount: bid_amount})
    .then((response) => {
      console.log(response);
      setIsBidding(false);
      
      // Check if user is winning after bid
      if (response.data && response.data.winning) {
        setIsUserWinning(true);
      }

      showToast({
        severity: response.data.status ? 'success' : 'error',
        summary: response.data.status ? 'Bid Placed' : 'Bid Error',
        detail: response.data.status ? `Successfully placed bid of $${bid_amount}` : response.data.message,
      });
      
      // Update bid history
      // axiosService
      //   .get(`/api/auctions/${auctionId}/bid-history`)
      //   .then((response) => {
      //     setBidHistory(response.data || []);
      //   });
    })
    .catch((error) => {
      console.log(error);
      showToast({
        severity: 'error',
        summary: 'Unable to Bid',
        detail: error.response?.data?.message,
      });
      setIsBidding(false);
    });
  };

  const handleActiveItem = (data) => {
    console.log("active-item-event", data);
    let auction_id = data.data;
    if(data.auction_item_id != null){
      auction_id = data.auction_item_id;
    }

    if(auction_id === undefined || auction_id === 0){
      setActiveItem(null);
      setCurrentBidAmount(0);
      setCustomBidAmount(0);
      setBidHistory(null)

      axiosService
      .get(`/api/auctions/${auctionId}/get-by-id`)
        .then((response) => {
          setEvent(response.data);
        })
        .catch((error) => {
          console.log(error);
        });

      return;
    }

    axiosService.get(`/api/auctions/${auctionId}/${auction_id}/get-active-item`)
    .then((response) => {
      setActiveItem(response.data);
      
      // Check if user is winning this item
      if(response.data && response.data.bids && response.data.bids.length > 0) {
        const highestBidder = response.data.bids[0];
        setIsUserWinning(highestBidder.user_id === currentUser.id);
      } else {
        setIsUserWinning(false);
      }
      setBidHistory(response.data.bids)
    })
    .catch(() => {
      setActiveItem(null);
      setIsUserWinning(false);
    });
  };

  useEffect(() => {
    if(activeItem){
      if(activeItem.bids?.length > 0){
        const nextBid = activeItem.minimum_bid + (activeItem?.bids[0]?.bid_amount || 0);
        setCurrentBidAmount(nextBid);
        setCustomBidAmount(nextBid);
      } else {
        setCurrentBidAmount(activeItem.starting_bid);
        setCustomBidAmount(activeItem.starting_bid);
      }
    }
  }, [activeItem]);

  const [members, setMembers] = useState();
  const handleAuctionMembers = async () => {
    try {
      const response = await axiosService.get(`/api/auctions/${auctionId}/members`);
      setMembers(response.data);
    } catch (err) {
      console.error('Failed to update auction members:', err);
    }
  };

  useEffect(() => {
    if (channel) {
      channel.bind("active-item-event", handleActiveItem);
      channel.bind("bid-event", handleActiveItem);
      channel.bind("auction-members", handleAuctionMembers);
    }

    return () => {
      if (channel) {
        channel.unbind("active-item-event");
        channel.unbind("bid-event");
        channel.unbind("auction-members", handleAuctionMembers);
      }
    };
  }, [channel]);

  return (
    <div className="p-3 lg:p-5 bg-gray-100 min-h-screen">
      <div className="flex items-center mb-4">
        <i 
          className="pi pi-arrow-left text-xl cursor-pointer mr-3" 
          onClick={() => {
            axiosService.post(`/api/auctions/${auctionId}/${currentUser.id}/leave`);
            navigate("/main?page=ncaa-basketball-auction");
          }}
        />
        <h1 className="text-primary text-2xl lg:text-3xl font-semibold">{event?.name || "March Madness"}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column - Livestream */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-3">
            <i className="pi pi-video text-red-500 mr-2"></i>
            <h2 className="text-xl font-bold">Live Stream</h2>
            <Badge value="LIVE" severity="danger" className="ml-2"></Badge>
          </div>
          
          <div className="relative rounded-lg overflow-hidden border border-gray-200 mb-3">
            <ReactPlayer 
              url={event?.stream_url} 
              playing 
              playIcon={false} 
              controls={false}
              width="100%" 
              height="300px"
              config={{
                youtube: {
                  playerVars: { showinfo: 1 }
                }
              }}
            />
          </div>
          
          {/* Auction Items Section */}
          <div className="mt-5">
            <h3 className="text-lg font-semibold mb-3">Auction Items</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {event?.items?.map((item) => (
                <div 
                  key={item.id}
                  className={`p-2 flex items-center justify-center text-xs border rounded-md text-center cursor-pointer transition-colors ${
                    activeItem?.id === item.id ? 'bg-primary text-white' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  #{item.id} {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Bidding Interface */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-xl font-bold">Item on Bid</h2>
            <div className="mt-2">
              {activeItem ? (
                <>
                  <h3 className="text-xl font-medium">{activeItem.name}</h3>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div className="bg-gray-50 p-3 border rounded-md">
                      <p className="text-sm text-gray-500">Starting Bid</p>
                      <p className="text-lg font-semibold">${activeItem.starting_bid}</p>
                    </div>
                    <div className="bg-gray-50 p-3 border rounded-md">
                      <p className="text-sm text-gray-500">Minimum Bid Increment</p>
                      <p className="text-lg font-semibold">${activeItem.minimum_bid}</p>
                    </div>
                    <div className="bg-green-50 border-green-800 border p-3 rounded-md">
                      <p className="text-sm text-green-800">Current Bid</p>
                      <p className="text-lg text-green-800 font-semibold">${activeItem.bids?.length > 0 ? activeItem.bids[0].bid_amount : "-"}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 py-4">No active item on bid yet.</p>
              )}
            </div>
          </div>
          
          {activeItem && (
            <div className="p-4">
              {isUserWinning && (
                <div className="flex gap-2 items-center p-3 bg-green-50 rounded-md text-green-700 mb-4">
                  <i className="pi pi-check-circle"></i>
                  <p>You are winning this item.</p>
                </div>
              )}
              
              <div className="mb-4">
                <Button
                  type="button"
                  label={`Bid for $${currentBidAmount}`}
                  className="w-full p-button-primary rounded-lg"
                  loading={isBidding}
                  onClick={() => handlePlaceBid()}
                />
              </div>
              
              <div className="flex gap-2 items-center mb-4">
                <div className="flex-grow">
                  <InputNumber 
                    min={1} 
                    value={customBidAmount} 
                    onChange={(e) => setCustomBidAmount(e.value)} 
                    mode="currency" 
                    currency="USD"
                    locale="en-US"
                    className="w-full"
                    placeholder="Custom Bid Amount"
                  />
                </div>
                <Button
                  type="button"
                  label="Submit"
                  className="p-button-outlined"
                  loading={isBidding}
                  onClick={() => handlePlaceBid(customBidAmount)}
                />
              </div>
              
              {/* Bid History Section */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <i className="pi pi-history mr-2"></i>
                  Bid History
                  {bidHistory?.length > 0 && (
                    <Badge value={bidHistory?.length} className="ml-2" severity="info"></Badge>
                  )}
                </h3>
                
                <div className="max-h-64 overflow-y-auto">
                  {bidHistory?.length > 0 ? (
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {bidHistory.map((bid, index) => (
                          <tr key={index} className={bid.user_id === currentUser.id ? 'bg-blue-50' : ''}>
                            <td className="py-2 px-3 text-sm font-medium">${Number(bid.bid_amount).toFixed(2)}</td>
                            <td className="py-2 px-3 text-sm font-medium">{members.find((e) => e.user_id == bid.user_id)?.user.name || "-"}</td>
                            <td className="py-2 px-3 text-sm text-gray-500">{convertUTCToTimeZone(bid?.created_at, 'DD/MM/YYYY hh:mm A')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No bids yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAuction;