import { useRef } from "react";

const useDebounce = (callback, delay: number) => {
  const timeoutRef = useRef<number | undefined>(undefined);

  return (...args) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay) as unknown as number;
  };
};

export default useDebounce;
