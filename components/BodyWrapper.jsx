// components/BodyWrapper.jsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function BodyWrapper({ children }) {
  const pathname = usePathname();
  const [pageClass, setPageClass] = useState("");

  useEffect(() => {
    if (pathname === "/") {
      setPageClass("avalht");
    } else {
      setPageClass("");
    }
  }, [pathname]);

  return <body className={`antialiased ${pageClass}`}>{children}</body>;
}
