"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export default function Home() {
  const router = useRouter();
  const token = useSelector((state: any) => state.auth?.token);

  useEffect(() => {
    if (token) {
      router.replace("/jobs");
    } else {
      router.replace("/login");
    }
  }, [token, router]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <p>Loading...</p>
    </div>
  );
}
