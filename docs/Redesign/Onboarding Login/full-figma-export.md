import React from "react";
import icon from "./icon.svg";
import line15 from "./line-15.svg";
import line16 from "./line-16.svg";
import shadow from "./shadow.svg";

export const Login = () => {
  return (
    <div className="bg-white w-full min-w-[440px] h-[956px] relative">
      <div className="absolute top-0 left-0 w-[440px] h-[952px] aspect-[0.46] bg-[linear-gradient(360deg,rgba(231,10,90,0.4)_0%,rgba(255,161,186,0.1)_82%)]" />

      <div className="absolute h-[39.96%] top-[34.10%] left-[calc(50.00%_-_199px)] w-[398px]">
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
            <div className="flex justify-between self-stretch w-full flex-[0_0_auto] items-center relative">
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

      <p className="absolute w-[88.64%] h-[2.93%] top-[94.98%] left-[5.23%] [font-family:'SF_Pro-Light',Helvetica] font-light text-white text-xs tracking-[0.60px] leading-[normal]">
        Naild uses secure email sign in. You can manage or delete your account
        anytime from Profile Settings
      </p>

      <div className="flex w-[365px] h-[21px] items-center gap-[11px] absolute top-[763px] left-[30px]">
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

      <div className="absolute top-[806px] left-[calc(50.00%_-_190px)] w-[380px] h-20 flex justify-center bg-[#00000000] rounded-[20px] backdrop-blur-[13.5px] backdrop-brightness-[100.0%] backdrop-saturate-[100.0%] [-webkit-backdrop-filter:blur(13.5px)_brightness(100.0%)_saturate(100.0%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.40),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_9px_rgba(0,0,0,0.13),inset_-1px_0_9px_rgba(0,0,0,0.11)]">
        <div className="inline-flex mt-[25px] w-[205px] h-9 ml-px gap-4 items-center relative">
          <div className="relative w-9 h-9 aspect-[1]">
            <div className="relative w-6 h-[30px] left-1.5 bg-[url(/apple-173.svg)] bg-[100%_100%]" />
          </div>

          <div className="relative w-fit [font-family:'SF_Pro-Medium',Helvetica] font-medium text-neutral-700 text-base tracking-[0.80px] leading-[normal] whitespace-nowrap">
            Sign in with Apple
          </div>
        </div>
      </div>

      <div className="flex flex-col w-[421px] items-start gap-2 px-2.5 py-[5px] absolute top-[calc(50.00%_-_325px)] left-[calc(50.00%_-_210px)] rounded-xl overflow-hidden">
        <div className="relative self-stretch mt-[-1.00px] bg-[linear-gradient(200deg,rgba(255,161,186,0.7)_0%,rgba(231,10,90,0.7)_99%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'SF_Pro-Bold',Helvetica] font-bold text-transparent text-[34px] tracking-[-1.00px] leading-[41px]">
          Welcome Back
        </div>

        <p className="relative self-stretch [font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#8e8e93] text-2xl tracking-[-1.00px] leading-[41px]">
          Sign in to try on the latest nail colours before your trip to the
          salon.
        </p>
      </div>

      <div className="absolute top-[37px] left-[15px] w-11 h-11 flex bg-[#00000000] rounded-[100px] overflow-hidden backdrop-blur-[2.0px] backdrop-brightness-[100.0%] backdrop-saturate-[100.0%] [-webkit-backdrop-filter:blur(2.0px)_brightness(100.0%)_saturate(100.0%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.40),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_1px_rgba(0,0,0,0.13),inset_-1px_0_1px_rgba(0,0,0,0.11)]">
        <div className="mt-2.5 w-6 h-6 ml-2.5 relative">
          <img
            className="absolute w-[30.83%] h-[50.00%] top-[25.00%] left-[33.33%]"
            alt="Icon"
            src={icon}
          />
        </div>
      </div>
    </div>
  );
};
