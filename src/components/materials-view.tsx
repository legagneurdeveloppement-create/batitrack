"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  Filter,
  AlertTriangle,
} from "lucide-react";
import { Modal } from "@/components/modal";
import {
  cn,
  MATERIAL_CATEGORIES,
  MATERIAL_STATUS,
} from "@/lib/utils";
import type { Material } from "@/lib/utils";

interface MaterialsViewProps {
  materials: Material[];
  onAdd: (m: Omit<Material, "id">) => void;
  onUpdate: (m: Material) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}

const STATUS_BADGE: Record<string, string> = {
  green: "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30",
  blue: "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/30",
  orange: "bg-[var(--primary)]/15 text-[var(--primary)] border-[var(--primary)]/30",
  purple: "bg-[var(--accent-2)]/15 text-[var(--accent-2)] border-[var(--accent-2)]/30",
  red: "bg-[var(--danger)]/15 text-[var(--danger)] border-[var(--danger)]/30",
  gray: "bg-[var(--text-muted)]/15 text-[var(--text-muted)] border-[var(--text-muted)]/30",
  yellow: "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30",
};

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium",
        STATUS_BADGE[color] ?? STATUS_BADGE.gray
      )}
    >
      {label}
    </span>
  );
}

interface FormState {
  name: string;
  reference: string;
  category: string;
  quantity: string;
  unit: string;
  status: Material["status"];
  location: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  reference: "",
  category: MATERIAL_CATEGORIES[0],
  quantity: "1",
  unit: "u",
  status: "available",
  location: "",
};

export function MaterialsView({
  materials,
  onAdd,
  onUpdate,
  onDelete,
  canEdit,
}: MaterialsViewProps) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Material | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return materials.filter((m) => {
      const matchesQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.reference.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q);
      const matchesCategory =
        categoryFilter === "all" || m.category === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [materials, query, categoryFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (m: Material) => {
    setEditing(m);
    setForm({
      name: m.name,
      reference: m.reference,
      category: m.category,
      quantity: String(m.quantity),
      unit: m.unit,
      status: m.status,
      location: m.location,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("Le nom est obligatoire.");
      return;
    }
    if (!form.reference.trim()) {
      setFormError("La référence est obligatoire.");
      return;
    }
    const qty = parseInt(form.quantity, 10);
    if (Number.isNaN(qty) || qty < 0) {
      setFormError("La quantité doit être un nombre positif.");
      return;
    }
    const payload: Omit<Material, "id"> = {
      name: form.name.trim(),
      reference: form.reference.trim(),
      category: form.category,
      quantity: qty,
      unit: form.unit.trim() || "u",
      status: form.status,
      location: form.location.trim(),
    };
    if (editing) {
      onUpdate({ ...editing, ...payload });
    } else {
      onAdd(payload);
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    onDelete(confirmDelete.id);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par nom, référence, catégorie…"
              className="w-full h-10 pl-10 pr-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 pl-10 pr-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition appearance-none cursor-pointer"
            >
              <option value="all">Toutes catégories</option>
              {MATERIAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold shadow-md transition active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            Ajouter du matériel
          </button>
        )}
      </div>

      {/* Count + low stock */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
        <span className="inline-flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" />
          {filtered.length} matériel{filtered.length > 1 ? "s" : ""}
          {categoryFilter !== "all" || query ? " (filtré)" : ""}
        </span>
        {(() => {
          const low = materials.filter((m) => m.quantity <= 3).length;
          if (low === 0) return null;
          return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--warning)]/10 border border-[var(--warning)]/30 text-[var(--warning)]">
              <AlertTriangle className="w-3.5 h-3.5" />
              {low} en stock faible
            </span>
          );
        })()}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[var(--border)] glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--text-muted)]">
                <th className="px-4 py-3 font-medium">Matériel</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Catégorie</th>
                <th className="px-4 py-3 font-medium text-right">Quantité</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Emplacement</th>
                {canEdit && <th className="px-4 py-3 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={canEdit ? 6 : 5}
                    className="px-4 py-10 text-center text-[var(--text-muted)]"
                  >
                    Aucun matériel trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const status = MATERIAL_STATUS[m.status];
                  return (
                    <tr
                      key={m.id}
                      className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]/60 transition"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-[var(--text)]">{m.name}</div>
                        <div className="text-xs text-[var(--text-muted)] font-mono">
                          {m.reference}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-[var(--text-muted)]">
                        {m.category}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--text)]">
                        <span className="font-semibold">{m.quantity}</span>
                        <span className="text-xs text-[var(--text-muted)] ml-1">
                          {m.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge color={status.color} label={status.label} />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-[var(--text-muted)]">
                        {m.location || "—"}
                      </td>
                      {canEdit && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(m)}
                              aria-label="Modifier"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(m)}
                              aria-label="Supprimer"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Modifier le matériel" : "Ajouter du matériel"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Nom *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex : Perceuse Bosch GSB"
              className="w-full h-10 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                Référence *
              </label>
              <input
                type="text"
                value={form.reference}
                onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                placeholder="BOS-GSB-13"
                className="w-full h-10 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                Catégorie
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition cursor-pointer"
              >
                {MATERIAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                Quantité
              </label>
              <input
                type="number"
                min={0}
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                Unité
              </label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                placeholder="u, sacs, paires…"
                className="w-full h-10 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                Statut
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value as Material["status"] }))
                }
                className="w-full h-10 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition cursor-pointer"
              >
                {(Object.keys(MATERIAL_STATUS) as Material["status"][]).map((s) => (
                  <option key={s} value={s}>
                    {MATERIAL_STATUS[s].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Emplacement
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="Hangar A — Étagère 3"
              className="w-full h-10 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition"
            />
          </div>

          {formError && (
            <p className="text-sm text-[var(--danger)]">{formError}</p>
          )}

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
              {editing ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        title="Supprimer le matériel"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/30 p-3">
            <AlertTriangle className="w-5 h-5 text-[var(--danger)] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--text)]">
              Voulez-vous vraiment supprimer{" "}
              <span className="font-semibold">{confirmDelete?.name}</span> ? Cette
              action est irréversible.
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setConfirmDelete(null)}
              className="h-10 px-4 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--surface-2)] transition"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="h-10 px-4 rounded-xl bg-[var(--danger)] hover:opacity-90 text-white text-sm font-semibold shadow-md transition active:scale-[0.99]"
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default MaterialsView;
