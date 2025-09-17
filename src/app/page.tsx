'use client';

import { useEffect, useState } from 'react';
import { loadState } from '@/lib/storage';
import type { AppState } from '@/lib/types';
import { Card } from '@/components/ui/card';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </Card>
  );
}

export default function DashboardPage() {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  const openFindings = state?.findings.filter(f => f.status === 'Open').length ?? 0;
  const openCapas = state?.capas.filter(c => c.status === 'Open' || c.status === 'In Progress').length ?? 0;
  const expiringEvidence = 0;

  const recent = [
    ...(state?.findings ?? []).map(f => ({ id: `finding:${f.id}`, kind: 'Finding', title: f.title, when: f.updatedAt })),
    ...(state?.capas ?? []).map(c => ({ id: `capa:${c.id}`, kind: 'CAPA', title: c.deficiencySummary, when: c.updatedAt })),
  ].sort((a,b) => new Date(b.when).getTime() - new Date(a.when).getTime()).slice(0,5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Open Findings" value={openFindings} />
        <StatCard label="Open CAPAs" value={openCapas} />
        <StatCard label="Expiring Evidence" value={expiringEvidence} />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Recent Activity</h2>
        <div className="rounded-md border">
          {recent.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              Nothing yet. Go to <span className="font-medium">Upload</span> to add findings.
            </div>
          ) : (
            <ul className="divide-y">
              {recent.map(r => (
                <li key={r.id} className="flex items-center justify-between p-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{r.title}</span>
                    <span className="text-xs text-muted-foreground">{r.kind}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.when).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
