"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Calendar,
  MapPin,
  Package,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Modal } from "@/components/modal";
import { cn } from "@/lib/utils";
import type { Reservation, Material, Site } from "@/lib/utils";

interface ReservationsViewProps {
  reservations: Reservation[];
  materials: Material[];
  sites: Site[];
  onAdd: (r: Omit<Reservation, "id">) => void;
}

const STATUS_META: Record<
  Reservation["status"],
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  pending: { label: "En attente", color: "orange", icon: Clock },
  active: { label: "Active", color: "green", icon: CheckCircle2 },
  returned: { label: "Retournée", color: "blue", icon: CheckCircle2 },
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
  siteId: string;
  quantity: string;
  startDate: string;
  endDate: string;
  status: Reservation["status"];
}

export function ReservationsView({
  reservations,
  materials,
  sites,
  onAdd,
}: ReservationsViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    materialId: materials[0]?.id ?? "",
    siteId: sites[0]?.id ?? "",
    quantity: "1",
    startDate: "",
    endDate: "",
    status: "pending",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const priority: Record<Reservation["status"], number> = {
      active: 0,
      pending: 1,
      returned: 2,
    };
    return [...reservations].sort(
      (a, b) => priority[a.status] - priority[b.status]
    );
  }, [reservations]);

  const openCreate = () => {
    setForm({
      materialId: materials[0]?.id ?? "",
      siteId: sites[0]?.id ?? "",
      quantity: "1",
      startDate: "",
      endDate: "",
      status: "pending",
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
    if (!form.siteId) {
      setFormError("Veuillez sélectionner un chantier.");
      return;
    }
    const mat = materials.find((m) => m.id === form.materialId);
    const site = sites.find((s) => s.id === form.siteId);
    if (!mat || !site) {
      setFormError("Matériel ou chantier introuvable.");
      return;
    }
    const qty = parseInt(form.quantity, 10);
    if (Number.isNaN(qty) || qty <= 0) {
      setFormError("La quantité doit être un entier positif.");
      return;
    }
    if (!form.startDate || !form.endDate) {
      setFormError("Veuillez renseigner les dates.");
      return;
    }
    onAdd({
      materialId: mat.id,
      materialName: mat.name,
      siteId: site.id,
      siteName: site.name,
      quantity: qty,
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-[var(--text-muted)]">
          {reservations.length} réservation{reservations.length > 1 ? "s" : ""}
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={materials.length === 0 || sites.length === 0}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-md transition active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          Nouvelle réservation
        </button>
      </div>

      {/* List */}
      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] glass p-10 text-center text-[var(--text-muted)]">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
          Aucune réservation enregistrée.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sorted.map((r) => {
            const meta = STATUS_META[r.status];
            const Icon = meta.icon;
            return (
              <article
                key={r.id}
                className="rounded-2xl border border-[var(--border)] glass p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[var(--text)]">
                      <Package className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
                      <span className="font-semibold truncate">{r.materialName}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{r.siteName}</span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium flex-shrink-0",
                      BADGE[meta.color]
                    )}
                  >
                    <Icon className="w-3 h-3" />
                    {meta.label}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-[var(--surface-2)]/60 px-2.5 py-1.5">
                    <div className="text-[var(--text-muted)]">Quantité</div>
                    <div className="font-semibold text-[var(--text)] tabular-nums">
                      {r.quantity}
                    </div>
                  </div>
                  <div className="rounded-lg bg-[var(--surface-2)]/60 px-2.5 py-1.5">
                    <div className="text-[var(--text-muted)]">Période</div>
                    <div className="font-medium text-[var(--text)] text-[11px] leading-tight">
                      {formatDate(r.startDate)}
                      <div className="text-[var(--text-muted)]">→ {formatDate(r.endDate)}</div>
                    </div>
                  </div>
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
        title="Nouvelle réservation"
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

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Chantier *
            </label>
            <select
              value={form.siteId}
              onChange={(e) => setForm((f) => ({ ...f, siteId: e.target.value }))}
              className="w-full h-10 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition cursor-pointer"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.location}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                Quantité
              </label>
              <input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                Du
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                Au
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
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
                setForm((f) => ({ ...f, status: e.target.value as Reservation["status"] }))
              }
              className="w-full h-10 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition cursor-pointer"
            >
              {(Object.keys(STATUS_META) as Reservation["status"][]).map((st) => (
                <option key={st} value={st}>
                  {STATUS_META[st].label}
                </option>
              ))}
            </select>
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

export default ReservationsView;
