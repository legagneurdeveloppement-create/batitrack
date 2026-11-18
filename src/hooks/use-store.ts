"use client";

import { useCallback, useEffect, useState } from "react";
import type { Material, Site, StockMovement, Reservation, Maintenance } from "@/lib/utils";
import { SEED_MATERIALS, SEED_SITES, SEED_MOVEMENTS, SEED_RESERVATIONS, SEED_MAINTENANCES } from "@/data/seed";

const STORAGE_KEY = "batitrack-data-v1";

interface StoreData {
  materials: Material[];
  sites: Site[];
  movements: StockMovement[];
  reservations: Reservation[];
  maintenances: Maintenance[];
}

const DEFAULT_DATA: StoreData = {
  materials: SEED_MATERIALS,
  sites: SEED_SITES,
  movements: SEED_MOVEMENTS,
  reservations: SEED_RESERVATIONS,
  maintenances: SEED_MAINTENANCES,
};

export function useStore() {
  const [data, setData] = useState<StoreData>(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoreData;
        setData({ ...DEFAULT_DATA, ...parsed });
      }
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [data, loaded]);

  const addMaterial = useCallback((m: Omit<Material, "id">) => {
    setData((d) => ({ ...d, materials: [...d.materials, { ...m, id: `m${Date.now()}` }] }));
  }, []);

  const updateMaterial = useCallback((m: Material) => {
    setData((d) => ({ ...d, materials: d.materials.map((x) => (x.id === m.id ? m : x)) }));
  }, []);

  const deleteMaterial = useCallback((id: string) => {
    setData((d) => ({ ...d, materials: d.materials.filter((x) => x.id !== id) }));
  }, []);

  const addSite = useCallback((s: Omit<Site, "id">) => {
    setData((d) => ({ ...d, sites: [...d.sites, { ...s, id: `s${Date.now()}` }] }));
  }, []);

  const updateSite = useCallback((s: Site) => {
    setData((d) => ({ ...d, sites: d.sites.map((x) => (x.id === s.id ? s : x)) }));
  }, []);

  const deleteSite = useCallback((id: string) => {
    setData((d) => ({ ...d, sites: d.sites.filter((x) => x.id !== id) }));
  }, []);

  const addMovement = useCallback((mv: Omit<StockMovement, "id">) => {
    setData((d) => ({ ...d, movements: [{ ...mv, id: `mv${Date.now()}` }, ...d.movements] }));
  }, []);

  const addReservation = useCallback((r: Omit<Reservation, "id">) => {
    setData((d) => ({ ...d, reservations: [...d.reservations, { ...r, id: `r${Date.now()}` }] }));
  }, []);

  const addMaintenance = useCallback((mt: Omit<Maintenance, "id">) => {
    setData((d) => ({ ...d, maintenances: [...d.maintenances, { ...mt, id: `mt${Date.now()}` }] }));
  }, []);

  const resetData = useCallback(() => {
    setData(DEFAULT_DATA);
  }, []);

  return {
    data,
    loaded,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addSite,
    updateSite,
    deleteSite,
    addMovement,
    addReservation,
    addMaintenance,
    resetData,
  };
}
