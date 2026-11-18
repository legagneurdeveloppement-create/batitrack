"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  ArrowRight,
  ArrowLeft,
  ArrowRightLeft,
  Package,
  AlertTriangle,
  PackageCheck,
  History,
} from "lucide-react";
import { Modal } from "@/components/modal";
import { cn } from "@/lib/utils";
import type { Material, StockMovement } from "@/lib/utils";

interface StockViewProps {
  materials: Material[];
  movements: StockMovement[];
  onAddMovement: (mv: Omit<StockMovement, "id">) => void;
}

const MOVEMENT_META: Record<
  StockMovement["type"],
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  in: { label: "Entrée", icon: ArrowRight, color: "green" },
  out: { label: "Sortie", icon: ArrowLeft, color: "orange" },
  transfer: { label: "Transfert", icon: ArrowRightLeft, color: "blue" },
};

const BADGE: Record<string, string> = {
  green: "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30",
  blue: "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/30",
  orange: "bg-[var(--primary)]/15 text-[var(--primary)] border-[var(--primary)]/30",
  red: "bg-[var(--danger)]/15 text-[var(--danger)] border-[var(--danger)]/30",
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
  type: StockMovement["type"];
  quantity: string;
  note: string;
}

export function StockView({ materials, movements, onAddMovement }: StockViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    materialId: materials[0]?.id ?? "",
    type: "in",
    quantity: "1",
    note: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const stockStats = useMemo(() => {
    const total = materials.reduce((sum, m) => sum + m.quantity, 0);
    const low = materials.filter((m) => m.quantity > 0 && m.quantity <= 3);
    const outOfStock = materials.filter((m) => m.quantity === 0);
    return { total, low, outOfStock };
  }, [materials]);

  const sortedMovements = useMemo(() => {
    return [...movements].sort((a, b) =>
      (b.date || "").localeCompare(a.date || "")
    );
  }, [movements]);

  const openCreate = () => {
    setForm({
      materialId: materials[0]?.id ?? "",
      type: "in",
      quantity: "1",
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
    const qty = parseInt(form.quantity, 10);
    if (Number.isNaN(qty) || qty <= 0) {
      setFormError("La quantité doit être un entier positif.");
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    onAddMovement({
      materialId: mat.id,
      materialName: mat.name,
      type: form.type,
      quantity: qty,
      date: today,
      author: "Utilisateur actuel",
      note: form.note.trim(),
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Package className="w-4 h-4" />}
          label="Stock total"
          value={stockStats.total.toLocaleString("fr-FR")}
          accent="orange"
        />
        <StatCard
          icon={<PackageCheck className="w-4 h-4" />}
          label="Références"
          value={String(materials.length)}
          accent="blue"
        />
        <StatCard
          icon={<AlertTriangle className="w-4 h-4" />}
          label="Stock faible"
          value={String(stockStats.low.length)}
          accent="yellow"
        />
        <StatCard
          icon={<History className="w-4 h-4" />}
          label="Mouvements"
          value={String(movements.length)}
          accent="purple"
        />
      </div>

      {/* Low stock alerts */}
      {stockStats.low.length > 0 && (
        <div className="rounded-2xl border border-[var(--warning)]/30 bg-[var(--warning)]/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--warning)] mb-2">
            <AlertTriangle className="w-4 h-4" />
            Alertes de stock faible
          </div>
          <div className="flex flex-wrap gap-2">
            {stockStats.low.map((m) => (
              <span
                key={m.id}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text)]"
              >
                <span className="font-medium">{m.name}</span>
                <span className="text-[var(--text-muted)]">·</span>
                <span className="tabular-nums text-[var(--warning)] font-semibold">
                  {m.quantity} {m.unit}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-[var(--text-muted)]">
          {movements.length} mouvement{movements.length > 1 ? "s" : ""}
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={materials.length === 0}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-md transition active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          Nouveau mouvement
        </button>
      </div>

      {/* Movements list */}
      <div className="rounded-2xl border border-[var(--border)] glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--text-muted)]">
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Matériel</th>
                <th className="px-4 py-3 font-medium text-right">Quantité</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Date</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Auteur</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Note</th>
              </tr>
            </thead>
            <tbody>
              {sortedMovements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[var(--text-muted)]">
                    Aucun mouvement enregistré.
                  </td>
                </tr>
              ) : (
                sortedMovements.map((mv) => {
                  const meta = MOVEMENT_META[mv.type];
                  const Icon = meta.icon;
                  return (
                    <tr
                      key={mv.id}
                      className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]/60 transition"
                    >
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium",
                            BADGE[meta.color]
                          )}
                        >
                          <Icon className="w-3 h-3" />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-[var(--text)]">
                        {mv.materialName}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--text)] font-semibold">
                        {mv.type === "out" ? "−" : mv.type === "in" ? "+" : "→"}
                        {mv.quantity}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-[var(--text-muted)]">
                        {formatDate(mv.date)}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-[var(--text-muted)]">
                        {mv.author}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-[var(--text-muted)] max-w-xs truncate">
                        {mv.note || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nouveau mouvement de stock"
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
              {materials.length === 0 && <option value="">Aucun matériel</option>}
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.reference}) — stock {m.quantity} {m.unit}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Type de mouvement
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(MOVEMENT_META) as StockMovement["type"][]).map((t) => {
                const meta = MOVEMENT_META[t];
                const Icon = meta.icon;
                const active = form.type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className={cn(
                      "h-10 inline-flex items-center justify-center gap-1.5 rounded-xl border text-xs font-medium transition",
                      active
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

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
              Note
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              rows={3}
              placeholder="Sortie pour chantier X, réception commande…"
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

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: "orange" | "blue" | "yellow" | "purple";
}) {
  const accents: Record<string, string> = {
    orange: "text-[var(--primary)] bg-[var(--primary)]/10",
    blue: "text-[var(--accent)] bg-[var(--accent)]/10",
    yellow: "text-[var(--warning)] bg-[var(--warning)]/10",
    purple: "text-[var(--accent-2)] bg-[var(--accent-2)]/10",
  };
  return (
    <div className="rounded-xl border border-[var(--border)] glass p-3 flex items-center gap-3">
      <div
        className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
          accents[accent]
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs text-[var(--text-muted)] truncate">{label}</div>
        <div className="text-lg font-bold text-[var(--text)] tabular-nums leading-tight">
          {value}
        </div>
      </div>
    </div>
  );
}

export default StockView;
