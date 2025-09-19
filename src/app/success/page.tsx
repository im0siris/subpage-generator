// src/app/success/page.tsx
import { Suspense } from "react";
import SuccessContent from "./SuccessContent";

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white bg-slate-900">
          <div className="text-lg font-mono text-cyan-400">
            Loading subpage data...
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}