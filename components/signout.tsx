// components/AuthButton.tsx
'use client';

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function AuthButton() {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (session && session.user) {
    return (
      <div className="relative">
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="border-[rgb(50_50_40)] border-[1px] text-[#ffffe3] font-bold py-3 px-7 rounded-3xl"
        >
          Hello, {session.user.name || 'User'}!
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 border-[rgb(50_50_40)] border-[1px] text-[#ffffe3] rounded-3xl  overflow-hidden shadow-xl z-10 ">
            <a 
              href="/codeconvert"
              className="block px-4 py-2 text-sm w-full text-center bg-[#0e100f]"
            >
              Code Converter
            </a>
            <button 
              onClick={() => signOut()}
              className="block px-4 py-2 text-sm w-full text-center bg-[#0e100f]"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <a 
      href="/signin"
      className="border-[rgb(50_50_40)] border-[1px] text-[#ffffe3] font-bold py-3 px-7 rounded-3xl"
    >
      Sign In
    </a>
  );
}
