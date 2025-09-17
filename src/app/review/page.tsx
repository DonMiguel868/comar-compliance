"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { loadState } from "@/lib/storage";
import type { AppState, Finding } from "@/lib/types";

export default function ReviewPage() {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    // Load saved data (Findings, CAPAs, etc.)
    const data = loadState();
    setState(data);
  }, []);

  if (!state) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Review Dashboard</h1>
      
      <Card className="p-4">
        <h2 className="text-xl font-semibold">Summary</h2>
        <Separator className="my-2" />
        <p>Findings: <Badge>{state.findings.length}</Badge></p>
        <p>CAPAs: <Badge>{state.capas.length}</Badge></p>
        <p>Expiring Evidence: <Badge>{state.evidence.length}</Badge></p>
      </Card>

      <Card className="p-4">
        <h2 className="text-xl font-semibold">Recent Findings</h2>
        <Separator className="my-2" />
        {state.findings.length === 0 ? (
          <p>No findings yet. Go to Upload to add findings.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-2">
            {state.findings.map((f: Finding, idx: number) => (
              <li key={idx}>
                <strong>{f.title}</strong> – {f.description}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
