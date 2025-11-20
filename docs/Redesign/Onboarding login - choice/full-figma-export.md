import React from "react";
import { Logos } from "./Logos";
import line15 from "./line-15.svg";
import line16 from "./line-16.svg";

export const Onboarding = () => {
  return (
    <div className="bg-white w-full min-w-[440px] h-[956px] relative">
      <div className="absolute top-0 left-0 w-[440px] h-[952px] aspect-[0.46] bg-[linear-gradient(360deg,rgba(231,10,90,0.4)_0%,rgba(255,161,186,0.1)_82%)]" />

      <p className="absolute w-[88.64%] h-[2.93%] top-[94.98%] left-[5.23%] [font-family:'SF_Pro-Light',Helvetica] font-light text-white text-xs tracking-[0.60px] leading-[normal]">
        Naild uses secure email sign in. You can manage or delete your account
        anytime from Profile Settings
      </p>

      <Logos
        className="!h-[93px] !absolute !left-[calc(50.00%_-_110px)] bg-[url(/image.png)] !w-[221px] !top-[84px]"
        length="default"
      />
      <div className="flex w-[365px] h-[21px] items-center gap-[11px] absolute top-[729px] left-[27px]">
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

      <button className="all-[unset] box-border absolute top-[533px] left-[calc(50.00%_-_190px)] w-[380px] h-20 flex items-center justify-center bg-[#00000000] rounded-[20px] backdrop-blur-[13.5px] backdrop-brightness-[100.0%] backdrop-saturate-[100.0%] [-webkit-backdrop-filter:blur(13.5px)_brightness(100.0%)_saturate(100.0%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.40),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_9px_rgba(0,0,0,0.13),inset_-1px_0_9px_rgba(0,0,0,0.11)]">
        <div className="flex items-center justify-center h-10 w-[268px] [font-family:'SF_Pro-Semibold',Helvetica] font-normal text-white text-xl text-center tracking-[0] leading-[normal]">
          Sign up
        </div>
      </button>

      <div className="absolute top-[630px] left-[calc(50.00%_-_190px)] w-[380px] h-20 bg-[#00000000] rounded-[20px] backdrop-blur-[13.5px] backdrop-brightness-[100.0%] backdrop-saturate-[100.0%] [-webkit-backdrop-filter:blur(13.5px)_brightness(100.0%)_saturate(100.0%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.40),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_9px_rgba(0,0,0,0.13),inset_-1px_0_9px_rgba(0,0,0,0.11)] flex items-center justify-center">
        <div className="h-10 w-[268px] [font-family:'SF_Pro-Semibold',Helvetica] font-normal text-white text-xl text-center tracking-[0] leading-[normal] flex items-center justify-center">
          Login
        </div>
      </div>

      <div className="absolute top-[778px] left-[calc(50.00%_-_190px)] w-[380px] h-20 flex justify-center bg-[#00000000] rounded-[20px] backdrop-blur-[13.5px] backdrop-brightness-[100.0%] backdrop-saturate-[100.0%] [-webkit-backdrop-filter:blur(13.5px)_brightness(100.0%)_saturate(100.0%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.40),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_9px_rgba(0,0,0,0.13),inset_-1px_0_9px_rgba(0,0,0,0.11)]">
        <div className="inline-flex mt-[25px] w-[205px] h-9 ml-px relative items-center gap-4">
          <div className="relative w-9 h-9 aspect-[1]">
            <div className="relative w-6 h-[30px] left-1.5 bg-[url(/apple-173.svg)] bg-[100%_100%]" />
          </div>

          <div className="relative w-fit [font-family:'SF_Pro-Medium',Helvetica] font-medium text-neutral-700 text-base tracking-[0.80px] leading-[normal] whitespace-nowrap">
            Sign in with Apple
          </div>
        </div>
      </div>
    </div>
  );
};
