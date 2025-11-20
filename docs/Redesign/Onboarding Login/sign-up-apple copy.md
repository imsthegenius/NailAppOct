import React from "react";

export const AppleButtonIcon = () => {
  return (
    <div className="w-[380px] h-20 flex justify-center bg-[#00000000] rounded-[20px]">
      <div className="inline-flex mt-[25px] w-[205px] h-9 ml-px relative items-center gap-4">
        <div className="relative w-9 h-9 aspect-[1]">
          <div className="relative w-6 h-[30px] left-1.5 bg-[url(/apple-173.svg)] bg-[100%_100%]" />
        </div>

        <div className="relative w-fit [font-family:'SF_Pro-Medium',Helvetica] font-medium text-neutral-700 text-base tracking-[0.80px] leading-[normal] whitespace-nowrap">
          Sign in with Apple
        </div>
      </div>
    </div>
  );
};
