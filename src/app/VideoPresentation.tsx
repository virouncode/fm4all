import { getCurrentLocale } from "@/locales/server";

const VideoPresentation = async () => {
  const locale = await getCurrentLocale();
  return (
    <section className="w-5/6 md:w-2/3 max-w-7xl mx-auto h-[200px] sm:h-[400px] md:h-[600px] border flex items-center justify-center rounded-xl overflow-hidden">
      {/* <iframe
        width="100%"
        height="100%"
        src="https://www.youtube-nocookie.com/embed/1t8QE1Zp6I8?si=Ps06ViHpWz2QBdA0?modestbranding=1&rel=0"
        title="fm4all-presentation-video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      /> */}
      <iframe
        width="100%"
        height="100%"
        src={
          locale === "fr"
            ? "https://www.youtube-nocookie.com/embed/mUEuuTMyPts?si=252JkI-8eHG00EUu?modestbranding=1&rel=0&enablejsapi=1"
            : "https://www.youtube-nocookie.com/embed/wQJaJ32W0to?si=uCTqjEDctxSOsf8X?modestbranding=1&rel=0&enablejsapi=1"
        }
        title="fm4all-presentation-video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </section>
  );
};

export default VideoPresentation;
