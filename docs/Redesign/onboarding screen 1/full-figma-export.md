import React from "react";
import { App } from "./App";
import { Logos } from "./Logos";

export const Onboarding = () => {
  return (
    <div className="bg-[#f6f4f0] w-full min-w-[440px] min-h-[956px] relative">
      <App className="!h-[956px] !absolute !left-0 !bg-[linear-gradient(180deg,rgba(231,10,90,0.4)_0%,rgba(255,161,186,0.1)_82%)] !bg-[unset] !w-[440px] !top-0" />
      <div className="inline-flex flex-col max-h-[880px] items-center gap-[116px] absolute top-16 left-[27px]">
        <Logos
          className="!h-[88px] bg-[url(/image.png)] !left-[unset] !w-[210.54px] !top-[unset]"
          length="default"
        />
        <div className="inline-flex flex-col items-start gap-[182px] relative flex-[0_0_auto]">
          <p className="relative flex items-center justify-center self-stretch mt-[-1.00px] [font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#f6f4f0] text-[64px] tracking-[0] leading-[68px]">
            Try on nail colours before the salon
          </p>

          <p className="relative flex items-center justify-center w-[382px] h-[66px] [font-family:'Open_Sans-SemiBold',Helvetica] font-semibold text-[#ffa1ba] text-2xl tracking-[0] leading-[normal]">
            No more wondering if it&#39;ll look good.
          </p>
        </div>

        <div className="flex h-10 items-start gap-2.5 px-3.5 py-[15px] relative self-stretch w-full">
          <div className="absolute top-0 left-0 w-[393px] h-10 flex items-center justify-center [font-family:'Open_Sans-SemiBold',Helvetica] font-semibold text-[#ffa1ba] text-lg text-right tracking-[0] leading-[normal]">
            Skip
          </div>

          <div className="relative w-[52.08px] h-[10.67px] mb-[-0.67px]">
            <div className="left-0 opacity-20 absolute top-0 w-[9px] h-[11px] bg-[#ffa1ba] rounded-[4.73px/5.33px]" />

            <div className="left-[21px] absolute top-0 w-[9px] h-[11px] bg-[#ffa1ba] rounded-[4.73px/5.33px]" />

            <div className="left-[43px] opacity-20 absolute top-0 w-[9px] h-[11px] bg-[#ffa1ba] rounded-[4.73px/5.33px]" />
          </div>
        </div>
      </div>
    </div>
  );
};
