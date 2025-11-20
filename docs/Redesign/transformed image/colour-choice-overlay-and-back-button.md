import React from "react";
import icon from "./icon.svg";

export const ChoiceBack = () => {
  return (
    <div className="relative w-[388px] h-11">
      <div className="absolute top-0 left-0 w-11 h-11 flex bg-[#00000000] rounded-[100px] overflow-hidden backdrop-blur-[2.0px] backdrop-brightness-[100.0%] backdrop-saturate-[100.0%] [-webkit-backdrop-filter:blur(2.0px)_brightness(100.0%)_saturate(100.0%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.40),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_1px_rgba(0,0,0,0.13),inset_-1px_0_1px_rgba(0,0,0,0.11)]">
        <div className="mt-[7px] w-[30px] h-[30px] ml-[7px] relative">
          <img
            className="absolute w-[50.00%] h-[50.00%] top-[21.67%] left-[21.67%]"
            alt="Icon"
            src={icon}
          />
        </div>
      </div>

      <div className="absolute top-[3px] left-[calc(50.00%_-_127px)] w-[321px] h-[38px] flex bg-[#00000000] rounded-[10px] backdrop-blur-[13.5px] backdrop-brightness-[100.0%] backdrop-saturate-[100.0%] [-webkit-backdrop-filter:blur(13.5px)_brightness(100.0%)_saturate(100.0%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.40),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_9px_rgba(0,0,0,0.13),inset_-1px_0_9px_rgba(0,0,0,0.11)]">
        <div className="inline-flex mt-2.5 w-[299px] h-[17px] ml-3.5 relative items-center gap-[65px]">
          <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'SF_Pro-Semibold',Helvetica] font-normal text-white text-sm text-center tracking-[0] leading-[normal]">
            Colour Title
          </div>

          <div className="relative flex items-center justify-center w-fit [font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-xs text-center tracking-[0] leading-[normal] whitespace-nowrap">
            Brand
          </div>

          <div className="relative flex items-center justify-center w-fit [font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-xs text-center tracking-[0] leading-[normal] whitespace-nowrap">
            Category
          </div>
        </div>
      </div>
    </div>
  );
};
