// components/LoginScreen.tsx
"use client";

import { FaGoogle } from "react-icons/fa";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import Navbar from "@/components/navbar";
import Image from "next/image";
import RandomSvgAnimation from "@/components/randomMovement";

export default function LoginScreen() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session) {
      window.location.href = "/";
    }
  }, [session]);

  const handleSignIn = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session) {
    return null; 
  }

  return (
    <div className=" min-h-screen w-full">
      <Navbar />
      <div className="w-full grid grid-cols-2 md:grid-rows-2 h-[90vh] overflow-hidden">
        <div className="flex flex-col items-center justify-center w-full h-[90vh] border-r-[1px] border-[rgb(50_50_40)] ">
          <h1 className="text-2xl font-bold mb-4">NextGen Converter</h1>
          <p>Thank you for choose us! Sign up here!</p>
          <div className="flex flex-col justify-center items-center mt-5">
            <button 
              onClick={handleSignIn}
              className="border-[rgb(50_50_40)] border-[1px] text-[#ffffe3] font-bold py-3 px-7 rounded-3xl flex flex-row gap-2 items-center justify-center"
            >
              <span><FaGoogle /></span>
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-[90vh] bg-[repeating-linear-gradient(45deg,#0e100f_0px,#0e100f_20px,#0e100f_20px,#000_40px)] overflow-hidden relative">
          <RandomSvgAnimation />
          <Image alt="" className="z-50 " src="/images/logo.png" width={500} height={500} />
        </div>
      </div>
      
      
      
    </div>
  );
}
