import type { Metadata } from "next";
import "react-datepicker/dist/react-datepicker.css";
import "@mantine/dates/styles.css";
import "@/modules/warp/styles/global.css";
import WarpClientShell from "./WarpClientShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WARP",
  description: "WARP assessment platform",
};

export default function WarpLayout({ children }: { children: React.ReactNode }) {
  return <WarpClientShell>{children}</WarpClientShell>;
}
