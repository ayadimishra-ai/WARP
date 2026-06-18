import { useRouter } from "next/router";

// url : http://localhost:3000/learn/[random-test-string]/name
export default function NamePage() {
  const { query } = useRouter();

  return (
    <div>
      <h1>Name Page</h1>
      <h2>{query.testId}</h2>
    </div>
  );
}
