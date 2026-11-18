import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Role =
  | "admin"
  | "magasinier"
  | "chef"
  | "electricien"
  | "plombier"
  | "charpentier"
  | "macon"
  | "plaquiste"
  | "peintre"
  | "ouvrier";

export interface User {
  role: Role;
  name: string;
  code: string;
}

export interface Material {
  id: string;
  name: string;
  reference: string;
  category: string;
  quantity: number;
  unit: string;
  status: "available" | "in-use" | "maintenance" | "reserved";
  location: string;
}

export interface Site {
  id: string;
  name: string;
  location: string;
  status: "planning" | "active" | "completed" | "paused";
  startDate: string;
  endDate: string;
  team: string;
  budget: number;
}

export interface StockMovement {
  id: string;
  materialId: string;
  materialName: string;
  type: "in" | "out" | "transfer";
  quantity: number;
  date: string;
  author: string;
  note: string;
}

export interface Reservation {
  id: string;
  materialId: string;
  materialName: string;
  siteId: string;
  siteName: string;
  quantity: number;
  startDate: string;
  endDate: string;
  status: "pending" | "active" | "returned";
}

export interface Maintenance {
  id: string;
  materialId: string;
  materialName: string;
  type: "preventive" | "corrective" | "control";
  date: string;
  status: "scheduled" | "in-progress" | "done";
  note: string;
}

export const ROLE_CONFIG: Record<Role, {
  label: string;
  icon: string;
  color: string;
  gradient: string;
  description: string;
  perimetre: string;
  accessCode: string;
  category?: string;
}> = {
  admin: {
    label: "Administrateur",
    icon: "shield",
    color: "red",
    gradient: "from-red-500 to-rose-600",
    description: "Pilotage complet du parc matériel, des équipes et des chantiers",
    perimetre: "Parc, équipes & autorisations",
    accessCode: "ADMIN2026",
  },
  magasinier: {
    label: "Magasinier",
    icon: "package",
    color: "amber",
    gradient: "from-amber-400 to-orange-500",
    description: "Stock, références, mouvements & coupes métrage",
    perimetre: "Stock, références & mouvements",
    accessCode: "MAG2026",
  },
  chef: {
    label: "Chef de chantier",
    icon: "hard-hat",
    color: "orange",
    gradient: "from-orange-500 to-amber-600",
    description: "Chantiers, réservations, maintenance & équipes",
    perimetre: "Chantiers, réservations & maintenance",
    accessCode: "CHEF2026",
  },
  electricien: {
    label: "Électricien",
    icon: "zap",
    color: "yellow",
    gradient: "from-yellow-400 to-amber-500",
    description: "Câbles, gaines & matériel électrique",
    perimetre: "Stock électricité, métrage câbles, gaines",
    accessCode: "ELEC2026",
    category: "Électricité",
  },
  plombier: {
    label: "Plombier",
    icon: "droplet",
    color: "teal",
    gradient: "from-teal-400 to-cyan-500",
    description: "Tubes, joints & matériel plomberie",
    perimetre: "Stock plomberie, étanchéité & collages",
    accessCode: "PLOMB2026",
    category: "Plomberie",
  },
  charpentier: {
    label: "Charpentier",
    icon: "hammer",
    color: "orange",
    gradient: "from-orange-600 to-amber-700",
    description: "Profilés, visserie & matériel charpente",
    perimetre: "Stock charpente & visserie",
    accessCode: "CHARP2026",
    category: "Charpente",
  },
  macon: {
    label: "Maçon",
    icon: "trowel",
    color: "slate",
    gradient: "from-slate-500 to-slate-700",
    description: "Consommables, emballages & matériel maçonnerie",
    perimetre: "Stock maçonnerie & consommables",
    accessCode: "MACON2026",
    category: "Maçonnerie",
  },
  plaquiste: {
    label: "Plaquiste",
    icon: "layers",
    color: "green",
    gradient: "from-green-400 to-emerald-500",
    description: "Cloisons, plaques, rails & visserie",
    perimetre: "Stock visserie & fixation",
    accessCode: "PLAQU2026",
    category: "Plaquisterie",
  },
  peintre: {
    label: "Peintre",
    icon: "paintbrush",
    color: "purple",
    gradient: "from-fuchsia-500 to-purple-600",
    description: "Peinture, enduits, mastics & finitions",
    perimetre: "Stock consommables peinture",
    accessCode: "PEINT2026",
    category: "Peinture",
  },
  ouvrier: {
    label: "Ouvrier polyvalent",
    icon: "users",
    color: "slate",
    gradient: "from-slate-500 to-gray-700",
    description: "EPI, consommables & réservations",
    perimetre: "Stock EPI & protection",
    accessCode: "OUV2026",
    category: "EPI",
  },
};

export const ROLE_ORDER: Role[] = [
  "admin",
  "magasinier",
  "chef",
  "electricien",
  "plombier",
  "charpentier",
  "macon",
  "plaquiste",
  "peintre",
  "ouvrier",
];

export const MATERIAL_CATEGORIES = [
  "Outillage électroportatif",
  "Gros matériel",
  "Échafaudages",
  "Engins de levage",
  "Sécurité",
  "Mesure",
  "Consommables",
];

export const MATERIAL_STATUS: Record<Material["status"], { label: string; color: string }> = {
  available: { label: "Disponible", color: "green" },
  "in-use": { label: "En utilisation", color: "blue" },
  maintenance: { label: "En maintenance", color: "orange" },
  reserved: { label: "Réservé", color: "purple" },
};

export const SITE_STATUS: Record<Site["status"], { label: string; color: string }> = {
  planning: { label: "En préparation", color: "orange" },
  active: { label: "En cours", color: "green" },
  completed: { label: "Terminé", color: "blue" },
  paused: { label: "En pause", color: "gray" },
};

export function genId(): string {
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
