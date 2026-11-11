// Synthetic persona generator for the "10,000 gift recommendations" study.
// Uses the same option sets as the real wizard (app/wizard/wizard-client.tsx and
// lib/interests.ts), restricted to combinations a real shopper could pick.
// Deterministic: the same seed always yields the same personas.

export const RELATIONSHIPS = ["Partner", "Friend", "Parent", "Sibling", "Child", "Colleague"];
export const AGE_RANGES = ["Under 10", "10–17", "18–30", "31–60", "60+"];
export const OCCASIONS = ["Birthday", "Holiday", "Anniversary", "Graduation", "Baby Shower", "Just Because"];
export const BUDGETS = ["under-25", "25-50", "50-100", "100-250", "250+"];
export const PREFERENCES = ["gifts", "experiences", "both"];
export const INTERESTS = ["Cooking", "Travel", "Fitness", "Gaming", "Reading", "Music", "Art", "Outdoors", "Tech", "Fashion"];

const ADULT = new Set(["18–30", "31–60", "60+"]);

export function isPlausible(p) {
  if (["Partner", "Colleague"].includes(p.relationship) && !ADULT.has(p.ageRange)) return false;
  if (p.relationship === "Child" && p.ageRange === "60+") return false;
  if (p.relationship === "Parent" && !["31–60", "60+"].includes(p.ageRange)) return false;
  if (p.occasion === "Anniversary" && p.relationship !== "Partner") return false;
  if (p.occasion === "Graduation" && p.ageRange === "Under 10") return false;
  if (p.occasion === "Graduation" && p.ageRange === "60+") return false;
  if (p.occasion === "Baby Shower" && !["18–30", "31–60"].includes(p.ageRange)) return false;
  if (p.occasion === "Baby Shower" && p.relationship === "Parent") return false;
  return true;
}

// mulberry32
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generatePersonas(n, seed = 1) {
  const rand = rng(seed);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const out = [];
  const seen = new Set();
  let guard = 0;
  while (out.length < n && guard++ < n * 200) {
    const k = rand() < 0.5 ? 1 : 2;
    const pool = [...INTERESTS];
    const interests = [];
    for (let i = 0; i < k; i++) interests.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
    const p = {
      relationship: pick(RELATIONSHIPS),
      ageRange: pick(AGE_RANGES),
      occasion: pick(OCCASIONS),
      budget: pick(BUDGETS),
      giftPreference: pick(PREFERENCES),
      interests: interests.sort(),
    };
    if (!isPlausible(p)) continue;
    const key = JSON.stringify(p);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ id: `p${String(out.length + 1).padStart(5, "0")}`, ...p });
  }
  return out;
}
