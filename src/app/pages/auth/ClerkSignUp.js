import { SignUp } from "@clerk/clerk-react";

export default function ClerkSignup() {
  return (
    // <SignIn />
    <div className="grid md:grid-cols-2 items-center gap-1 min-h-screen">
      <div className={`rounded-tr-xl rounded-br-xl relative hidden bg-background bg-cover bg-center bg-no-repeat bg-[url(https://goatsportspools.com/img/logo_expanded.png)] h-full md:flex md:shrink md:w-full m-auto`}>
        <div className="absolute w-full h-full bg-black bg-opacity-50 rounded-tr-xl rounded-br-xl"></div>
        <div className="flex text-white text-3xl lg:text-5xl xl:text-7xl text-center font-sans font-black m-auto z-[1]">Welcome to GoatSportsPools!</div>
      </div>
      <div className="p-5 flex flex-col m-auto w-full h-full bg-cover flex items-center justify-center bg-center bg-no-repeat bg-[url('https://goatsportspools.com/img/logo_expanded.png')] md:w-full md:bg-none bg-background md:bg-white">
        <SignUp fallbackRedirectUrl={'/login'} signInUrl="/login" />
      </div>
    </div>
  )
}