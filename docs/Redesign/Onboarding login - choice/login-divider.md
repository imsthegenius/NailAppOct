import React from "react";
import line15 from "./line-15.svg";
import line16 from "./line-16.svg";

export const LoginOptions = () => {
  return (
    <div className="flex w-[365px] h-[21px] items-center gap-[11px] relative">
      <img
        className="relative w-[120px] h-px object-cover"
        alt="Line"
        src={line16}
      />

      <div className="relative w-fit mt-[-5.00px] mb-[-3.00px] [font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#fcffff] text-2xl text-center tracking-[0] leading-[normal]">
        Or login with
      </div>

      <img
        className="mr-[-30.00px] relative w-[120px] h-px object-cover"
        alt="Line"
        src={line15}
      />
    </div>
  );
};
