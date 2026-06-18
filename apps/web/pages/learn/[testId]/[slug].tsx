import { useRouter } from "next/router";

// url : http://localhost:3000/learn/[random-test-string]/[random-slug-string]
export default function SlugPage() {
  const { query } = useRouter();

  return (
    <div>
      <h1>{query.testId}</h1>
      <h1>{query.slug}</h1>
    </div>
  );
}
