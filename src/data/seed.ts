import type { Material, Site, StockMovement, Reservation, Maintenance } from "@/lib/utils";

export const SEED_MATERIALS: Material[] = [
  { id: "m1", name: "Perceuse Bosch GSB", reference: "BOS-GSB-13", category: "Outillage électroportatif", quantity: 8, unit: "u", status: "available", location: "Hangar A - Étagère 3" },
  { id: "m2", name: "Bétonnière électrique", reference: "BET-350L", category: "Gros matériel", quantity: 3, unit: "u", status: "in-use", location: "Chantier Centre-ville" },
  { id: "m3", name: "Échafaudage aluminium 6m", reference: "ECH-ALU-6", category: "Échafaudages", quantity: 12, unit: "u", status: "available", location: "Hangar B" },
  { id: "m4", name: "Nacelle élévatrice 8m", reference: "NAC-8M", category: "Engins de levage", quantity: 2, unit: "u", status: "maintenance", location: "Atelier" },
  { id: "m5", name: "Casque chantier ANSI", reference: "CAS-ANSI", category: "Sécurité", quantity: 45, unit: "u", status: "available", location: "Hangar A - Étagère 1" },
  { id: "m6", name: "Télémètre laser 50m", reference: "TEL-50M", category: "Mesure", quantity: 5, unit: "u", status: "available", location: "Bureau technique" },
  { id: "m7", name: "Sac ciment 35kg", reference: "CIM-35", category: "Consommables", quantity: 120, unit: "sacs", status: "available", location: "Hangar C" },
  { id: "m8", name: "Visserie mixte (caisse)", reference: "VIS-MIX", category: "Consommables", quantity: 15, unit: "caisses", status: "reserved", location: "Hangar A" },
  { id: "m9", name: "Meuleuse d'angle 125mm", reference: "MEU-125", category: "Outillage électroportatif", quantity: 6, unit: "u", status: "available", location: "Hangar A - Étagère 4" },
  { id: "m10", name: "Gants de protection (paire)", reference: "GNT-PRO", category: "Sécurité", quantity: 30, unit: "paires", status: "available", location: "Hangar A - Étagère 1" },
];

export const SEED_SITES: Site[] = [
  { id: "s1", name: "Rénovation Mairie", location: "Centre-ville, Paris", status: "active", startDate: "2026-09-15", endDate: "2026-12-20", team: "Équipe Alpha (5)", budget: 180000 },
  { id: "s2", name: "Extension pavillon", location: "Banlieue Sud", status: "active", startDate: "2026-10-01", endDate: "2026-11-30", team: "Équipe Beta (3)", budget: 65000 },
  { id: "s3", name: "Construction garage", location: "Zone industrielle Nord", status: "planning", startDate: "2026-12-01", endDate: "2027-02-15", team: "Équipe Gamma (4)", budget: 45000 },
  { id: "s4", name: "Ravalement immeuble", location: "Quartier Est", status: "completed", startDate: "2026-06-01", endDate: "2026-09-30", team: "Équipe Alpha (5)", budget: 95000 },
  { id: "s5", name: "Aménagement loft", location: "Centre-ville", status: "paused", startDate: "2026-08-15", endDate: "2026-12-01", team: "Équipe Delta (2)", budget: 55000 },
];

export const SEED_MOVEMENTS: StockMovement[] = [
  { id: "mv1", materialId: "m2", materialName: "Bétonnière électrique", type: "out", quantity: 1, date: "2026-10-01", author: "Magasinier", note: "Sortie pour chantier Rénovation Mairie" },
  { id: "mv2", materialId: "m7", materialName: "Sac ciment 35kg", type: "out", quantity: 30, date: "2026-10-05", author: "Magasinier", note: "Sortie pour Extension pavillon" },
  { id: "mv3", materialId: "m5", materialName: "Casque chantier ANSI", type: "in", quantity: 20, date: "2026-09-20", author: "Administrateur", note: "Réception commande fournisseur" },
  { id: "mv4", materialId: "m4", materialName: "Nacelle élévatrice 8m", type: "transfer", quantity: 1, date: "2026-10-10", author: "Magasinier", note: "Transfert vers atelier pour maintenance" },
  { id: "mv5", materialId: "m9", materialName: "Meuleuse d'angle 125mm", type: "in", quantity: 3, date: "2026-10-12", author: "Administrateur", note: "Réapprovisionnement" },
];

export const SEED_RESERVATIONS: Reservation[] = [
  { id: "r1", materialId: "m3", materialName: "Échafaudage aluminium 6m", siteId: "s1", siteName: "Rénovation Mairie", quantity: 6, startDate: "2026-10-01", endDate: "2026-12-20", status: "active" },
  { id: "r2", materialId: "m8", materialName: "Visserie mixte (caisse)", siteId: "s2", siteName: "Extension pavillon", quantity: 2, startDate: "2026-10-15", endDate: "2026-11-30", status: "active" },
  { id: "r3", materialId: "m1", materialName: "Perceuse Bosch GSB", siteId: "s3", siteName: "Construction garage", quantity: 3, startDate: "2026-12-01", endDate: "2027-02-15", status: "pending" },
];

export const SEED_MAINTENANCES: Maintenance[] = [
  { id: "mt1", materialId: "m4", materialName: "Nacelle élévatrice 8m", type: "corrective", date: "2026-10-10", status: "in-progress", note: "Réparation système hydraulique" },
  { id: "mt2", materialId: "m2", materialName: "Bétonnière électrique", type: "preventive", date: "2026-11-01", status: "scheduled", note: "Vidange et vérification mensuelle" },
  { id: "mt3", materialId: "m6", materialName: "Télémètre laser 50m", type: "control", date: "2026-09-15", status: "done", note: "Contrôle annuel étalonnage" },
];
