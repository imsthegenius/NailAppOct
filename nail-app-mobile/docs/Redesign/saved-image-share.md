import React from "react";
import { ColourBrandAnd } from "./ColourBrandAnd";
import { SharePopUp } from "./SharePopUp";
import { TabBar } from "./TabBar";
import icon2 from "./icon-2.svg";
import screenshot20251114At10535022 from "./screenshot-2025-11-14-at-10-53-50-2-2.png";

export const SavedImage = () => {
  return (
    <div className="bg-white w-full min-w-[440px] min-h-[956px] relative">
      <img
        className="absolute top-0 left-0 w-[440px] h-[956px] aspect-[0.54]"
        alt="Screenshot"
        src={screenshot20251114At10535022}
      />

      <TabBar />
      <div className="absolute top-[37px] left-[15px] w-11 h-11 flex bg-[#00000000] rounded-[100px] overflow-hidden backdrop-blur-[2.0px] backdrop-brightness-[100.0%] backdrop-saturate-[100.0%] [-webkit-backdrop-filter:blur(2.0px)_brightness(100.0%)_saturate(100.0%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.40),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_1px_rgba(0,0,0,0.13),inset_-1px_0_1px_rgba(0,0,0,0.11)]">
        <div className="mt-[7px] w-[30px] h-[30px] ml-[7px] relative">
          <img
            className="absolute w-[50.00%] h-[50.00%] top-[21.67%] left-[21.67%]"
            alt="Icon"
            src={icon2}
          />
        </div>
      </div>

      <ColourBrandAnd />
      <SharePopUp />
    </div>
  );
};
