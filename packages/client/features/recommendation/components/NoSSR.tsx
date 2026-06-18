import { ReactNode, useEffect, useState } from "react";

interface NoSSRProps {
  children: ReactNode;
}

const NoSSR = ({ children }: NoSSRProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <>{children}</>;
};

export default NoSSR;
