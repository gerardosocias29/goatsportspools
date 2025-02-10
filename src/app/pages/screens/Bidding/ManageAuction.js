import { Button } from "primereact/button";
import LazyTable from "../../../components/tables/LazyTable";
import { useState } from "react";
import CreateAuctionEvent from "../../../components/modals/settings/CreateAuctionEvent";
import { DateTemplate } from "../games/NFLTemplates";
import { Tooltip } from "primereact/tooltip";
import SetStreamUrlDialog from "../../../components/modals/settings/SetStreamUrlDialog";

const ManageAuction = () => {

  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [activeAuction, setActiveAuction] = useState();
  const [streamUrlModal, setStreamUrlModal] = useState(false);
  const [refreshTable, setRefreshTable] = useState(false);

  const statusTemplate = (data) => {
    const emojis = {
      pending: "⏳",
      active: "⚡",
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

  const customActions = (data) => {
    return (
      <div className="flex justify-end gap-1">
        {data.status === "pending" && (
          <Button className="text-white border-background bg-background ring-0 rounded-lg text-sm" 
            tooltip="Start Auction" 
            icon="pi pi-play-circle" 
            data-pr-position="top" 
            onClick={(e) => {
              setActiveAuction(data.id)
              setStreamUrlModal(true)
            }}/>
        )}
        {data.status === "active" && (
          <Button className="text-primaryS border-primaryS bg-transparent ring-0 rounded-lg text-sm" 
            tooltip="End Auction" 
            icon="pi pi-stop-circle" 
            data-pr-position="top" 
            onClick={(e) => {}}/>
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

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex items-center gap-2 justify-between">
        <div className="text-primary text-3xl font-semibold">Manage Auctions</div>
        <Button label="Create Auction Event" icon="pi pi-plus" className="rounded-lg border-primaryS bg-primaryS" onClick={() => setShowAuctionModal(true)}/>
      </div>
      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
        <LazyTable api={'/api/auctions'}
          columns={auctionsColumn}
          refreshTable={refreshTable} setRefreshTable={setRefreshTable}
          hasOptions={true}
          actions={true} customActions={customActions}
        />
      </div>

      <CreateAuctionEvent visible={showAuctionModal} onSuccess={handleOnSuccess} onHide={() => setShowAuctionModal(false)} />
      <SetStreamUrlDialog visible={streamUrlModal} auctionId={activeAuction} onHide={() => handleOnHide()}/>
    </div>
  )
}

export default ManageAuction;