import { useEffect, RefObject } from 'react';

// Define the event type to cover both mouse and touch events
type AnyEvent = MouseEvent | TouchEvent;

/**
 * Custom hook that triggers a callback when a click occurs outside the referenced element.
 * @param ref - A React ref object pointing to the element to monitor.
 * @param handler - The callback function to execute when an outside click is detected.
 */
export const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: AnyEvent) => void,
) => {
  useEffect(() => {
    const listener = (event: AnyEvent) => {
      const el = ref.current;

      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handler(event); // Call the handler
    };

    // Add event listeners
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    // Cleanup function to remove event listeners
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]); // Rerun the effect if ref or handler changes
};  