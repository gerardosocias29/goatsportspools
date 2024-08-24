import { SignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export default function ClerkLogin() {

  const navigate = useNavigate();

  const handleHowItWorks = () => {
    navigate('/how-it-works');
  }
  
  return (
    // <SignIn />
    <div className="grid md:grid-cols-2 items-center gap-1 min-h-screen">
      <div className={`rounded-tr-[100px] rounded-br-[100px] relative hidden bg-background bg-cover bg-center bg-no-repeat bg-[url(https://goatsportspools.com/img/logo_expanded.png)] h-full flex-col md:flex md:shrink md:w-full m-auto`}>
        <div className="absolute w-full h-full bg-black bg-opacity-50 rounded-tr-[100px] rounded-br-[100px]"></div>
        <div className="flex text-white text-3xl lg:text-5xl xl:text-7xl text-center font-sans font-black m-auto z-[1]">Welcome to GoatSportsPools!</div>
        <div className="flex mb-8 text-white z-[1] justify-center flex-col items-center">
          <div>
            <p className="text-lg font-bold">Welcome to the inaugural GOAT Wagers league</p>
            <p className="text-md">Completely FREE to enter - WIN $200</p>
            <p className="text-md">Initial $10 - 6000 for wagering</p>
            <p className="text-md">Rebuys will cost $40 for 30000 wagering</p>
            <p className="hover:underline mt-4 inline-block cursor-pointer text-primaryS" onClick={handleHowItWorks}>
              CLICK Here to see how it works
            </p>
          </div>
          
        </div>
      </div>
      <div className="p-5 flex flex-col m-auto w-full h-full bg-cover flex items-center justify-center bg-center bg-no-repeat bg-[url('https://goatsportspools.com/img/logo_expanded.png')] md:w-full md:bg-none bg-background md:bg-white">
        <SignIn fallbackRedirectUrl={'main?page=how-it-works'} signUpUrl="/signup" />
      </div>
    </div>
  )
}