import React from "react";
import image from "./image.svg";
import line172 from "./line-17-2.svg";
import line173 from "./line-17-3.svg";
import line17 from "./line-17.svg";
import line182 from "./line-18-2.svg";
import line183 from "./line-18-3.svg";
import line184 from "./line-18-4.svg";
import line18 from "./line-18.svg";

export const CameraOverlay = () => {
  return (
    <div className="relative w-[367px] h-[657px]">
      <div className="top-[566px] left-[272px] rotate-180 absolute w-[90px] h-[90px] flex flex-col">
        <img
          className="w-[90px] h-px -mt-px -rotate-180 object-cover"
          alt="Line"
          src={image}
        />

        <img
          className="w-px h-[90px] -rotate-180 object-cover"
          alt="Line"
          src={line182}
        />
      </div>

      <div className="top-0 left-0 absolute w-[90px] h-[90px] flex flex-col">
        <img
          className="w-[90px] h-px -mt-px object-cover"
          alt="Line"
          src={line17}
        />

        <img className="w-px h-[90px] object-cover" alt="Line" src={line18} />
      </div>

      <div className="top-[566px] left-0 -rotate-90 absolute w-[90px] h-[90px] flex flex-col">
        <img
          className="ml-[44.5px] w-px h-[90px] mt-[-45.5px] rotate-90 object-cover"
          alt="Line"
          src={line172}
        />

        <img
          className="ml-[-44.5px] w-[90px] h-px rotate-90 object-cover"
          alt="Line"
          src={line183}
        />
      </div>

      <div className="top-0 left-[272px] rotate-90 absolute w-[90px] h-[90px] flex flex-col">
        <img
          className="ml-[44.5px] w-px h-[90px] mt-[-45.5px] -rotate-90 object-cover"
          alt="Line"
          src={line173}
        />

        <img
          className="ml-[-44.5px] w-[90px] h-px -rotate-90 object-cover"
          alt="Line"
          src={line184}
        />
      </div>
    </div>
  );
};
