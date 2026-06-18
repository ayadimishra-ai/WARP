import { Button } from "@mantine/core";
import useAssessment from "../../hooks/use-assessment";

export function AssessmentPagination(props: any) {
  const { paginationstate } = useAssessment();
  return (
    <>
      <Button onClick={() => paginationstate?.previous}>{"<"}</Button>
      {}
      <Button onClick={() => paginationstate?.next}>{">"}</Button>
    </>
  );
}
