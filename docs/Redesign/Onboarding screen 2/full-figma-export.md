import React from "react";
import { App } from "./App";

export const Onboarding = () => {
  return (
    <div className="bg-[#f6f4f0] w-full min-w-[440px] min-h-[956px] relative">
      <App className="!h-[956px] !absolute !rotate-180 !left-0 !bg-[linear-gradient(180deg,rgba(231,10,90,0.4)_0%,rgba(255,161,186,0.1)_82%)] !bg-[unset] !w-[440px] !top-0" />
      <div className="flex flex-col w-[393px] items-end gap-[138px] absolute top-[242px] left-[23px]">
        <div className="flex flex-col w-[379px] items-start gap-[101px] relative flex-[0_0_auto]">
          <div className="relative flex items-center justify-center self-stretch mt-[-1.00px] [font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#f6f4f0] text-[64px] tracking-[0] leading-[68px]">
            Choose from 300+ colours
          </div>

          <p className="relative flex items-center justify-center w-[365px] h-[220px] [font-family:'Open_Sans-SemiBold',Helvetica] font-semibold text-[#f6f4f0] text-[32px] tracking-[0] leading-[normal]">
            Pick a colour, pick a shape, upload a photo and watch colours come
            to life on your nails.
          </p>
        </div>

        <div className="flex h-10 items-start gap-2.5 p-[15px] relative self-stretch w-full">
          <div className="absolute top-0 right-0 w-[393px] h-10 flex items-center justify-center [font-family:'Open_Sans-SemiBold',Helvetica] font-semibold text-[#f6f4f0] text-lg text-right tracking-[0] leading-[normal]">
            Skip
          </div>

          <div className="relative w-[52.08px] h-[10.67px] mb-[-0.67px]">
            <div className="left-0 opacity-20 absolute top-0 w-[9px] h-[11px] bg-[#f6f4f0] rounded-[4.73px/5.33px]" />

            <div className="left-[21px] absolute top-0 w-[9px] h-[11px] bg-[#f6f4f0] rounded-[4.73px/5.33px]" />

            <div className="left-[43px] opacity-20 absolute top-0 w-[9px] h-[11px] bg-[#f6f4f0] rounded-[4.73px/5.33px]" />
          </div>
        </div>
      </div>
    </div>
  );
};
