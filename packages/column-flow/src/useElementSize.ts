import {useLayoutEffect, useState} from "react";

export function useElementSize<TElement extends HTMLElement>() {
  const [element, setElement] = useState<TElement | null>(null);
  const [size, setSize] = useState({width: 0, height: 0});

  useLayoutEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return [setElement, size] as const;
}
