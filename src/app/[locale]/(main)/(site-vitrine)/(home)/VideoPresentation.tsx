"use client";

import { Play } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";

const VIDEO_FR = {
  id: "mUEuuTMyPts",
  si: "HnV8B75-TEXeFhwv",
};
const VIDEO_EN = {
  id: "wQJaJ32W0to",
  si: "_drbqbc-KBEUv7lz",
};

const VideoPresentation = () => {
  const locale = useLocale();
  const [playing, setPlaying] = useState(false);
  const video = locale === "fr" ? VIDEO_FR : VIDEO_EN;

  const iframeSrc = `https://www.youtube-nocookie.com/embed/${video.id}?si=${video.si}&autoplay=1&modestbranding=1&rel=0&origin=https://www.fm4all.com`;
  const thumbnailMobileUrl = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
  const thumbnailDesktopUrl = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;

  return (
    <section className="flex items-center justify-center py-12">
      <div className="relative mx-auto h-[200px] w-5/6 max-w-7xl overflow-hidden rounded-xl border sm:h-[400px] md:h-[600px] md:w-2/3">
        {playing ? (
          <iframe
            width="100%"
            height="100%"
            src={iframeSrc}
            title="fm4all-presentation-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="group relative h-full w-full"
            aria-label={
              locale === "fr"
                ? "Lancer la vidéo de présentation"
                : "Play presentation video"
            }
          >
            <picture>
              <source
                media="(min-width: 640px)"
                srcSet={thumbnailDesktopUrl}
              />
              <img
                src={thumbnailMobileUrl}
                alt={
                  locale === "fr"
                    ? "Miniature vidéo de présentation fm4all"
                    : "fm4all presentation video thumbnail"
                }
                className="h-full w-full object-cover"
              />
            </picture>
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
              <div className="rounded-full bg-red-600 p-4 transition-transform group-hover:scale-110">
                <Play fill="white" className="ml-1 h-8 w-8 text-white" />
              </div>
            </div>
          </button>
        )}
      </div>
    </section>
  );
};

export default VideoPresentation;
