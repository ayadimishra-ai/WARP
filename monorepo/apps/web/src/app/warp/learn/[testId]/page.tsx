"use client";

import { useParams } from "next/navigation";

export default function Test1Page() {
  const params = useParams();
  const testId = params?.testId as string | undefined;
  return (
    <div>
      <h1>{testId}</h1>
    </div>
  );
}
