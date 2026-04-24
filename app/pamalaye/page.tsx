import type { Metadata } from "next";
import PamalayeGuard from "./PamalayeGuard";

export const metadata: Metadata = {
  title: "Pamalaye — Mary Grace Lado Labe & Valian Zerna Jusain",
  description:
    "Balay to balay — the quiet first chapter, before the invitation.",
};

export default function PamalayeRoute() {
  return <PamalayeGuard />;
}
