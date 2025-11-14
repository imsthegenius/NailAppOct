import React from "react";
import CAMERAOverlay from "./CAMERA-OVERLAY.svg";
import { LiquidGlassRegular } from "./LiquidGlassRegular";
import { Maximize } from "./Maximize";
import { Size48 } from "./Size48";
import blur from "./blur.svg";
import icon from "./icon.svg";
import screenshot20251112At1427231 from "./screenshot-2025-11-12-at-14-27-23-1.png";

export const Camera = () => {
  return (
    <div className="bg-white w-full min-w-[440px] min-h-[956px] relative">
      <img
        className="absolute top-6 left-0 w-[440px] h-[863px] aspect-[0.81]"
        alt="Screenshot"
        src={screenshot20251112At1427231}
      />

      <div className="top-0 absolute left-0 w-[440px] h-[88px] bg-black" />

      <div className="top-[868px] absolute left-0 w-[440px] h-[88px] bg-black" />

      <div className="flex flex-col w-[86px] items-center gap-12 absolute top-[661px] left-[177px]">
        <div className="relative w-[42px] h-10">
          <div className="absolute top-0 left-[calc(50.00%_-_21px)] w-10 h-10 bg-[#6d6c6a] rounded-[20px]" />

          <div className="absolute top-1.5 left-[calc(50.00%_-_13px)] w-6 h-[27px] flex items-center justify-center [font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#ffd300] text-[17px] text-center tracking-[-1.00px] leading-5">
            1x
          </div>
        </div>

        <div className="relative w-[86px] h-[86px] bg-[#41424980] rounded-[43px]">
          <div className="relative top-[5px] left-[calc(50.00%_-_38px)] w-[76px] h-[76px] bg-white rounded-[38.22px]" />
        </div>
      </div>

      <div className="w-[415px] h-[93px] justify-between px-7 py-1 absolute left-[calc(50.00%_-_208px)] bottom-0 flex items-center">
        <div className="inline-flex items-center relative flex-[0_0_auto]">
          <LiquidGlassRegular
            blur="blur-2.svg"
            blurClassName="!left-[-26px] !top-[-26px]"
            className="!h-[calc(100%_+_8px)] !absolute !-left-1 !w-[calc(100%_+_8px)] !-top-1"
            mode="light"
            state="default"
          />
          <div className="flex-col w-[102px] justify-center gap-px pt-1.5 pb-[7px] px-2 relative -ml-2.5 flex items-center">
            <div className="absolute w-full h-full top-0 left-0 bg-[#ededed] rounded-[100px]" />

            <div className="flex h-7 items-center justify-center gap-2.5 relative self-stretch w-full">
              <Maximize className="!relative !w-6 !h-6" />
            </div>

            <div className="bg-[linear-gradient(200deg,rgba(255,161,186,0.7)_0%,rgba(231,10,90,0.7)_99%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'SF_Pro-Bold',Helvetica] font-bold text-transparent relative self-stretch text-[10px] text-center tracking-[0] leading-3">
              Design
            </div>
          </div>

          <div className="flex-col w-[102px] justify-center gap-px pt-1.5 pb-[7px] px-2 relative -ml-2.5 flex items-center">
            <div className="flex h-7 items-center justify-center gap-2.5 relative self-stretch w-full">
              <Size48 className="!relative !w-[24.9px] !h-6" color="#B3B3B3" />
            </div>

            <div className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-black relative self-stretch text-[10px] text-center tracking-[0] leading-3">
              Feed
            </div>
          </div>
        </div>

        <div className="inline-flex items-center relative flex-[0_0_auto]">
          <div className="absolute w-[calc(100%_+_8px)] h-[calc(100%_+_8px)] -top-1 -left-1">
            <img
              className="absolute w-[calc(100%_+_52px)] h-[calc(100%_+_52px)] top-[-26px] left-[-26px] object-cover"
              alt="Blur"
              src={blur}
            />

            <div className="absolute w-full h-full top-0 left-0 rounded-[296px] bg-blend-color-dodge bg-[linear-gradient(0deg,rgba(247,247,247,1)_0%,rgba(247,247,247,1)_100%),linear-gradient(0deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0.5)_100%),linear-gradient(0deg,rgba(51,51,51,1)_0%,rgba(51,51,51,1)_100%)]" />

            <div className="absolute w-full h-full top-0 left-0 bg-[#00000000] rounded-[296px] backdrop-blur-[3.0px] backdrop-brightness-[100.0%] backdrop-saturate-[95.0%] [-webkit-backdrop-filter:blur(3.0px)_brightness(100.0%)_saturate(95.0%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.40),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_2px_rgba(0,0,0,0.20),inset_-1px_0_2px_rgba(0,0,0,0.16)]" />
          </div>

          <div className="relative w-12 h-12 -ml-2.5">
            <img
              className="absolute top-[calc(50.00%_-_14px)] left-[calc(50.00%_-_13px)] w-[27px] h-[27px]"
              alt="Icon"
              src={icon}
            />
          </div>
        </div>
      </div>

      <img
        className="absolute top-[177px] left-10 w-[364px] h-[557px]"
        alt="Camera OVERLAY"
        src={CAMERAOverlay}
      />
    </div>
  );
};
