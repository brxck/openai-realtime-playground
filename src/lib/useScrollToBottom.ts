import { useRef, useEffect } from 'react';

export function useScrollToBottom(deps: any[]) {
  const scrollHeightRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      const eventsEl = scrollRef.current;
      const scrollHeight = eventsEl.scrollHeight;
      if (scrollHeight !== scrollHeightRef.current) {
        eventsEl.scrollTop = scrollHeight;
        scrollHeightRef.current = scrollHeight;
      }
    }
  }, deps);

  return { scrollRef };
}
