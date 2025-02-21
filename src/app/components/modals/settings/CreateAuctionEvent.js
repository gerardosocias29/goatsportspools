import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { useState, useEffect } from "react";
import { useAxios } from "../../../contexts/AxiosContext";
import { useToast } from "../../../contexts/ToastContext";
import { InputTextarea } from "primereact/inputtextarea";

const CreateAuctionEvent = ({
  visible = false, 
  header = "Create Auction Event",
  onHide,
  onSuccess,
}) => {
  const showToast = useToast();
  const axiosService = useAxios();
  
  const auctionItemsTemplate = {
    name: "",
    description: "",
    starting_bid: 0,
    minimum_bid: 0,
    target_bid: 0,
  };

  const auctionData = {
    name: "",
    stream_url: "",
    event_date: null,
    items: [],
  };

  const [newData, setNewData] = useState(auctionData);

  useEffect(() => {
    if (visible) {
      setNewData({ ...auctionData, items: [{ ...auctionItemsTemplate }] });
    }
  }, [visible]);

  const handleChange = (key, value) => {
    setNewData((prev) => ({ ...prev, [key]: value }));
  };

  const handleItemChange = (index, key, value) => {
    setNewData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [key]: value };
      return { ...prev, items: updatedItems };
    });
  };

  const addItem = () => {
    setNewData((prev) => ({
      ...prev,
      items: [...prev.items, { ...auctionItemsTemplate }],
    }));
  };

  const removeItem = (index) => {
    setNewData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axiosService.post("/api/auctions/create", newData)
      .then((response) => {
        showToast({
          severity: response.data.status ? "success" : "error",
          summary: response.data.status ? "Success!" : "Error!",
          detail: response.data.message,
        });
        onSuccess();
        handleOnHide();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleOnHide = () => {
    setNewData(auctionData);
    onHide();
  };

  return (
    <Dialog className="lg:w-1/4 w-[95%]" header={header} visible={visible} draggable={false} maximizable={false} onHide={handleOnHide}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex flex-col">
          <label className="font-semibold">Auction Name</label>
          <InputText className="text-sm" required value={newData.name} onChange={(e) => handleChange("name", e.target.value)} />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold">Event Date</label>
          {/* <Calendar className="text-sm" minDate={new Date(new Date().setMonth(new Date().getMonth() - 1))} placeholder="MM/DD/YYYY HH:mm" value={newData.event_date} 
            onChange={(e) => handleChange("event_date", e.value)} showTime hourFormat="24"
            showButtonBar stepMinute={1}
          /> */}
          <input
            type="datetime-local"
            className="text-sm border rounded p-2"
            value={newData.event_date}
            onChange={(e) => handleChange("event_date", e.target.value)}
            min={new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 16)}
            required
          />
        </div>

        {/* <div className="lg:col-span-4 flex flex-col"> */}
          {/* <label className="font-semibold">Stream URL</label>
          <InputText className="text-sm" required value={newData.stream_url} placeholder="Livestream Link e.g Youtube or Twitch" onChange={(e) => handleChange("stream_url", e.target.value)} /> */}
        {/* </div> */}

        

        {/* <div className="border-t pt-4 lg:col-span-8">
          <label className="font-bold">Auction Items</label>
          {newData.items.map((item, index) => (
            <div key={index} className="grid lg:grid-cols-6 gap-2 border p-3 mb-2">
              
              <div className="lg:col-span-3 flex flex-col">
                <label className="font-semibold">Item Name</label>
                <InputText className="text-sm" required value={item.name} onChange={(e) => handleItemChange(index, "name", e.target.value)} />
              </div>
              {
                index != 0 ? (
                  <div className="flex justify-end items-center lg:col-span-3">
                    <Button rounded icon="pi pi-trash" className="text-red-500 border-transparent bg-transparent" onClick={() => removeItem(index)} />
                  </div>
                ) : <div className="lg:col-span-3 hidden lg:block"></div>
              }
              
              <div className="lg:col-span-2 flex flex-col">
                <label className="font-semibold">Starting Bid</label>
                <InputNumber className="text-sm" required useGrouping={false} value={item.starting_bid} onChange={(e) => handleItemChange(index, "starting_bid", e.value)} />
              </div>
              <div className="lg:col-span-2 flex flex-col">
                <label className="font-semibold">Minimum Bid</label>
                <InputNumber className="text-sm" required useGrouping={false} value={item.minimum_bid} onChange={(e) => handleItemChange(index, "minimum_bid", e.value)} />
              </div>
              <div className="lg:col-span-2 flex flex-col">
                <label className="font-semibold">Target Bid (Optional)</label>
                <InputNumber className="text-sm" useGrouping={false} value={item.target_bid} onChange={(e) => handleItemChange(index, "target_bid", e.value)} />
              </div>
              <div className="lg:col-span-6 flex flex-col">
                <label className="font-semibold">Description</label>
                <InputTextarea required value={item.description} onChange={(e) => handleItemChange(index, "description", e.target.value)} />
              </div>
            </div>
          ))}
          <Button label="Add Item" icon="pi pi-plus" className="p-button-success" onClick={addItem} />
        </div> */}

        <div className="flex lg:col-span-8 justify-end mt-4">
          <Button type="submit" label="Create Auction Event" icon="pi pi-check" className="rounded-lg border-primaryS bg-primaryS" />
        </div>
      </form>
    </Dialog>
  );
};

export default CreateAuctionEvent;