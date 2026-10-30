// Warshati plans (licenses.plan, see supabase/plans.sql). The desktop app unlocks features by plan.
export const PLANS = [
  { id: 1, name: 'Lifetime', desc: 'License forever + updates' },
  { id: 2, name: 'Cloud', desc: 'Cloud services + mobile app' },
  { id: 3, name: 'VIP', desc: 'Everything, incl. shop network' }
];
export const planName = (id) => (PLANS.find((p) => p.id === Number(id)) || PLANS[0]).name;
export const validPlan = (v) => (PLANS.some((p) => p.id === Number(v)) ? Number(v) : 1);
