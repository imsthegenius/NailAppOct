import React from "react";
import shadow from "./shadow.svg";

export const EmailPassword = () => {
  return (
    <div className="relative w-[398px] h-[382px]">
      <img
        className="absolute w-[calc(100%_+_52px)] h-[calc(100%_+_52px)] top-[-35px] left-[-21px] object-cover"
        alt="Shadow"
        src={shadow}
      />

      <div className="absolute w-full h-full top-0 left-0 flex flex-col bg-[#ffffff12] rounded-3xl backdrop-blur-[2.5px] backdrop-brightness-[88.0%] backdrop-saturate-[100.0%] [-webkit-backdrop-filter:blur(2.5px)_brightness(88.0%)_saturate(100.0%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_1px_0_0_rgba(255,255,255,0.20),inset_0_-1px_1px_rgba(0,0,0,0.11),inset_-1px_0_1px_rgba(0,0,0,0.09)] bg-blend-screen">
        <div className="flex ml-[18px] w-[362px] h-[83px] relative mt-6 flex-col items-start gap-3.5">
          <div className="relative flex items-center justify-center self-stretch h-[19px] mt-[-1.00px] [font-family:'SF_Pro-Semibold',Helvetica] font-normal text-[#8e8e93] text-xl tracking-[0] leading-[normal] whitespace-nowrap">
            Email
          </div>

          <button className="all-[unset] box-border relative self-stretch w-full h-[50px] bg-[#00000000] rounded-[20px] backdrop-blur-[13.5px] backdrop-brightness-[100.0%] backdrop-saturate-[100.0%] [-webkit-backdrop-filter:blur(13.5px)_brightness(100.0%)_saturate(100.0%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.40),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_9px_rgba(0,0,0,0.13),inset_-1px_0_9px_rgba(0,0,0,0.11)]">
            <div className="absolute top-[calc(50.00%_-_20px)] left-[calc(50.00%_-_134px)] w-[268px] h-10 flex items-center justify-center [font-family:'SF_Pro-Semibold',Helvetica] font-normal text-[#dadada] text-xl tracking-[0] leading-[normal]">
              your@email.com
            </div>
          </button>
        </div>

        <div className="ml-[18px] w-[362px] h-[85px] mt-[52px] flex-col items-end gap-4 flex relative">
          <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
            <div className="items-center justify-center w-[115px] h-[19px] mt-[-1.00px] [font-family:'SF_Pro-Semibold',Helvetica] font-normal text-[#8e8e93] text-xl tracking-[0] leading-[normal] whitespace-nowrap flex relative">
              Password
            </div>

            <div className="relative flex items-center justify-center w-[115px] h-[19px] mt-[-1.00px] [font-family:'SF_Pro-Semibold',Helvetica] font-normal text-[#8e8e93] text-sm text-right tracking-[0] leading-[normal] underline">
              Forgot?
            </div>
          </div>

          <button className="all-[unset] box-border relative self-stretch w-full h-[50px] bg-[#00000000] rounded-[20px] backdrop-blur-[13.5px] backdrop-brightness-[100.0%] backdrop-saturate-[100.0%] [-webkit-backdrop-filter:blur(13.5px)_brightness(100.0%)_saturate(100.0%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.40),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_9px_rgba(0,0,0,0.13),inset_-1px_0_9px_rgba(0,0,0,0.11)]">
            <div className="absolute top-[calc(50.00%_-_20px)] left-[calc(50.00%_-_134px)] w-[268px] h-10 flex items-center justify-center [font-family:'SF_Pro-Semibold',Helvetica] font-normal text-[#dadada] text-xl tracking-[0] leading-[normal]">
              Your Password
            </div>
          </button>
        </div>

        <div className="flex h-20 w-[380px] self-center relative mt-[42px] flex-col items-start gap-2.5 bg-[#00000000] rounded-[20px] backdrop-blur-[13.5px] backdrop-brightness-[100.0%] backdrop-saturate-[100.0%] [-webkit-backdrop-filter:blur(13.5px)_brightness(100.0%)_saturate(100.0%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.40),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_9px_rgba(0,0,0,0.13),inset_-1px_0_9px_rgba(0,0,0,0.11)]">
          <div className="relative self-stretch w-full h-20" />

          <div className="absolute top-[calc(50.00%_-_20px)] left-[calc(50.00%_-_134px)] w-[268px] h-10 flex items-center justify-center [font-family:'SF_Pro-Semibold',Helvetica] font-normal text-[#8e8e93] text-xl tracking-[0] leading-[normal]">
            Login
          </div>
        </div>
      </div>
    </div>
  );
};
