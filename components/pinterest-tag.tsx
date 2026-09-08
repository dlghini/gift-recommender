"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { PINTEREST_TAG_ID, pinterestPageView } from "@/lib/pinterest";

// Pinterest Tag base install. Same bootstrap as the snippet from
// ads.pinterest.com, but next/script owns the loading (afterInteractive, like
// any analytics tag) and route changes get their own page view — the inline
// pintrk('page') only covers the first load.
export function PinterestTag() {
  const pathname = usePathname();
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    pinterestPageView();
  }, [pathname]);

  return (
    <>
      <Script id="pinterest-tag" strategy="afterInteractive">
        {`!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");pintrk("load","${PINTEREST_TAG_ID}");pintrk("page");`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://ct.pinterest.com/v3/?event=init&tid=${PINTEREST_TAG_ID}&noscript=1`}
        />
      </noscript>
    </>
  );
}
