import { useState } from "react";
import { Slide } from "react-awesome-reveal";
import DeviceCard from "./DeviceCard";


export default function DeviceCardContainer() {

  return (
    <div className="relative overflow-hidden">
      <Slide direction="left" duration={600}>
        <DeviceCard />
      </Slide>
    </div>
  );
}
