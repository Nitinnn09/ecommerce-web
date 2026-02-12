import { Suspense } from "react";
import TrackContent from "../track/track-content";

export default function TrackPage() {
  return (
    <Suspense fallback={<div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>}>
      <TrackContent />
    </Suspense>
  );
}