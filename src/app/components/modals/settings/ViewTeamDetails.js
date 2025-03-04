import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { BiTrophy } from "react-icons/bi";

const ViewTeamDetails = ({
  visible = false,
  onHide,
  data
}) => {


  return (
    <Dialog className="lg:w-2/3 w-[95%]" header={'Team Details'} visible={visible} draggable={false} maximizable={false} onHide={onHide}>
      <div className="w-full">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Team Information Section */}
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mr-3">
                {data?.ncaa_team?.seed}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{data?.name}</h2>
                <p className="text-gray-600">{data?.ncaa_team?.region} Region</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">School</p>
                <p className="font-medium">{data?.ncaa_team?.school}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nickname</p>
                <p className="font-medium">{data?.ncaa_team?.nickname}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-3 mb-2">
                <BiTrophy className="text-yellow-500" size={24} />
                <h3 className="text-lg font-semibold">Current Owner</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Owner ID</p>
                  <p className="font-medium">{data?.owner?.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Owner Name</p>
                  <p className="font-medium">{data?.owner?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Final Bid Price</p>
                  <p className="font-bold text-lg text-green-600">${Number(data?.sold_amount).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bid History Section */}
          <Divider layout="vertical" className="hidden md:block" />
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-4">Bid History</h3>
            <div className="space-y-4">
              {data?.bids?.slice(0, 4).map((bid, index) => (
                <div key={index} className={`p-3 rounded-lg ${index === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 
                        ${index === 0 ? 'bg-yellow-500 text-white' : 
                          index === 1 ? 'bg-gray-400 text-white' : 
                          index === 2 ? 'bg-amber-700 text-white' : 'bg-gray-200'}`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{bid?.user?.name}</p>
                        <p className="text-xs text-gray-500">ID: {bid?.user?.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${index === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                        ${Number(bid?.bid_amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default ViewTeamDetails;