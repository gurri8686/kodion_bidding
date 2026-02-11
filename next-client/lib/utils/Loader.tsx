"use client";

import { BallTriangle } from "react-loader-spinner";

export const Loader = () => (
  <div className="flex justify-center items-center mt-[25vh]">
    <BallTriangle height={60} width={60} color="#FF6D00" />
  </div>
);
