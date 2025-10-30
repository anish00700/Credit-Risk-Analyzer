import { mockApplicants } from "./mockData";

export type StoredApplicant = typeof mockApplicants[number];

const STORAGE_KEY = "cs_applications";

export function loadApplications(): StoredApplicant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored: StoredApplicant[] = raw ? JSON.parse(raw) : [];

    // Merge mocks with stored (stored wins on ID conflicts)
    const byId: Record<string, StoredApplicant> = {};
    for (const a of mockApplicants) byId[a.id] = a;
    for (const a of stored) byId[a.id] = a;
    return Object.values(byId);
  } catch {
    return mockApplicants;
  }
}

export function saveApplications(applicants: StoredApplicant[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applicants));
  } catch {
    // ignore storage errors
  }
}

export function addApplication(applicant: StoredApplicant) {
  const current = loadApplications();
  const next = [applicant, ...current.filter(a => a.id !== applicant.id)];
  saveApplications(next);
}

export function generateApplicationId(): string {
  const now = new Date();
  const ts = now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `APP-${ts}-${rand}`;
}


