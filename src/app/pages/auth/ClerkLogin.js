import { SignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export default function ClerkLogin() {

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
  return (
    // <SignIn />
    <div className="grid md:grid-cols-2 items-center gap-1 min-h-screen">
      <div className={`rounded-tr-[100px] rounded-br-[100px] relative hidden bg-background bg-cover bg-center bg-no-repeat bg-[url(https://goatsportspools.com/img/newlogo.png)] h-full flex-col md:flex md:shrink md:w-full m-auto`}>
        {/* <div className="absolute w-full h-full bg-black bg-opacity-50 rounded-tr-[100px] rounded-br-[100px]"></div> */}
        {/* <div className="flex text-[#f7975d] text-3xl lg:text-5xl xl:text-7xl text-center font-sans font-black m-auto z-[1]">Welcome to GoatSportsPools!</div> */}
        <div className="flex mb-8 text-white z-[1] flex-col p-4 absolute w-full top-0">
          <div className="bg-white/30 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-4 max-w-lg">
            <p className="text-xl font-bold">Welcome to the inaugural Goat Sports Pools!</p>
            <p className="text-md">FREE to enter - WIN $200</p>
            <p className="text-md">Initial $10 - 6000 for wagering</p>
            <p className="text-md">Rebuys will cost $40 for 30000 wagering</p>
            <p className="hover:underline mt-4 inline-block cursor-pointer text-primaryS" onClick={handleHowItWorks}>
              CLICK Here to see how it works
            </p>
          </div>
          
        </div>
      </div>
      <div className="p-5 flex flex-col m-auto w-full h-full bg-cover flex items-center justify-center bg-center bg-no-repeat bg-[url('https://goatsportspools.com/img/newlogo.png')] md:w-full md:bg-none bg-background md:bg-white">
        <div className="flex text-white z-[1] flex-col p-4 w-full top-0 md:hidden">
          <div className="bg-white/30 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-2">
            <p className="text-sm font-bold">Welcome to the inaugural Goat Sports Pools!</p>
            <p className="text-xs">FREE to enter - WIN $200</p>
            <p className="text-xs">Initial $10 - 6000 for wagering</p>
            <p className="text-xs">Rebuys will cost $40 for 30000 wagering</p>
            <p className="text-xs hover:underline mt-1 inline-block cursor-pointer text-primaryS" onClick={handleHowItWorks}>
              CLICK Here to see how it works
            </p>
          </div>
          
        </div>
        <SignIn fallbackRedirectUrl={'main?page='} signUpUrl="/signup" />
      </div>
    </div>
  )
}