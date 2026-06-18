import { useRouter } from "next/router";

// url : http://localhost:3000/learn/test/[random-test-id]
export default function TestPage() {
  const { query } = useRouter();

  return (
    <div>
      <h1>{query.testId}</h1>
    </div>
  );
}
