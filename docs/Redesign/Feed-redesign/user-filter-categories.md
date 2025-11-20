import React from "react";

export const ContentArea = () => {
  return (
    <div className="flex flex-col w-[420px] items-start gap-1 relative">
      <div className="relative w-32 h-5">
        <button className="all-[unset] box-border flex w-32 items-center gap-2 relative">
          <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'SF_Pro-Regular',Helvetica] font-normal text-black text-[15px] tracking-[-1.00px] leading-5 whitespace-nowrap">
            Categories
          </div>
        </button>
      </div>

      <div className="flex items-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col w-[54px] h-[69px] items-center justify-center gap-0.5 relative">
          <div className="relative w-[43px] h-[43px] bg-[#ce3a3a] rounded-md aspect-[1]" />

          <div className="flex flex-col items-center justify-center relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative [display:-webkit-box] items-center justify-center self-stretch mt-[-1.00px] [font-family:'SF_Pro-Regular',Helvetica] font-normal text-black text-[13px] text-center tracking-[-1.00px] leading-5 overflow-hidden text-ellipsis [-webkit-line-clamp:1] [-webkit-box-orient:vertical]">
              Reds
            </div>
          </div>
        </div>

        <div className="flex flex-col w-[54px] h-[69px] items-center justify-center gap-0.5 relative">
          <div className="bg-[#ffe4e4] relative w-[43px] h-[43px] rounded-md aspect-[1]" />

          <div className="flex flex-col items-center justify-center relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative [display:-webkit-box] items-center justify-center self-stretch mt-[-1.00px] [font-family:'SF_Pro-Regular',Helvetica] font-normal text-black text-[13px] text-center tracking-[-1.00px] leading-5 overflow-hidden text-ellipsis [-webkit-line-clamp:1] [-webkit-box-orient:vertical]">
              French
            </div>
          </div>
        </div>

        <div className="flex flex-col w-[54px] h-[69px] items-center justify-center gap-0.5 relative">
          <div className="bg-[#f59bd7] relative w-[43px] h-[43px] rounded-md aspect-[1]" />

          <div className="flex flex-col items-center justify-center relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative [display:-webkit-box] items-center justify-center self-stretch mt-[-1.00px] [font-family:'SF_Pro-Regular',Helvetica] font-normal text-black text-[13px] text-center tracking-[-1.00px] leading-5 overflow-hidden text-ellipsis [-webkit-line-clamp:1] [-webkit-box-orient:vertical]">
              Pinks
            </div>
          </div>
        </div>

        <div className="flex flex-col w-[54px] h-[69px] items-center justify-center gap-0.5 relative">
          <div className="bg-[#fce2ff] relative w-[43px] h-[43px] rounded-md aspect-[1]" />

          <div className="flex flex-col items-center justify-center relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative [display:-webkit-box] items-center justify-center self-stretch mt-[-1.00px] [font-family:'SF_Pro-Regular',Helvetica] font-normal text-black text-[13px] text-center tracking-[-1.00px] leading-5 overflow-hidden text-ellipsis [-webkit-line-clamp:1] [-webkit-box-orient:vertical]">
              Pastels
            </div>
          </div>
        </div>

        <div className="flex flex-col w-[54px] h-[69px] items-center justify-center gap-0.5 relative">
          <div className="bg-[#ffc8c8] relative w-[43px] h-[43px] rounded-md aspect-[1]" />

          <div className="flex flex-col items-center justify-center relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative [display:-webkit-box] items-center justify-center self-stretch mt-[-1.00px] [font-family:'SF_Pro-Regular',Helvetica] font-normal text-black text-[13px] text-center tracking-[-1.00px] leading-5 overflow-hidden text-ellipsis [-webkit-line-clamp:1] [-webkit-box-orient:vertical]">
              Pastels
            </div>
          </div>
        </div>

        <div className="flex flex-col w-[54px] h-[69px] items-center justify-center gap-0.5 relative">
          <div className="bg-[#ffdede] relative w-[43px] h-[43px] rounded-md aspect-[1]" />

          <div className="flex flex-col items-center justify-center relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative [display:-webkit-box] items-center justify-center self-stretch mt-[-1.00px] [font-family:'SF_Pro-Regular',Helvetica] font-normal text-black text-[13px] text-center tracking-[-1.00px] leading-5 overflow-hidden text-ellipsis [-webkit-line-clamp:1] [-webkit-box-orient:vertical]">
              Creams
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
