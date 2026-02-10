"use client";

import { useEffect, useState } from "react";
import RootApp from "../components/RootApp";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid rendering the client SPA on the server to prevent
    // issues with BrowserRouter and window/document usage.
    return null;
  }

  return <RootApp />;
}
