import React from "react";

export const Text = () => {
  return (
    <div className="flex flex-col w-[379px] items-start gap-[101px] relative">
      <div className="relative flex items-center justify-center self-stretch mt-[-1.00px] [font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#f6f4f0] text-[64px] tracking-[0] leading-[68px]">
        Choose from 300+ colours
      </div>

      <p className="relative flex items-center justify-center w-[365px] h-[220px] [font-family:'Open_Sans-SemiBold',Helvetica] font-semibold text-[#f6f4f0] text-[32px] tracking-[0] leading-[normal]">
        Pick a colour, pick a shape, upload a photo and watch colours come to
        life on your nails.
      </p>
    </div>
  );
};
