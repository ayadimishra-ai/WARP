"use client";

import { useParams } from "next/navigation";

export default function NamePage() {
  const params = useParams();
  const testId = params?.testId as string | undefined;
  return (
    <div>
      <h1>Name Page</h1>
      <h2>{testId}</h2>
    </div>
  );
}
