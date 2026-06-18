import { useEffect, useRef } from "react";

const useGetContentHeight = (
  callback: (height: number) => void,
  maxHeight?: number
) => {
  const elementRef = useRef<any>(null);

  useEffect(() => {
    const currentElement = elementRef.current;
    if (!currentElement) return;

    const resizeObserver = new ResizeObserver(() => {
      let currentHeight = currentElement.clientHeight;

      // If maxHeight is provided, cap the height; otherwise, use the content height
      const heightToSend = maxHeight
        ? Math.min(currentHeight, maxHeight)
        : currentHeight;
      callback(heightToSend);
    });

    resizeObserver.observe(currentElement);

    return () => resizeObserver.disconnect(); // clean up on unmount
  }, [callback, maxHeight]);

  return elementRef;
};

export default useGetContentHeight;
