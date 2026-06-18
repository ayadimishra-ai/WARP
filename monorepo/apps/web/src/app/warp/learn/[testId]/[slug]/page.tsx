"use client";

import { useParams } from "next/navigation";

export default function SlugPage() {
  const params = useParams();
  const testId = params?.testId as string | undefined;
  const slug = params?.slug as string | undefined;
  return (
    <div>
      <h1>{testId}</h1>
      <h1>{slug}</h1>
    </div>
  );
}
