"use client";
import dynamic from "next/dynamic";

const SnapshotOrgLevel = dynamic(
  () =>
    import("~/components/ghg-dashboard/snapshot-org-level/snapshot-org-level"),
  {
    ssr: false,
  }
);

const GhgSnapshotOrg = () => {
  return (
    <>
      <SnapshotOrgLevel />
    </>
  );
};
export default GhgSnapshotOrg;
