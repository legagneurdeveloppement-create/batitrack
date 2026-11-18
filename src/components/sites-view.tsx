"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Users,
  DollarSign,
  Calendar,
  HardHat,
  AlertTriangle,
} from "lucide-react";
import { Modal } from "@/components/modal";
import { cn, SITE_STATUS } from "@/lib/utils";
import type { Site } from "@/lib/utils";

interface SitesViewProps {
  sites: Site[];
  onAdd: (s: Omit<Site, "id">) => void;
  onUpdate: (s: Site) => void;
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
  location: string;
  status: Site["status"];
  startDate: string;
  endDate: string;
  team: string;
  budget: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  location: "",
  status: "planning",
  startDate: "",
  endDate: "",
  team: "",
  budget: "0",
};

function formatEuro(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function SitesView({ sites, onAdd, onUpdate, onDelete, canEdit }: SitesViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Site | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Site | null>(null);

  const sorted = useMemo(() => {
    const priority: Record<Site["status"], number> = {
      active: 0,
      planning: 1,
      paused: 2,
      completed: 3,
    };
    return [...sites].sort((a, b) => priority[a.status] - priority[b.status]);
  }, [sites]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (s: Site) => {
    setEditing(s);
    setForm({
      name: s.name,
      location: s.location,
      status: s.status,
      startDate: s.startDate,
      endDate: s.endDate,
      team: s.team,
      budget: String(s.budget),
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("Le nom du chantier est obligatoire.");
      return;
    }
    const budget = parseFloat(form.budget);
    if (Number.isNaN(budget) || budget < 0) {
      setFormError("Le budget doit être un nombre positif.");
      return;
    }
    const payload: Omit<Site, "id"> = {
      name: form.name.trim(),
      location: form.location.trim(),
      status: form.status,
      startDate: form.startDate,
      endDate: form.endDate,
      team: form.team.trim(),
      budget,
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
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-[var(--text-muted)]">
          {sites.length} chantier{sites.length > 1 ? "s" : ""}
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold shadow-md transition active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            Nouveau chantier
          </button>
        )}
      </div>

      {/* Cards grid */}
      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] glass p-10 text-center text-[var(--text-muted)]">
          <HardHat className="w-10 h-10 mx-auto mb-3 opacity-40" />
          Aucun chantier enregistré.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((s) => {
            const status = SITE_STATUS[s.status];
            return (
              <article
                key={s.id}
                className="group rounded-2xl border border-[var(--border)] glass p-4 hover:shadow-lg hover:border-[var(--primary)]/30 transition flex flex-col"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-[var(--text)] leading-tight">
                      {s.name}
                    </h3>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <MapPin className="w-3.5 h-3.5" />
                      {s.location || "Lieu non défini"}
                    </p>
                  </div>
                  <Badge color={status.color} label={status.label} />
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                      {formatDate(s.startDate)} → {formatDate(s.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Users className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{s.team || "Équipe non assignée"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text)]">
                    <DollarSign className="w-3.5 h-3.5 flex-shrink-0 text-[var(--success)]" />
                    <span className="font-semibold">{formatEuro(s.budget)}</span>
                  </div>
                </div>

                {canEdit && (
                  <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(s)}
                      aria-label="Modifier"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(s)}
                      aria-label="Supprimer"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Modifier le chantier" : "Nouveau chantier"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Nom du chantier *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex : Rénovation Mairie"
              className="w-full h-10 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Lieu
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="Centre-ville, Paris"
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
                setForm((f) => ({ ...f, status: e.target.value as Site["status"] }))
              }
              className="w-full h-10 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition cursor-pointer"
            >
              {(Object.keys(SITE_STATUS) as Site["status"][]).map((st) => (
                <option key={st} value={st}>
                  {SITE_STATUS[st].label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                Date de début
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
                Date de fin
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                Équipe
              </label>
              <input
                type="text"
                value={form.team}
                onChange={(e) => setForm((f) => ({ ...f, team: e.target.value }))}
                placeholder="Équipe Alpha (5)"
                className="w-full h-10 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                Budget (€)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={form.budget}
                onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition tabular-nums"
              />
            </div>
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
              {editing ? "Enregistrer" : "Créer le chantier"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        title="Supprimer le chantier"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/30 p-3">
            <AlertTriangle className="w-5 h-5 text-[var(--danger)] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--text)]">
              Voulez-vous vraiment supprimer le chantier{" "}
              <span className="font-semibold">{confirmDelete?.name}</span> ?
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

export default SitesView;
