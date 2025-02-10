import React, { useState } from "react";
import axios from "axios";
import { useAxios } from "../../../contexts/AxiosContext";

const PlaceBid = () => {
  const axiosService = useAxios();
  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState("");

  const submitBid = async () => {
    axiosService.post('/api/bid', {
      username,
      amount: parseFloat(amount),
    }).then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold">Place a Bid</h2>
      <input
        type="text"
        placeholder="Username"
        className="w-full p-2 mt-2 text-black"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="number"
        placeholder="Bid Amount"
        className="w-full p-2 mt-2 text-black"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button className="mt-2 p-2 bg-green-500 text-white" onClick={submitBid}>
        Submit Bid
      </button>
    </div>
  );
};

export default PlaceBid;
