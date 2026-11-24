import { Suspense } from "react";
import PantallaMapa from "@/features/mapa/PantallaMapa";

export default function Home() {
  return <Suspense fallback={null}><PantallaMapa /></Suspense>;
}
