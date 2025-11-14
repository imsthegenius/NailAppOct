import React from "react";
import { Heart } from "./Heart";
import { LiquidGlassRegular } from "./LiquidGlassRegular";
import { Maximize } from "./Maximize";
import blur from "./blur.svg";
import icon from "./icon.svg";
import image from "./image.svg";
import screenshot20251114At10535022 from "./screenshot-2025-11-14-at-10-53-50-2-2.png";

export const SavedImage = () => {
  return (
    <div className="bg-white w-full min-w-[440px] min-h-[956px] relative">
      <img
        className="absolute top-0 left-0 w-[440px] h-[956px] aspect-[0.54]"
        alt="Screenshot"
        src={screenshot20251114At10535022}
      />

      <div className="flex w-[402px] items-center justify-between pt-4 pb-8 px-7 absolute left-[calc(50.00%_-_205px)] bottom-0">
        <div className="inline-flex items-center relative flex-[0_0_auto]">
          <LiquidGlassRegular
            blur="blur-3.svg"
            blurClassName="!left-[-26px] !top-[-26px]"
            className="!h-[calc(100%_+_8px)] !absolute !-left-1 !w-[calc(100%_+_8px)] !-top-1"
            mode="light"
            state="default"
          />
          <div className="flex flex-col w-[102px] items-center justify-center gap-px pt-1.5 pb-[7px] px-2 relative -ml-2.5">
            <div className="absolute w-full h-full top-0 left-0 bg-[#ededed] rounded-[100px]" />

            <div className="flex h-7 items-center justify-center gap-2.5 relative self-stretch w-full">
              <Maximize className="!relative !w-6 !h-6" />
            </div>

            <div className="relative self-stretch bg-[linear-gradient(200deg,rgba(255,161,186,0.7)_0%,rgba(231,10,90,0.7)_99%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'SF_Pro-Bold',Helvetica] font-bold text-transparent text-[10px] text-center tracking-[0] leading-3">
              Design
            </div>
          </div>

          <div className="flex flex-col w-[102px] items-center justify-center gap-px pt-1.5 pb-[7px] px-2 relative -ml-2.5">
            <div className="flex h-7 items-center justify-center gap-2.5 relative self-stretch w-full">
              <Heart className="!relative !w-6 !h-6" />
            </div>

            <div className="relative self-stretch [font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#999999] text-[10px] text-center tracking-[0] leading-3">
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
              className="absolute top-[calc(50.00%_-_13px)] left-[calc(50.00%_-_13px)] w-[27px] h-[27px]"
              alt="Icon"
              src={icon}
            />
          </div>
        </div>
      </div>

      <div className="absolute top-[37px] left-[15px] w-11 h-11 flex bg-[#00000000] rounded-[100px] overflow-hidden backdrop-blur-[2.0px] backdrop-brightness-[100.0%] backdrop-saturate-[100.0%] [-webkit-backdrop-filter:blur(2.0px)_brightness(100.0%)_saturate(100.0%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.40),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_1px_rgba(0,0,0,0.13),inset_-1px_0_1px_rgba(0,0,0,0.11)]">
        <div className="mt-[7px] w-[30px] h-[30px] ml-[7px] relative">
          <img
            className="absolute w-[50.00%] h-[50.00%] top-[21.67%] left-[21.67%]"
            alt="Icon"
            src={image}
          />
        </div>
      </div>

      <div className="absolute top-10 left-[calc(50.00%_-_138px)] w-[321px] h-[38px] flex bg-[#00000000] rounded-[10px] backdrop-blur-[13.5px] backdrop-brightness-[100.0%] backdrop-saturate-[100.0%] [-webkit-backdrop-filter:blur(13.5px)_brightness(100.0%)_saturate(100.0%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.40),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_9px_rgba(0,0,0,0.13),inset_-1px_0_9px_rgba(0,0,0,0.11)]">
        <div className="inline-flex mt-2.5 w-[299px] h-[17px] ml-3.5 relative items-center gap-[65px]">
          <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'SF_Pro-Semibold',Helvetica] font-normal text-white text-sm text-center tracking-[0] leading-[normal]">
            Colour Title
          </div>

          <div className="relative flex items-center justify-center w-fit [font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-xs text-center tracking-[0] leading-[normal] whitespace-nowrap">
            Brand
          </div>

          <div className="relative flex items-center justify-center w-fit [font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-xs text-center tracking-[0] leading-[normal] whitespace-nowrap">
            Category
          </div>
        </div>
      </div>
    </div>
  );
};
