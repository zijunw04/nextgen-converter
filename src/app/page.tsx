// app/page.tsx
"use client";

import Navbar from "@/components/navbar";
import FileConvert from "./fileconvert";

export default function Home() {

  return (
    <div className="w-screen max-w-[100%] min-h-screen">
        <Navbar />
        <FileConvert />
    </div>
  );
}
