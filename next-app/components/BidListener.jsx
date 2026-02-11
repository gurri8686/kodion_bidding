"use client";
import Pusher from "pusher-js";
import { useEffect } from "react";

export default function BidListener() {
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe("bidding-channel");

    channel.bind("new-bid", (data) => {
      console.log("New bid received:", data.message);
    });

    return () => {
      pusher.disconnect();
    };
  }, []);

  return null;
}
