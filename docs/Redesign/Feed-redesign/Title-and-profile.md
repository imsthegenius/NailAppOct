import React from "react";
import icon from "./icon.svg";

export const TitleBrand = () => {
  return (
    <div className="inline-flex items-center gap-72 p-[5px] relative rounded-xl overflow-hidden">
      <div className="relative w-[85px] mt-[-1.00px] bg-[linear-gradient(200deg,rgba(255,161,186,0.7)_0%,rgba(231,10,90,0.7)_99%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'SF_Pro-Bold',Helvetica] font-bold text-transparent text-[34px] tracking-[-1.00px] leading-[41px]">
        Feed
      </div>

      <img
        className="relative w-[22px] h-[26px] mr-[-1.00px]"
        alt="Icon"
        src={icon}
      />
    </div>
  );
};
