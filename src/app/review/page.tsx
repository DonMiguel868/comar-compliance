'use client';

import { useEffect, useState } from 'react';
import { loadState, updateState } from '@/lib/storage';
import type { Finding, Severity, Category, AppState } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

const severities: Severity[] = ['Critical', 'Major', 'Minor'];
const categories: Category[] = ['Personnel', 'Medication', 'Safety', 'Other'];

export default function ReviewPage() {
  const [state, setState] = useState<AppState | null>(null);

  // load from localStorage on mount
  useEffect(() => setState(loadState()), []);

  function saveFinding(updated: Finding) {
    const next = updateState(s => ({
      ...s,
      findings: s.findings.map(f =>
        f.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : f
      ),
    }));
    setState(next);
  }

  function toggleStatus(f: Finding) {
    saveFinding({ ...f, status: f.status === 'Open' ? 'Resolved' : 'Open' });
  }

  function removeFinding(id: string) {
    const next = updateState(s => ({ ...s, findings: s.findings.filter(f => f.id !== id) }));
    setState(next);
  }

  if (!state) return null;
  const { findings } = state;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="mb-3 text-sm text-muted-foreground">
          {findings.length} finding{findings.length === 1 ? '' : 's'}
        </div>

        {/* header row */}
        <div className="grid grid-cols-12 gap-2 px-2 py-2 text-xs font-medium text-muted-foreground">
          <div className="col-span-3">Title</div>
          <div className="col-span-2">COMAR Ref</div>
          <div className="col-span-2">Severity</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* rows */}
        <div className="divide-y">
          {findings.map((f) => (
            <div key={f.id} className="grid grid-cols-12 items-center gap-2 px-2 py-2">
              <div className="col-span-3">
                <Input
                  value={f.title}
                  onChange={(e) => saveFinding({ ...f, title: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <Input
                  value={f.comarRef ?? ''}
                  onChange={(e) => saveFinding({ ...f, comarRef: e.target.value })}
                  placeholder="e.g. 10.07.14.XX"
                />
              </div>

              <div className="col-span-2">
                <Select
                  value={f.severity}
                  onValueChange={(v) => saveFinding({ ...f, severity: v as Severity })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {severities.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Select
                  value={f.category}
                  onValueChange={(v) => saveFinding({ ...f, category: v as Category })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-1 text-sm">{f.status}</div>

              <div className="col-span-2 flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => toggleStatus(f)}>
                  {f.status === 'Open' ? 'Mark Resolved' : 'Reopen'}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => removeFinding(f.id)}>
                  Delete
                </Button>
              </div>

              {/* Notes (full width) */}
              <div className="col-span-12">
                <Input
                  value={f.notes ?? ''}
                  onChange={(e) => saveFinding({ ...f, notes: e.target.value })}
                  placeholder="Notes (optional)"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
