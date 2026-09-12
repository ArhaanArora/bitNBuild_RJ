import { HiringRequirement, UserHiringProfile } from '../types/hiring';

const SHORTLIST_KEY = 'skillverify_shortlisted_candidates';
const PROFILE_KEY = 'skillverify_hiring_profile';
const LAST_SEARCH_KEY = 'skillverify_last_hiring_search';

export function getShortlistedCandidateIds(): string[] {
  try {
    const raw = localStorage.getItem(SHORTLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to read shortlist from localStorage:', err);
    return [];
  }
}

export function isCandidateShortlisted(candidateId: string): boolean {
  const ids = getShortlistedCandidateIds();
  return ids.includes(candidateId);
}

export function toggleShortlistCandidate(candidateId: string): { isShortlisted: boolean; count: number } {
  const ids = getShortlistedCandidateIds();
  let updated: string[];
  let isShortlisted: boolean;

  if (ids.includes(candidateId)) {
    updated = ids.filter((id) => id !== candidateId);
    isShortlisted = false;
  } else {
    updated = [...ids, candidateId];
    isShortlisted = true;
  }

  try {
    localStorage.setItem(SHORTLIST_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to write shortlist to localStorage:', err);
  }

  return { isShortlisted, count: updated.length };
}

export function getUserHiringProfile(): UserHiringProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to read user hiring profile from localStorage:', err);
    return null;
  }
}

export function saveUserHiringProfile(profile: UserHiringProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn('Failed to write user hiring profile to localStorage:', err);
  }
}

export function toggleRecruiterDiscoverability(): boolean {
  const profile = getUserHiringProfile();
  if (!profile) return false;
  profile.recruiterVisibility = !profile.recruiterVisibility;
  profile.updatedAt = new Date().toISOString();
  saveUserHiringProfile(profile);
  return profile.recruiterVisibility;
}

export function getLastHiringSearch(): HiringRequirement | null {
  try {
    const raw = localStorage.getItem(LAST_SEARCH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to read last hiring search from localStorage:', err);
    return null;
  }
}

export function saveLastHiringSearch(req: HiringRequirement): void {
  try {
    localStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(req));
  } catch (err) {
    console.warn('Failed to write last hiring search to localStorage:', err);
  }
}
