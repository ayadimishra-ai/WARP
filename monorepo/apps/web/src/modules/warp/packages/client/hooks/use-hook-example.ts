import { useCallback, useState } from "react";

const useHookExample = () => {
  const [counter, setCounter] = useState<number>(0);

  const increment = useCallback(() => setCounter((prev) => prev + 1), []);
  const decrement = useCallback(() => setCounter((prev) => prev - 1), []);

  return { counter, increment, decrement };
};

export default useHookExample;
