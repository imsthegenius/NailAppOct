import React from "react";

export const Frame = () => {
  return (
    <div className="w-[216px] h-[26px] flex bg-[#d9d9d975]">
      <div className="mt-[7px] w-3 h-3 ml-[11px] bg-[#f9e6e2] rounded-md" />

      <div className="flex items-center justify-center h-5 w-[37px] self-center ml-[5px] [font-family:'SF_Pro-Medium',Helvetica] font-medium text-black text-xs tracking-[0] leading-5 whitespace-nowrap">
        Bunny
      </div>

      <div className="flex items-center justify-center h-5 w-[25px] self-center ml-[43px] [font-family:'SF_Pro-Medium',Helvetica] font-medium text-neutral-700 text-xs text-center tracking-[0] leading-5 whitespace-nowrap">
        TGB
      </div>

      <div className="flex items-center justify-center h-5 w-7 self-center ml-[42px] [font-family:'SF_Pro-Medium',Helvetica] font-medium text-neutral-700 text-xs text-center tracking-[0] leading-5 whitespace-nowrap">
        BIAB
      </div>
    </div>
  );
};
