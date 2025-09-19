import { Suspense } from "react";
import SuccessContent from "./SuccessContent";

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white">
          Loading subpage data...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
