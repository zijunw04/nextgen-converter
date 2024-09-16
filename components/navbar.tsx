// imports
import Image from "next/image";
import SignOutButton from './signout'


export default function Navbar({}): any {
    
  return (
    <nav className=" z-50 items-center grid grid-cols-3 w-screen max-w-[100%] h-20 backdrop-blur-md bg-background border-b-[1px] border-[rgb(50_50_40)]">
      <a href="/" className=" justify-center flex items-center flex-row gap-2">
        <Image alt="" src="/images/logosmall.png" width={70} height={70} />
        <h1 className="text-xl">NEXTGEN CONVERTER <sup className="text-[#df46fd]">BETA</sup></h1>
      </a>
      <div className="hidden gap-1 md:gap-2 lg:gap-4 md:flex justify-center">
        <a className="font-semibold text-md" href="/">Home</a>
        <a className="font-semibold text-md" href="/leaderboard">Leaderboard</a>
      </div>
      <div className="flex items-center gap-2  justify-center">
        <SignOutButton />
        </div>

    </nav>
  );
}
