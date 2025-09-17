'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { updateState, loadState } from '@/lib/storage';
import type { Finding, Severity, Category } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

function newFinding(partial: Partial<Finding>): Finding {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: partial.title ?? '',
    comarRef: partial.comarRef ?? '',
    severity: (partial.severity as Severity) ?? 'Minor',
    notes: partial.notes ?? '',
    pageRef: partial.pageRef ?? '',
    status: 'Open',
    category: (partial.category as Category) ?? 'Other',
    linkedCapaId: undefined,
    createdAt: now,
    updatedAt: now,
  };
}

const severities: Severity[] = ['Critical', 'Major', 'Minor'];
const categories: Category[] = ['Personnel', 'Medication', 'Safety', 'Other'];

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [comarRef, setComarRef] = useState('');
  const [severity, setSeverity] = useState<Severity>('Minor');
  const [category, setCategory] = useState<Category>('Other');
  const [notes, setNotes] = useState('');
  const [pageRef, setPageRef] = useState('');
  const [bulkText, setBulkText] = useState('');

  function addFindings(findings: Finding[]) {
    const next = updateState((s) => ({ ...s, findings: [...s.findings, ...findings] }));
    toast.success(`Added ${findings.length} finding${findings.length === 1 ? '' : 's'}.`);
    return next;
  }

  function handleQuickAdd() {
    if (!title.trim()) {
      toast.error('Title is required.');
      return;
    }
    addFindings([newFinding({ title, comarRef, severity, category, notes, pageRef })]);
    setTitle(''); setComarRef(''); setSeverity('Minor'); setCategory('Other'); setNotes(''); setPageRef('');
  }

  function handleBulkAdd() {
    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return toast.error('Paste one finding per line.');
    const created = lines.map(line => newFinding({ title: line, severity, category }));
    addFindings(created);
    setBulkText('');
  }

  function handleCsvFile(file: File) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = (res.data as any[]).filter(Boolean);
        if (rows.length === 0) return toast.error('CSV appears empty.');
        const created: Finding[] = rows.map((r) =>
          newFinding({
            title: String(r.title ?? '').trim(),
            comarRef: String(r.comarRef ?? '').trim(),
            severity: (String(r.severity ?? 'Minor').trim() as Severity) || 'Minor',
            notes: String(r.notes ?? '').trim(),
            pageRef: String(r.pageRef ?? '').trim(),
            category: (String(r.category ?? 'Other').trim() as Category) || 'Other',
          })
        );
        addFindings(created);
      },
      error: () => toast.error('Failed to parse CSV.'),
    });
  }

  const state = typeof window !== 'undefined' ? loadState() : null;
  const currentCount = state?.findings.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        Current findings: <span className="font-medium">{currentCount}</span>
      </div>

      <Card className="p-4 space-y-3">
        <div className="text-sm font-medium">Quick Add (single finding)</div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Finding title (required)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="COMAR ref (label only)" value={comarRef} onChange={(e) => setComarRef(e.target.value)} />
          <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
            <SelectTrigger><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent>
              {severities.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Page ref (optional)" value={pageRef} onChange={(e) => setPageRef(e.target.value)} />
          <Textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleQuickAdd}>Add Finding</Button>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="text-sm font-medium">Bulk Paste (one finding per line)</div>
        <Textarea
          placeholder={'e.g.\nMissing CPR/First Aid certs\nMedication count log incomplete\nEmergency drill not documented'}
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          rows={6}
        />
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">Defaults for pasted lines:</div>
          <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent>
              {severities.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="secondary" onClick={handleBulkAdd}>Add Lines</Button>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="text-sm font-medium">Import CSV</div>
        <div className="text-xs text-muted-foreground">
          Expected headers: <code>title, comarRef, severity, notes, pageRef, category</code>
        </div>
        <Input
          type="file"
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleCsvFile(file);
          }}
        />
      </Card>
    </div>
  );
}
