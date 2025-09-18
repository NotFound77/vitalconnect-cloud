// Lightweight stub supabase client for frontend-only mode.
// This file intentionally implements the minimal API surface used by the app
// so the dashboards and pages keep working without the real @supabase/supabase-js.

type SupabaseError = { message: string } | null;

const noop = () => {};

const auth = {
  // onAuthStateChange returns a subscription object with unsubscribe
  onAuthStateChange: (cb: (event: string, session: any) => void) => {
    // Immediately call back with no session
    const subscription = { unsubscribe: () => {} };
    setTimeout(() => cb('INITIAL_SESSION', null), 0);
    return { data: { subscription } };
  },
  getSession: async () => ({ data: { session: null } }),
  getUser: async () => ({ data: { user: null } }),
  signUp: async (_: any) => ({ error: null }),
  signInWithPassword: async (_: any) => ({ error: null }),
  signOut: async () => ({ error: null }),
};

// Minimal query builder stub for `.from(...).insert().select().single()` and `.update().eq()`
const from = (table: string) => {
  return {
    insert: async (_row: any) => ({ data: null, error: null }),
    select: function () { return this; },
    single: async function () { return { data: null, error: null }; },
    update: async (_row: any) => ({ data: null, error: null }),
    eq: function () { return this; },
  };
};

const functions = {
  invoke: async (_name: string, _opts?: any) => ({ data: null, error: null }),
};

export const supabase = {
  auth,
  from,
  functions,
};

export default supabase;