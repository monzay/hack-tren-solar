import { Suspense } from "react";
import type { Metadata } from "next";
import NavegacionAdmin from "@/features/admin/NavegacionAdmin";

export const metadata: Metadata = { title: "Administración · Mapa del delito" };

export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-bold">Administración</h1>
      <Suspense fallback={<div className="h-10" aria-hidden="true" />}>
        <NavegacionAdmin />
      </Suspense>
      {children}
    </div>
  );
}
