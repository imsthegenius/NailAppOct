import React from "react";

export const Frame = () => {
  return (
    <div className="flex-col w-[86px] gap-12 relative flex items-center">
      <div className="relative w-[42px] h-10">
        <div className="absolute top-0 left-[calc(50.00%_-_21px)] w-10 h-10 bg-[#6d6c6a] rounded-[20px]" />

        <div className="absolute top-1.5 left-[calc(50.00%_-_13px)] w-6 h-[27px] justify-center [font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#ffd300] text-[17px] text-center tracking-[-1.00px] leading-5 flex items-center">
          1x
        </div>
      </div>

      <div className="relative w-[86px] h-[86px] bg-[#41424980] rounded-[43px]">
        <div className="relative top-[5px] left-[calc(50.00%_-_38px)] w-[76px] h-[76px] bg-white rounded-[38.22px]" />
      </div>
    </div>
  );
};
