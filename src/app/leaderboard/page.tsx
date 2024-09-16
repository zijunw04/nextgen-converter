"use client";
import { useState, useEffect } from "react";
import { ref, onValue, query, orderByChild } from "firebase/database";
import { database } from "@/src/app/firebase";
import { useSession } from "next-auth/react";
import bytesToSize from "@/utils/bytes-to-size";
import Navbar from "@/components/navbar";

interface User {
  id: string;
  name: string;
  uploads: number;
  totalSize: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const usersRef = ref(database, "users");
    const leaderboardQuery = query(usersRef, orderByChild("uploads"));

    const unsubscribe = onValue(leaderboardQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sortedUsers: User[] = Object.entries(data)
          .map(([id, user]: [string, any]) => ({ id, ...user }))
          .sort((a, b) => b.uploads  - a.uploads ); 

        setLeaderboard(sortedUsers);

        if (session?.user) {
          const userId = session.user.id || session.user.email || "Anonymous";
          const rank = sortedUsers.findIndex((u) => u.id === userId) + 1;
          setUserRank(rank > 0 ? rank : null);
        }
      }
    });

    return () => unsubscribe();
  }, [session]);

  return (
    <div className="w-full h-screen">
      <Navbar />
      <div className="w-full  flex justify-start items-center flex-col">
        <h1 className=" text-8xl mt-12 w-full text-center text-[#eb2f2f]">Leaderboard</h1>
                    <p className="text-center text-xl">
                      Sign-in to show on the leaderboard
                    </p>
        <div className="w-full mt-20 grid grid-cols-4 text-center text-xl font-extrabold  items-center justify-center px-[10%]">
              <span className="">Rank</span>
              <span className=" ">User</span>
              <span className="">Uploads</span>
              <span className=" ">Total Size</span>
        </div>
          <div className=" w-full px-[10%] flex justify-center items-center flex-col gap-4 mt-4 ">
            {leaderboard.map((user, index) => (
              <div key={user.id} className="w-full grid grid-cols-4 justify-center items-center text-center border-[rgb(50_50_40)] border-[1px] py-3 rounded-3xl">
                <span>{index + 1}</span>
                <span>
                  {session?.user?.id === user.id ||
                  session?.user?.email === user.id
                    ? "You"
                    : user.name || `User ${index + 1}`}
                </span>
                <span>{user.uploads}</span>
                <span>{bytesToSize(user.totalSize)}</span>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
}
