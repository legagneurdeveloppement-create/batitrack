"use client";

import { useEffect, useState } from "react";
import type { Role } from "@/lib/utils";
import { ROLE_CONFIG } from "@/lib/utils";

const STORAGE_KEY = "batitrack-auth-v1";

export function useAuth() {
  const [role, setRole] = useState<Role | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Role | null;
      if (stored && ROLE_CONFIG[stored]) {
        setRole(stored);
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  const login = (code: string): { success: boolean; role?: Role; error?: string } => {
    const upperCode = code.trim().toUpperCase();
    for (const [r, config] of Object.entries(ROLE_CONFIG) as [Role, typeof ROLE_CONFIG[Role]][]) {
      if (config.accessCode === upperCode) {
        setRole(r);
        try {
          localStorage.setItem(STORAGE_KEY, r);
        } catch {
          // ignore
        }
        return { success: true, role: r };
      }
    }
    return { success: false, error: "Code d'accès incorrect. Vérifiez votre saisie." };
  };

  const logout = () => {
    setRole(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return { role, mounted, login, logout };
}
