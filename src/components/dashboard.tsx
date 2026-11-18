"use client";

import { useMemo, useState } from "react";
import {
  HardHat,
  Shield,
  Package,
  Zap,
  Droplet,
  Hammer,
  Construction,
  Layers,
  Paintbrush,
  Users,
  LogOut,
  LayoutGrid,
  TrendingUp,
  PackageCheck,
  Wrench,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { AppToolbar } from "@/components/app-toolbar";
import { MaterialsView } from "@/components/materials-view";
import { SitesView } from "@/components/sites-view";
import { StockView } from "@/components/stock-view";
import { ReservationsView } from "@/components/reservations-view";
import { MaintenanceView } from "@/components/maintenance-view";
import { useStore } from "@/hooks/use-store";
import { ROLE_CONFIG, cn } from "@/lib/utils";
import type { Role } from "@/lib/utils";

interface DashboardProps {
  role: Role;
  onLogout: () => void;
}

type TabId =
  | "overview"
  | "materials"
  | "sites"
  | "stock"
  | "movements"
  | "reservations"
  | "maintenance";

const TRADE_TABS = [
  { id: "materials" as const, label: "Mon matériel" },
  { id: "stock" as const, label: "Stock" },
  { id: "movements" as const, label: "Mouvements" },
];

const TAB_CONFIG: Record<Role, { id: TabId; label: string }[]> = {
  admin: [
    { id: "overview", label: "Vue d'ensemble" },
    { id: "materials", label: "Matériel" },
    { id: "sites", label: "Chantiers" },
    { id: "stock", label: "Stock" },
    { id: "reservations", label: "Réservations" },
    { id: "maintenance", label: "Maintenance" },
  ],
  magasinier: [
    { id: "materials", label: "Matériel" },
    { id: "stock", label: "Stock" },
    { id: "movements", label: "Mouvements" },
  ],
  chef: [
    { id: "sites", label: "Chantiers" },
    { id: "reservations", label: "Réservations" },
    { id: "materials", label: "Matériel" },
  ],
  electricien: TRADE_TABS,
  plombier: TRADE_TABS,
  charpentier: TRADE_TABS,
  macon: TRADE_TABS,
  plaquiste: TRADE_TABS,
  peintre: TRADE_TABS,
  ouvrier: TRADE_TABS,
};

const ROLE_ICONS: Record<Role, React.ComponentType<{ className?: string }>> = {
  admin: Shield,
  magasinier: Package,
  chef: HardHat,
  electricien: Zap,
  plombier: Droplet,
  charpentier: Hammer,
  macon: Construction,
  plaquiste: Layers,
  peintre: Paintbrush,
  ouvrier: Users,
};

export function Dashboard({ role, onLogout }: DashboardProps) {
  const {
    data,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addSite,
    updateSite,
    deleteSite,
    addMovement,
    addReservation,
    addMaintenance,
  } = useStore();

  const tabs = TAB_CONFIG[role];
  const [activeTab, setActiveTab] = useState<TabId>(tabs[0].id);

  const RoleIcon = ROLE_ICONS[role];
  const roleCfg = ROLE_CONFIG[role];

  // Access control
  const canEditMaterials = role === "admin" || role === "magasinier";
  const canEditSites = role === "admin" || role === "chef";
  // Magasinier & admin can add movements; chef is read-only on stock (no stock tab anyway)

  const overviewStats = useMemo(() => {
    const totalMaterials = data.materials.reduce((s, m) => s + m.quantity, 0);
    const activeSites = data.sites.filter((s) => s.status === "active").length;
    const maintenanceInProgress = data.maintenances.filter(
      (m) => m.status === "in-progress"
    ).length;
    const lowStock = data.materials.filter((m) => m.quantity > 0 && m.quantity <= 3);
    return {
      totalMaterials,
      activeSites,
      maintenanceInProgress,
      lowStock,
      materialsCount: data.materials.length,
      sitesCount: data.sites.length,
    };
  }, [data]);

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return (
          <Overview
            stats={overviewStats}
            recentMovements={data.movements.slice(0, 5)}
            recentMaintenances={data.maintenances.slice(0, 4)}
          />
        );
      case "materials":
        return (
          <MaterialsView
            materials={data.materials}
            onAdd={addMaterial}
            onUpdate={updateMaterial}
            onDelete={deleteMaterial}
            canEdit={canEditMaterials}
          />
        );
      case "sites":
        return (
          <SitesView
            sites={data.sites}
            onAdd={addSite}
            onUpdate={updateSite}
            onDelete={deleteSite}
            canEdit={canEditSites}
          />
        );
      case "stock":
      case "movements":
        return (
          <StockView
            materials={data.materials}
            movements={data.movements}
            onAddMovement={addMovement}
          />
        );
      case "reservations":
        return (
          <ReservationsView
            reservations={data.reservations}
            materials={data.materials}
            sites={data.sites}
            onAdd={addReservation}
          />
        );
      case "maintenance":
        return (
          <MaintenanceView
            maintenances={data.maintenances}
            materials={data.materials}
            onAdd={addMaintenance}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen batitrack-bg">
      <AppToolbar />

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[var(--primary)]/8 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-[var(--accent)]/8 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-6 pb-12">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-[var(--border)] animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-md flex-shrink-0">
              <HardHat className="w-6 h-6 text-white" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h1
                className="text-xl sm:text-2xl font-bold text-[var(--text)] leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                BâtiTrack
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                Gestion de parc matériel &amp; chantiers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border)] glass">
              <div
                className={cn(
                  "w-6 h-6 rounded-lg bg-gradient-to-br flex items-center justify-center",
                  roleCfg.gradient
                )}
              >
                <RoleIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-medium text-[var(--text)]">
                {roleCfg.label}
              </span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 h-10 px-3 sm:px-4 rounded-xl border border-[var(--primary)]/30 text-[var(--primary)] hover:bg-[var(--primary)]/10 text-sm font-semibold transition active:scale-[0.99]"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </header>

        {/* Tabs */}
        <nav
          className="mt-5 flex flex-wrap items-center gap-1.5 animate-fade-in"
          aria-label="Navigation principale"
        >
          {tabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "h-9 px-3.5 rounded-xl text-sm font-medium transition border",
                  active
                    ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
                )}
              >
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <main className="mt-6">{renderTab()}</main>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
          BâtiTrack · par{" "}
          <span className="font-semibold text-[var(--text)]">
            LEGAGNEUR DÉVELOPPEMENT
          </span>
        </footer>
      </div>
    </div>
  );
}

/* ---------------- Overview (admin) ---------------- */

interface OverviewProps {
  stats: {
    totalMaterials: number;
    activeSites: number;
    maintenanceInProgress: number;
    lowStock: { id: string; name: string; quantity: number; unit: string }[];
    materialsCount: number;
    sitesCount: number;
  };
  recentMovements: { id: string; materialName: string; type: string; quantity: number; date: string }[];
  recentMaintenances: { id: string; materialName: string; type: string; status: string; date: string }[];
}

function Overview({ stats, recentMovements, recentMaintenances }: OverviewProps) {
  const cards = [
    {
      label: "Total matériel",
      value: stats.materialsCount,
      sub: `${stats.totalMaterials.toLocaleString("fr-FR")} unités en stock`,
      icon: PackageCheck,
      gradient: "from-[var(--primary)] to-[var(--primary-hover)]",
    },
    {
      label: "Chantiers actifs",
      value: stats.activeSites,
      sub: `${stats.sitesCount} chantiers au total`,
      icon: MapPin,
      gradient: "from-[var(--success)] to-emerald-600",
    },
    {
      label: "Stock total",
      value: stats.totalMaterials.toLocaleString("fr-FR"),
      sub: "somme des quantités",
      icon: TrendingUp,
      gradient: "from-[var(--accent)] to-[var(--accent-2)]",
    },
    {
      label: "Maintenance en cours",
      value: stats.maintenanceInProgress,
      sub: "interventions actives",
      icon: Wrench,
      gradient: "from-[var(--accent-2)] to-[var(--accent)]",
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              style={{ animationDelay: `${i * 60}ms` }}
              className="rounded-2xl border border-[var(--border)] glass p-4 hover:shadow-md transition animate-fade-in"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 shadow",
                  c.gradient
                )}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[var(--text)] tabular-nums leading-tight">
                {c.value}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1">{c.label}</div>
              <div className="text-[11px] text-[var(--text-muted)]/80 mt-0.5">
                {c.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Low stock alerts */}
      {stats.lowStock.length > 0 && (
        <div className="rounded-2xl border border-[var(--warning)]/30 bg-[var(--warning)]/10 p-4 animate-fade-in">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--warning)] mb-2">
            <AlertTriangle className="w-4 h-4" />
            Alertes de stock faible ({stats.lowStock.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.lowStock.map((m) => (
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

      {/* Recent activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] glass p-4">
          <div className="flex items-center gap-2 mb-3">
            <LayoutGrid className="w-4 h-4 text-[var(--primary)]" />
            <h3 className="text-sm font-semibold text-[var(--text)]">
              Mouvements récents
            </h3>
          </div>
          {recentMovements.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-4 text-center">
              Aucun mouvement.
            </p>
          ) : (
            <ul className="space-y-2">
              {recentMovements.map((mv) => (
                <li
                  key={mv.id}
                  className="flex items-center justify-between gap-2 text-sm py-1.5 border-b border-[var(--border)] last:border-0"
                >
                  <span className="text-[var(--text)] truncate">
                    {mv.materialName}
                  </span>
                  <span className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded font-medium",
                        mv.type === "in" && "bg-[var(--success)]/15 text-[var(--success)]",
                        mv.type === "out" && "bg-[var(--primary)]/15 text-[var(--primary)]",
                        mv.type === "transfer" && "bg-[var(--accent)]/15 text-[var(--accent)]"
                      )}
                    >
                      {mv.type === "in" ? "Entrée" : mv.type === "out" ? "Sortie" : "Transfert"}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] tabular-nums">
                      {mv.quantity}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--border)] glass p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-4 h-4 text-[var(--accent-2)]" />
            <h3 className="text-sm font-semibold text-[var(--text)]">
              Maintenances récentes
            </h3>
          </div>
          {recentMaintenances.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-4 text-center">
              Aucune maintenance.
            </p>
          ) : (
            <ul className="space-y-2">
              {recentMaintenances.map((mt) => (
                <li
                  key={mt.id}
                  className="flex items-center justify-between gap-2 text-sm py-1.5 border-b border-[var(--border)] last:border-0"
                >
                  <span className="text-[var(--text)] truncate">
                    {mt.materialName}
                  </span>
                  <span className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-[var(--text-muted)]">
                      {mt.type === "preventive"
                        ? "Préventive"
                        : mt.type === "corrective"
                        ? "Corrective"
                        : "Contrôle"}
                    </span>
                    <span
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded font-medium",
                        mt.status === "done" && "bg-[var(--success)]/15 text-[var(--success)]",
                        mt.status === "in-progress" && "bg-[var(--accent)]/15 text-[var(--accent)]",
                        mt.status === "scheduled" && "bg-[var(--warning)]/15 text-[var(--warning)]"
                      )}
                    >
                      {mt.status === "done"
                        ? "Terminée"
                        : mt.status === "in-progress"
                        ? "En cours"
                        : "Planifiée"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
