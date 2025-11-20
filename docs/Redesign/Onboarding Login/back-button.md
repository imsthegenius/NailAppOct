import React from "react";
import icon from "./icon.svg";

export const Frame = () => {
  return (
    <div className="w-11 h-11 flex bg-[#00000000] rounded-[100px] overflow-hidden">
      <div className="mt-2.5 w-6 h-6 ml-2.5 relative">
        <img
          className="absolute w-[30.83%] h-[50.00%] top-[25.00%] left-[33.33%]"
          alt="Icon"
          src={icon}
        />
      </div>
    </div>
  );
};
