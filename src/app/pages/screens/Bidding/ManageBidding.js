import { Button } from "primereact/button";
import LazyTable from "../../../components/tables/LazyTable";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const ManageBidding = () => {
  const location = useLocation();

  const [refreshTable, setRefreshTable] = useState(false);
  const eventsColumn = [
    { field: 'name', header: 'Event Name', },
    { field: 'date', header: 'Date'},
    { field: 'no_of_items', header: 'No. of Items', headerClassName: 'w-[120px]'},
    { field: 'status', header: 'Status' },
    { field: 'stream_url', header: 'Stream URL' },
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if(params.get("auction_id")){
      alert("auction_id");
    }
  }, [location.search]);

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex items-center gap-2 justify-between">
        <div className="text-primary text-3xl font-semibold">Manage Auctions</div>
        <Button label="Create Auction Event" icon="pi pi-plus" className="rounded-lg border-primaryS bg-primaryS" onClick={() => {}}/>
      </div>
      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
        <LazyTable api={'/api/games/manage'}
          columns={eventsColumn}
          refreshTable={refreshTable} setRefreshTable={setRefreshTable}
          hasOptions={true}
        />
      </div>
    </div>
  )
}

export default ManageBidding;