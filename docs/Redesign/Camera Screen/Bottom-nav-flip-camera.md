import React from "react";
import { LiquidGlassRegular } from "./LiquidGlassRegular";
import { Maximize } from "./Maximize";
import { Size48 } from "./Size48";
import blur from "./blur.svg";
import icon from "./icon.svg";

export const TabBar = () => {
  return (
    <div className="flex w-[415px] h-[93px] items-center justify-between px-7 py-1 relative">
      <div className="inline-flex items-center relative flex-[0_0_auto]">
        <LiquidGlassRegular
          blur="blur-2.svg"
          blurClassName="!left-[-26px] !top-[-26px]"
          className="!h-[calc(100%_+_8px)] !absolute !-left-1 !w-[calc(100%_+_8px)] !-top-1"
          mode="light"
          state="default"
        />
        <div className="flex flex-col w-[102px] items-center justify-center gap-px pt-1.5 pb-[7px] px-2 relative -ml-2.5">
          <div className="absolute w-full h-full top-0 left-0 bg-[#ededed] rounded-[100px]" />

          <div className="flex h-7 items-center justify-center gap-2.5 relative self-stretch w-full">
            <Maximize className="!relative !w-6 !h-6" />
          </div>

          <div className="relative self-stretch bg-[linear-gradient(200deg,rgba(255,161,186,0.7)_0%,rgba(231,10,90,0.7)_99%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'SF_Pro-Bold',Helvetica] font-bold text-transparent text-[10px] text-center tracking-[0] leading-3">
            Design
          </div>
        </div>

        <div className="flex flex-col w-[102px] items-center justify-center gap-px pt-1.5 pb-[7px] px-2 relative -ml-2.5">
          <div className="flex h-7 items-center justify-center gap-2.5 relative self-stretch w-full">
            <Size48 className="!relative !w-[24.9px] !h-6" color="#B3B3B3" />
          </div>

          <div className="relative self-stretch [font-family:'SF_Pro-Medium',Helvetica] font-medium text-black text-[10px] text-center tracking-[0] leading-3">
            Feed
          </div>
        </div>
      </div>

      <div className="inline-flex items-center relative flex-[0_0_auto]">
        <div className="absolute w-[calc(100%_+_8px)] h-[calc(100%_+_8px)] -top-1 -left-1">
          <img
            className="absolute w-[calc(100%_+_52px)] h-[calc(100%_+_52px)] top-[-26px] left-[-26px] object-cover"
            alt="Blur"
            src={blur}
          />

          <div className="absolute w-full h-full top-0 left-0 rounded-[296px] bg-blend-color-dodge bg-[linear-gradient(0deg,rgba(247,247,247,1)_0%,rgba(247,247,247,1)_100%),linear-gradient(0deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0.5)_100%),linear-gradient(0deg,rgba(51,51,51,1)_0%,rgba(51,51,51,1)_100%)]" />

          <div className="absolute w-full h-full top-0 left-0 bg-[#00000000] rounded-[296px] backdrop-blur-[3.0px] backdrop-brightness-[100.0%] backdrop-saturate-[95.0%] [-webkit-backdrop-filter:blur(3.0px)_brightness(100.0%)_saturate(95.0%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.40),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_2px_rgba(0,0,0,0.20),inset_-1px_0_2px_rgba(0,0,0,0.16)]" />
        </div>

        <div className="relative w-12 h-12 -ml-2.5">
          <img
            className="absolute top-[calc(50.00%_-_14px)] left-[calc(50.00%_-_13px)] w-[27px] h-[27px]"
            alt="Icon"
            src={icon}
          />
        </div>
      </div>
    </div>
  );
};
