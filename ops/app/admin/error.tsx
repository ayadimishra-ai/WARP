"use client"; // Error components must be Client Components

import { useEffect } from "react";
import UnauthorizedPleaseLoginAgain from "~/components/ui/UnauthorizedPleaseLoginAgain";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    // console.error(error.message);
  }, [error]);

  console.error("Error in admin route:", error);

  return <UnauthorizedPleaseLoginAgain />;

  // return (
  //   <div>
  //     <h2>Something went wrong!</h2>
  //     <div>{error.message}</div>
  //   </div>
  // );
}
