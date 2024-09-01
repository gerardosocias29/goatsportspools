import { SignIn } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAxios } from "../../contexts/AxiosContext";

export default function ClerkLogin() {
  const axiosService = useAxios();

  
  const navigate = useNavigate();

  const handleHowItWorks = () => {
    navigate('/how-it-works');
  }
  // games, how it works
  // page 2 in bet history
  // limit wager if balance is not 
  // open bets above bet history
  // show scores when win but not on pending
  // total balance = available balance

  const [data, setData] = useState();
  const getData = () => {
    axiosService.get('/api/d').then((response) => {
      console.log(response.data);
      setData(response.data);
    }).catch((error) => {
      console.log(error);
    });
  }

  useEffect(()=> {
    getData();
  }, []);
  return (
    // <SignIn />
    <div className="grid md:grid-cols-2 items-center gap-1 min-h-screen">
      <div className={`rounded-tr-[100px] rounded-br-[100px] relative hidden bg-background bg-cover bg-center bg-no-repeat bg-[url(https://goatsportspools.com/assets/images/logo_expanded.png)] h-full flex-col flex justify-end md:flex md:shrink md:w-full m-auto`}>
        <div className="absolute w-full h-full bg-black bg-opacity-50 rounded-tr-[100px] rounded-br-[100px]"></div>
        <div className="text-white text-center flex flex-col z-[1] pb-[50px]">
          <p className="text-3xl lg:text-5xl xl:text-5xl text-center font-sans font-black">Welcome to GoatSportsPools!</p>
          <p className="text-md mt-4">FREE to enter - WIN $200</p>
          <p className="text-md">Initial $10 - 6000 for wagering</p>
          <p className="text-md">Rebuys will cost $40 for 30000 wagering</p>
          <p className="hover:underline mt-4 inline-block cursor-pointer text-primaryS" onClick={handleHowItWorks}>
            CLICK Here to see how it works
          </p>
        </div>
        <div className="flex mb-8 text-white z-[1] flex-col p-4 absolute w-full top-0">
          <div className="bg-white/30 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-4 max-w-xs">
            {/* <p className="text-xl font-bold">Welcome to the inaugural Goat Sports Pools!</p>
            <p className="text-md mt-4">FREE to enter - WIN $200</p>
            <p className="text-md">Initial $10 - 6000 for wagering</p>
            <p className="text-md">Rebuys will cost $40 for 30000 wagering</p> */}

            <p className="text-xs">1 - Total GOAT Players</p>
            <p className="text-xs">1 - Number of $10 GOAT buyins</p>
            <p className="text-xs">0 - Number rebuys</p>

            <p className="text-xs mt-4 font-bold">October Prize pool is $200</p>
            <p className="text-xs font-bold">January Prize pool is $100</p>


            {/* <p className="hover:underline mt-4 inline-block cursor-pointer text-primaryS" onClick={handleHowItWorks}>
              CLICK Here to see how it works
            </p> */}
          </div>
          
        </div>
      </div>
      <div className="p-5 flex flex-col m-auto w-full h-full bg-cover gap-2 flex items-center justify-center bg-center bg-no-repeat bg-[url('https://goatsportspools.com/assets/images/logo_expanded.png')] md:w-full md:bg-none bg-background md:bg-white">
        <div className="flex text-white z-[1] flex-col w-full top-0 md:hidden">
          <div className="bg-white/30 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-2">
            <p className="text-sm font-bold">Welcome to the inaugural Goat Sports Pools!</p>
            <p className="text-xs">FREE to enter - WIN $200</p>
            <p className="text-xs">Initial $10 - 6000 for wagering</p>
            <p className="text-xs">Rebuys will cost $40 for 30000 wagering</p>
            
            <p className="text-xs mt-4">1 - Total GOAT Players</p>
            <p className="text-xs">1 - Number of $10 GOAT buyins</p>
            <p className="text-xs">0 - Number rebuys</p>

            <p className="text-xs mt-4 font-bold">October Prize pool is $200</p>
            <p className="text-xs font-bold">January Prize pool is $100</p>

            <p className="text-xs hover:underline mt-1 inline-block cursor-pointer text-primaryS" onClick={handleHowItWorks}>
              CLICK Here to see how it works
            </p>
          </div>
          
        </div>
        <SignIn fallbackRedirectUrl={'main?page='} signUpUrl="/signup" forceRedirectUrl={'main?page=games/nfl'}/>
      </div>
    </div>
  )
}