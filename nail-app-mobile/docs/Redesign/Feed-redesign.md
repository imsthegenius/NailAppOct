import React from "react";
import { ContentArea } from "./ContentArea";
import { Frame } from "./Frame";
import { Group } from "./Group";
import { GroupWrapper } from "./GroupWrapper";
import { TabBar } from "./TabBar";
import image from "./image.svg";

export const IphoneProMax = () => {
  return (
    <div className="bg-white overflow-hidden w-full min-w-[440px] min-h-[956px] relative">
      <div className="absolute top-[173px] left-[calc(50.00%_-_217px)] w-[435px] h-[874px] flex flex-col gap-[11px] overflow-hidden">
        <Frame />
        <Group />
        <GroupWrapper />
      </div>

      <ContentArea />
      <TabBar />
      <div className="inline-flex items-center gap-72 p-[5px] absolute top-[19px] left-[calc(50.00%_-_209px)] rounded-xl overflow-hidden">
        <div className="relative w-[85px] mt-[-1.00px] bg-[linear-gradient(200deg,rgba(255,161,186,0.7)_0%,rgba(231,10,90,0.7)_99%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'SF_Pro-Bold',Helvetica] font-bold text-transparent text-[34px] tracking-[-1.00px] leading-[41px]">
          Feed
        </div>

        <img
          className="relative w-[22px] h-[26px] mr-[-1.00px]"
          alt="Icon"
          src={image}
        />
      </div>
    </div>
  );
};
