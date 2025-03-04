import { Button } from "primereact/button";
import LazyTable from "../../../components/tables/LazyTable";
import { useEffect, useState } from "react";
import CreateAuctionEvent from "../../../components/modals/settings/CreateAuctionEvent";
import { DateTemplate } from "../games/NFLTemplates";
import { Tooltip } from "primereact/tooltip";
import SetStreamUrlDialog from "../../../components/modals/settings/SetStreamUrlDialog";
import { useNavigate } from "react-router-dom";
import { useAxios } from "../../../contexts/AxiosContext";
import { TabPanel, TabView } from "primereact/tabview";
import { Divider } from "primereact/divider";
import { Card } from "primereact/card";
import { BiTrophy } from "react-icons/bi";
import Table from "../../../components/tables/Table";
import ViewTeamDetails from "../../../components/modals/settings/ViewTeamDetails";
import { Dropdown } from "primereact/dropdown";

const ManageAuction = ({pusher, channel, currentUser}) => {
  const navigate = useNavigate();
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [activeAuction, setActiveAuction] = useState();
  const [streamUrlModal, setStreamUrlModal] = useState(false);
  const [streamUrl, setStreamUrl] = useState(false);
  const [refreshTable, setRefreshTable] = useState(false);
  const axiosService = useAxios();

  const statusTemplate = (data) => {
    const emojis = {
      pending: "⏳",
      live: "⚡",
      completed: "✅",
      cancelled: "❌",
    };
  
    return <>
      <Tooltip target={`.${data}`} />
      <div className={`text-center ${data} flex items-center justify-center gap-2 `} data-pr-tooltip={data} data-pr-position="top">
        {emojis[data]}
      </div>
    </>
  };

  const auctionsColumn = [
    { field: 'name', header: 'Event Name', },
    { field: 'event_date', header: 'Date', hasTemplate: true, template: DateTemplate},
    { field: 'items', header: 'No. of Items', headerClassName: 'w-[120px]', hasTemplate: true, template: (data) => <div className="text-center">{data.length}</div>},
    { field: 'status', header: 'Status', hasTemplate: true, template: statusTemplate},
    { field: 'stream_url', header: 'Stream URL' },
  ];

  const handleOnSuccess = () => {
    setRefreshTable(true);
  }

  const handleOnHide = () => {
    setStreamUrlModal(false);
    setActiveAuction(0);
  }

  const handleEndAuction = (id) => {
    axiosService.get(`/api/auctions/${id}/end`).then((response) => {
      setRefreshTable(true);
    })
  }

  const customActions = (data) => {
    return (
      <div className="flex justify-end gap-1">
        <Button className="text-white border-background bg-background ring-0 rounded-lg text-sm" 
          tooltip="Team Details" 
          icon="pi pi-users" 
          data-pr-position="top" 
          onClick={(e) => {
            // setActiveAuction(data.id)
            // setStreamUrl(data.stream_url);
            // setStreamUrlModal(true);
            setActiveIndex(1)
            setTeamDetails(data.items) // for now
          }}
        />
        {data.status === "pending" && (
          <Button className="text-white border-background bg-background ring-0 rounded-lg text-sm" 
            tooltip="Start Auction" 
            icon="pi pi-play-circle" 
            data-pr-position="top" 
            onClick={(e) => {
              setActiveAuction(data.id)
              setStreamUrl(data.stream_url);
              setStreamUrlModal(true);
            }}/>
        )}
        {data.status === "live" && (
          <>
            <Button className="text-primary border-primary bg-transparent ring-0 rounded-lg text-sm" 
              tooltip="Open Link" 
              icon="pi pi-link" 
              data-pr-position="top" 
              onClick={(e) => { navigate(`/main?page=settings/manage-auction&auction_id=${data.id}`) }}/>

            <Button className="text-primaryS border-primaryS bg-transparent ring-0 rounded-lg text-sm" 
              tooltip="End Auction" 
              icon="pi pi-stop-circle" 
              data-pr-position="top" 
              onClick={(e) => handleEndAuction(data.id)}/>
          </>
        )}
        {data.status === "pending" && (
          <Button className="text-red-500 border-red-500 bg-transparent ring-0 rounded-lg text-sm" 
            tooltip="Cancel Auction" 
            icon="pi pi-times-circle" 
            data-pr-position="top" 
            />
        )}
        
      </div>
    )
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const [teamDetails, setTeamDetails] = useState(null);
  const [activeTeam, setActiveTeam] = useState();

  const [selectedRegion, setSelectedRegion] = useState("East");
  const regions = [
    {name: 'East', value: "East", icon: 'pi pi-compass'},
    {name: 'West', value: "West", icon: 'pi pi-compass'},
    {name: 'Midwest', value: "Midwest", icon: 'pi pi-compass'},
    {name: 'South', value: "South", icon: 'pi pi-compass'},
  ];
  
  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex items-center gap-2 justify-between">
        <div className="text-primary text-3xl font-semibold">Manage Auctions</div>
        <Button label="Create Auction Event" icon="pi pi-plus" className="rounded-lg border-primaryS bg-primaryS" onClick={() => setShowAuctionModal(true)}/>
      </div>
      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
        <TabView activeIndex={activeIndex} onTabChange={(e) => {setActiveIndex(e.index); setTeamDetails(null)}}>
          <TabPanel header="Auctions" className="flex justify-center">
            <LazyTable api={'/api/auctions'}
              columns={auctionsColumn}
              refreshTable={refreshTable} setRefreshTable={setRefreshTable}
              hasOptions={true}
              actions={true} customActions={customActions}
            />
          </TabPanel>
          <TabPanel header="Team Details" disabled={!teamDetails} className="">
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
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seed</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nickname</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Owner</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Bid Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamDetails?.filter(item => item.ncaa_team?.region === selectedRegion).map((team, i) => (
                  <tr
                    key={team.id}
                    className={`
                      hover:bg-gray-50
                      transition-all duration-300
                    `}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium">{team.ncaa_team?.region}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium">{team.ncaa_team?.seed}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium">{team.ncaa_team?.school}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium text-center">{team.ncaa_team?.nickname}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium text-center">{team.owner?.name || "-"}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium text-center text-green-600">{!team.sold_amount ? '-' : '$' + Number(team.sold_amount).toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {
                        team.owner && 
                        <Button 
                          size="small"
                          label="View"
                          icon="pi pi-eye"
                          className="text-xs"
                          onClick={() => setActiveTeam(team)}
                        />
                      }
                      
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
          </TabPanel>
        </TabView>
        
      </div>
      <ViewTeamDetails visible={activeTeam} data={activeTeam} onHide={() => setActiveTeam(null)} />
      <CreateAuctionEvent visible={showAuctionModal} onSuccess={handleOnSuccess} onHide={() => setShowAuctionModal(false)} />
      <SetStreamUrlDialog visible={streamUrlModal} streamUri={streamUrl} auctionId={activeAuction} onHide={() => handleOnHide()}/>
    </div>
  )
}

export default ManageAuction;