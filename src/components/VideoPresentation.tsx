import { useLocale } from "next-intl";

const VideoPresentation = () => {
  const locale = useLocale();
  return (
    <section className="flex items-center justify-center py-12">
      <div className="w-5/6 md:w-2/3 max-w-7xl mx-auto h-[200px] sm:h-[400px] md:h-[600px] border rounded-xl overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          src={
            locale === "fr"
              ? "https://www.youtube-nocookie.com/embed/mUEuuTMyPts?si=HnV8B75-TEXeFhwv?modestbranding=1&rel=0&enablejsapi=1"
              : "https://www.youtube-nocookie.com/embed/wQJaJ32W0to?si=_drbqbc-KBEUv7lz?modestbranding=1&rel=0&enablejsapi=1"
          }
          title="fm4all-presentation-video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </section>
  );
};

export default VideoPresentation;
