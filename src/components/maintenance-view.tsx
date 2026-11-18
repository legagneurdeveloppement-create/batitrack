"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Modal } from "@/components/modal";
import { cn } from "@/lib/utils";
import type { Maintenance, Material } from "@/lib/utils";

interface MaintenanceViewProps {
  maintenances: Maintenance[];
  materials: Material[];
  onAdd: (mt: Omit<Maintenance, "id">) => void;
}

const TYPE_META: Record<
  Maintenance["type"],
  { label: string; color: string }
> = {
  preventive: { label: "Préventive", color: "blue" },
  corrective: { label: "Corrective", color: "orange" },
  control: { label: "Contrôle", color: "purple" },
};

const STATUS_META: Record<
  Maintenance["status"],
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  scheduled: { label: "Planifiée", color: "orange", icon: Clock },
  "in-progress": { label: "En cours", color: "blue", icon: AlertTriangle },
  done: { label: "Terminée", color: "green", icon: CheckCircle2 },
};

const BADGE: Record<string, string> = {
  green: "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30",
  blue: "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/30",
  orange: "bg-[var(--primary)]/15 text-[var(--primary)] border-[var(--primary)]/30",
  purple: "bg-[var(--accent-2)]/15 text-[var(--accent-2)] border-[var(--accent-2)]/30",
  gray: "bg-[var(--text-muted)]/15 text-[var(--text-muted)] border-[var(--text-muted)]/30",
};

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface FormState {
  materialId: string;
  type: Maintenance["type"];
  date: string;
  status: Maintenance["status"];
  note: string;
}

export function MaintenanceView({
  maintenances,
  materials,
  onAdd,
}: MaintenanceViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<FormState>({
    materialId: materials[0]?.id ?? "",
    type: "preventive",
    date: today,
    status: "scheduled",
    note: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const priority: Record<Maintenance["status"], number> = {
      "in-progress": 0,
      scheduled: 1,
      done: 2,
    };
    return [...maintenances].sort((a, b) => {
      const p = priority[a.status] - priority[b.status];
      if (p !== 0) return p;
      return (a.date || "").localeCompare(b.date || "");
    });
  }, [maintenances]);

  const counts = useMemo(() => {
    const inProgress = maintenances.filter((m) => m.status === "in-progress").length;
    const scheduled = maintenances.filter((m) => m.status === "scheduled").length;
    return { inProgress, scheduled };
  }, [maintenances]);

  const openCreate = () => {
    setForm({
      materialId: materials[0]?.id ?? "",
      type: "preventive",
      date: today,
      status: "scheduled",
      note: "",
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.materialId) {
      setFormError("Veuillez sélectionner un matériel.");
      return;
    }
    const mat = materials.find((m) => m.id === form.materialId);
    if (!mat) {
      setFormError("Matériel introuvable.");
      return;
    }
    if (!form.date) {
      setFormError("Veuillez renseigner la date.");
      return;
    }
    onAdd({
      materialId: mat.id,
      materialName: mat.name,
      type: form.type,
      date: form.date,
      status: form.status,
      note: form.note.trim(),
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-[var(--border)] glass p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--accent)]/10 text-[var(--accent)]">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)]">Total</div>
            <div className="text-lg font-bold text-[var(--text)] tabular-nums leading-tight">
              {maintenances.length}
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] glass p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--accent)]/10 text-[var(--accent)]">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)]">En cours</div>
            <div className="text-lg font-bold text-[var(--text)] tabular-nums leading-tight">
              {counts.inProgress}
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] glass p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--primary)]/10 text-[var(--primary)]">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)]">Planifiées</div>
            <div className="text-lg font-bold text-[var(--text)] tabular-nums leading-tight">
              {counts.scheduled}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-[var(--text-muted)]">
          {maintenances.length} intervention{maintenances.length > 1 ? "s" : ""}
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={materials.length === 0}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-md transition active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          Nouvelle maintenance
        </button>
      </div>

      {/* List */}
      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] glass p-10 text-center text-[var(--text-muted)]">
          <Wrench className="w-10 h-10 mx-auto mb-3 opacity-40" />
          Aucune maintenance enregistrée.
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((mt) => {
            const typeMeta = TYPE_META[mt.type];
            const statusMeta = STATUS_META[mt.status];
            const StatusIcon = statusMeta.icon;
            return (
              <article
                key={mt.id}
                className="rounded-xl border border-[var(--border)] glass p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[var(--text)] truncate">
                      {mt.materialName}
                    </div>
                    {mt.note && (
                      <div className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                        {mt.note}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-medium",
                      BADGE[typeMeta.color]
                    )}
                  >
                    {typeMeta.label}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-medium",
                      BADGE[statusMeta.color]
                    )}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusMeta.label}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[var(--text-muted)]">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(mt.date)}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nouvelle maintenance"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Matériel *
            </label>
            <select
              value={form.materialId}
              onChange={(e) => setForm((f) => ({ ...f, materialId: e.target.value }))}
              className="w-full h-10 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition cursor-pointer"
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.reference})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value as Maintenance["type"] }))
                }
                className="w-full h-10 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition cursor-pointer"
              >
                {(Object.keys(TYPE_META) as Maintenance["type"][]).map((t) => (
                  <option key={t} value={t}>
                    {TYPE_META[t].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Statut
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as Maintenance["status"] }))
              }
              className="w-full h-10 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition cursor-pointer"
            >
              {(Object.keys(STATUS_META) as Maintenance["status"][]).map((st) => (
                <option key={st} value={st}>
                  {STATUS_META[st].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Note
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              rows={3}
              placeholder="Réparation système hydraulique, vidange, contrôle annuel…"
              className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition resize-none"
            />
          </div>

          {formError && <p className="text-sm text-[var(--danger)]">{formError}</p>}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="h-10 px-4 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--surface-2)] transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="h-10 px-4 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold shadow-md transition active:scale-[0.99]"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MaintenanceView;
