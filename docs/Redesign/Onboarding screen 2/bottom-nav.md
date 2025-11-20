import React from "react";

export const Slider = () => {
  return (
    <div className="flex h-10 items-start gap-2.5 p-[15px] relative">
      <div className="absolute top-0 right-0 w-[393px] h-10 flex items-center justify-center [font-family:'Open_Sans-SemiBold',Helvetica] font-semibold text-[#f6f4f0] text-lg text-right tracking-[0] leading-[normal]">
        Skip
      </div>

      <div className="relative w-[52.08px] h-[10.67px] mb-[-0.67px]">
        <div className="left-0 opacity-20 absolute top-0 w-[9px] h-[11px] bg-[#f6f4f0] rounded-[4.73px/5.33px]" />

        <div className="left-[21px] absolute top-0 w-[9px] h-[11px] bg-[#f6f4f0] rounded-[4.73px/5.33px]" />

        <div className="left-[43px] opacity-20 absolute top-0 w-[9px] h-[11px] bg-[#f6f4f0] rounded-[4.73px/5.33px]" />
      </div>
    </div>
  );
};
