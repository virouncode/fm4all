import Script from "next/script";

export default function GoogleAnalytics({
  GA_MEASUREMENT_ID,
}: {
  GA_MEASUREMENT_ID: string;
}) {
  // const pathname = usePathname();
  // const searchParams = useSearchParams();

  // useEffect(() => {
  //   const url = pathname + searchParams.toString();
  //   pageview(GA_MEASUREMENT_ID, url);
  // }, [pathname, searchParams, GA_MEASUREMENT_ID]);
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('consent', 'default', {
                    'analytics_storage': 'denied',
                    'ad_storage':'denied',
                });
                
                gtag('config', '${GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                });
                `,
        }}
      />

      {/* Compte viroun.gads@gmail.com */}
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=AW-17528670078"
      />
      <Script
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'AW-17528670078');
                `,
        }}
      />
      <Script
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
                function gtag_report_conversion(url) { var callback = function () { if (typeof(url) != 'undefined') { window.location = url; } }; gtag('event', 'conversion', { 'send_to': 'AW-17528670078','event_callback': callback }); return false; }
                `,
        }}
      />
    </>
  );
}
