"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

export type ConsentState = "granted" | "denied";
export type ConsentCategory =
  | "analytics_storage"
  | "ad_storage"
  | "ad_user_data"
  | "ad_personalization";

export type ConsentDefaultParams = Record<ConsentCategory, ConsentState> & {
  wait_for_update?: number;
};

export type ConsentUpdateParams = Record<ConsentCategory, ConsentState>;

export type Gtag = {
  (command: "js", date: Date): void;

  (
    command: "config",
    targetId: string,
    params?: { send_page_view?: boolean },
  ): void;

  (
    command: "event",
    eventName: "page_view" | "conversion",
    params?: {
      page_path?: string;
      send_to?: string;
      event_callback?: () => void;
    },
  ): void;

  (command: "consent", action: "default", params: ConsentDefaultParams): void;
  (command: "consent", action: "update", params: ConsentUpdateParams): void;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    gtag_report_conversion?: (url?: string) => boolean;
  }
}
function buildPagePath(
  pathname: string,
  searchParams: URLSearchParams | null,
): string {
  const qs = searchParams?.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export default function GoogleTags({
  GA_MEASUREMENT_ID,
  ADS_ID = "AW-17528670078",
}: {
  GA_MEASUREMENT_ID: string;
  ADS_ID?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!window.gtag) return;

    window.gtag("event", "page_view", {
      page_path: buildPagePath(pathname, searchParams),
      send_to: GA_MEASUREMENT_ID,
    });
  }, [pathname, searchParams, GA_MEASUREMENT_ID]);

  return (
    <>
      <Script
        id="gtag-loader"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />

      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            gtag('js', new Date());

            // On gère les page_view nous-mêmes (SPA)
            gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });

            // Google Ads (même gtag.js)
            gtag('config', '${ADS_ID}');

            window.gtag_report_conversion = function(url) {
              var callback = function() {
                if (typeof(url) !== 'undefined') window.location = url;
              };
              gtag('event', 'conversion', {
                send_to: '${ADS_ID}',
                event_callback: callback
              });
              return false;
            };
          `,
        }}
      />
    </>
  );
}
