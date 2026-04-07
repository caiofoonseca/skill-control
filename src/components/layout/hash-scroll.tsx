"use client";

import { useEffect } from "react";

type HashScrollProps = {
  targetId: string;
};

export function HashScroll({ targetId }: HashScrollProps) {
  useEffect(() => {
    function scrollToTarget() {
      if (window.location.hash !== `#${targetId}`) {
        return;
      }

      const element = document.getElementById(targetId);
      if (!element) {
        return;
      }

      requestAnimationFrame(() => {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }

    scrollToTarget();
    window.addEventListener("hashchange", scrollToTarget);

    return () => {
      window.removeEventListener("hashchange", scrollToTarget);
    };
  }, [targetId]);

  return null;
}
