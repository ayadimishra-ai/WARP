"use client";

import { useUpdateFormCalcMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-form-calc";
import { useGetFormCalcQuery } from "@/modules/warp/packages/graphql/queries/generated/get-form-calc";
import { useEffect, useState } from "react";

export default function AjvTest() {
  const [value, setValue] = useState<string>();

  const [updateCalc] = useUpdateFormCalcMutation();
  const formResult = useGetFormCalcQuery();

  useEffect(() => {}, [value]);

  useEffect(() => {
    setValue(formResult?.data?.Form[0]?.calc);
  }, [formResult]);

  return (
    <div>
      <textarea
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
      />

      <button onClick={() => updateCalc({ variables: { calc: { value } } })}>
        Save
      </button>
    </div>
  );
}
