import React from "react";

export const TitleBrand = () => {
  return (
    <div className="flex flex-col items-start gap-2 px-2.5 py-[5px] relative rounded-xl overflow-hidden">
      <div className="relative self-stretch mt-[-1.00px] bg-[linear-gradient(200deg,rgba(255,161,186,0.7)_0%,rgba(231,10,90,0.7)_99%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'SF_Pro-Bold',Helvetica] font-bold text-transparent text-[34px] tracking-[-1.00px] leading-[41px]">
        Create Account
      </div>

      <p className="relative self-stretch [font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#8e8e93] text-2xl tracking-[-1.00px] leading-[41px]">
        Create your account to try on the latest nail colours before your trip
        to the salon.
      </p>
    </div>
  );
};
