import type { Metadata } from "next";
import { TokenCheck } from "./_token-check/token-check";

// TODO(Day 3): delete this temporary token check page. The real home arrives on Day 4 and the
// component gallery moves to /design (prompts/day-03.md).
export const metadata: Metadata = { title: "Design tokens" };

export default function Page() {
  return <TokenCheck />;
}
