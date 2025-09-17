'use client';

import { useEffect, useMemo, useState } from 'react';
import { loadState, updateState } from '@/lib/storage';
import type { AppState, CAPA, Finding, CapaStatus } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const statuses: CapaStatus[] = ['Open', 'In Progress', 'Done'];

export default function CapaPage() {
  const [state, setState] = useState<AppState | null>(null);

  // form state
  const [findingId, setFindingId] = useState('');
  const [deficiencySummary, setDeficiencySummary] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => setState(loadState()), []);

  const availableFindings = useMemo(() => {
    if (!state) return [];
    // findings that do NOT have a CAPA yet
    return state.findings.filter(f => !f.linkedCapaId);
  }, [state]);

  function resetForm() {
    setFindingId('');
    setDeficiencySummary('');
    setRootCause('');
    setCorrectiveAction('');
    setResponsiblePerson('');
    setDueDate('');
  }

  function createCapa() {
    if (!findingId) return toast.error('Select a finding to link.');
    if (!deficiencySummary.trim()) return toast.error('Deficiency summary is required.');
    if (!correctiveAction.trim()) return toast.error('Corrective action is required.');

    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const next = updateState((s) => {
      const capa: CAPA = {
        id,
        findingId,
        deficiencySummary: deficiencySummary.trim(),
        rootCause: rootCause.trim(),
        correctiveAction: correctiveAction.trim(),
        responsiblePerson: responsiblePerson.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        status: 'Open',
        verificationNotes: '',
        evidenceDocIds: [],
        createdAt: now,
        updatedAt: now,
      };

      // link capa to finding
      const findings = s.findings.map(f =>
        f.id === findingId ? { ...f, linkedCapaId: id, updatedAt: now } : f
      );

      return {
        ...s,
        findings,
        capas: [...s.capas, capa],
      };
    });

    setState(next);
    toast.success('CAPA created and linked.');
    resetForm();
  }

  function updateCapa(c: CAPA) {
    const now = new Date().toISOString();
    const next = updateState((s) => ({
      ...s,
      capas: s.capas.map(x => x.id === c.id ? { ...c, updatedAt: now } : x),
    }));
    setState(next);
  }

  function removeCapa(id: string) {
    const next = updateState((s) => {
      // unlink from finding if any
      const findings = s.findings.map(f => f.linkedCapaId === id ? { ...f, linkedCapaId: undefined } : f);
      const capas = s.capas.filter(c => c.id !== id);
      return { ...s, findings, capas };
    });
    setState(next);
  }

  if (!state) return null;

  return (
    <div className="space-y-6">
      {/* Create CAPA */}
      <Card className="p-4 space-y-3">
        <div className="text-sm font-medium">Create Corrective Action Plan (CAPA)</div>

        {/* Finding selector */}
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Link to Finding</div>
            <Select value={findingId} onValueChange={setFindingId}>
              <SelectTrigger>
                <SelectValue placeholder={availableFindings.length ? 'Select a finding' : 'No unlinked findings'} />
              </SelectTrigger>
              <SelectContent>
                {availableFindings.map((f: Finding) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">Responsible Person</div>
            <Input value={responsiblePerson} onChange={(e) => setResponsiblePerson(e.target.value)} placeholder="e.g., Director of Nursing" />
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">Due Date</div>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Deficiency Summary</div>
            <Input value={deficiencySummary} onChange={(e) => setDeficiencySummary(e.target.value)} placeholder="Short summary of deficiency" />
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">Root Cause</div>
            <Textarea value={rootCause} onChange={(e) => setRootCause(e.target.value)} placeholder="Why did this happen?" rows={3} />
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">Corrective Action</div>
            <Textarea value={correctiveAction} onChange={(e) => setCorrectiveAction(e.target.value)} placeholder="What will we do to fix/avoid recurrence?" rows={3} />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={createCapa} disabled={!findingId}>Create CAPA</Button>
        </div>
      </Card>

      {/* CAPA list */}
      <Card className="p-4 space-y-3">
        <div className="text-sm font-medium">Existing CAPAs</div>

        {state.capas.length === 0 ? (
          <div className="text-sm text-muted-foreground">No CAPAs yet.</div>
        ) : (
          <div className="divide-y">
            {state.capas.map((c) => {
              const linkedFinding = state.findings.find(f => f.id === c.findingId);
              return (
                <div key={c.id} className="grid grid-cols-12 gap-2 py-3">
                  <div className="col-span-3">
                    <div className="text-xs text-muted-foreground">Deficiency</div>
                    <div className="text-sm font-medium">{c.deficiencySummary}</div>
                    <div className="text-xs text-muted-foreground mt-1">Finding: {linkedFinding?.title ?? '—'}</div>
                  </div>

                  <div className="col-span-3">
                    <div className="text-xs text-muted-foreground mb-1">Root Cause</div>
                    <Textarea
                      value={c.rootCause}
                      onChange={(e) => updateCapa({ ...c, rootCause: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="col-span-3">
                    <div className="text-xs text-muted-foreground mb-1">Corrective Action</div>
                    <Textarea
                      value={c.correctiveAction}
                      onChange={(e) => updateCapa({ ...c, correctiveAction: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="col-span-3">
                    <div className="grid gap-2">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Status</div>
                        <Select
                          value={c.status}
                          onValueChange={(v) => updateCapa({ ...c, status: v as CapaStatus })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Verification Notes</div>
                        <Input
                          value={c.verificationNotes ?? ''}
                          onChange={(e) => updateCapa({ ...c, verificationNotes: e.target.value })}
                          placeholder="How verified / by whom / when"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="destructive" onClick={() => removeCapa(c.id)}>Delete</Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
