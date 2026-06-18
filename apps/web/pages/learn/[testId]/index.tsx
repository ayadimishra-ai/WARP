import { useRouter } from "next/router";

// url : http://localhost:3000/learn/[random-test-id]
export default function Test1Page() {
  const { query } = useRouter();

  return (
    <div>
      <h1>{query.testId}</h1>
    </div>
  );
}
