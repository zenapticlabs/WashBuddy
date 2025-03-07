"use client";

import Topbar from "@/components/pages/main/Topbar";

export default function Rewards() {
  return (
    <>
      <div className="flex flex-col">
        <Topbar sideBarAlwaysOpen={true} />
        <div className="flex flex-col ml-[210px] ">
          Rewards
        </div>
      </div>
    </>
  );
}
