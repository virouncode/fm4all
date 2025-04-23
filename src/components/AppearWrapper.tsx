"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

type AppearWrapperProps = {
  children: React.ReactNode;
  className?: string;
};

export default function AppearWrapper({
  children,
  className,
}: AppearWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Pour ne le faire qu’une seule fois
        }
      },
      {
        threshold: 0.2,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={clsx(
        className,
        "opacity-0 translate-y-5 transition-all duration-700 ease-out",
        {
          "animate-appear": isVisible,
        }
      )}
    >
      {children}
    </div>
  );
}
