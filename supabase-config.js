window.ElectroTechSupabase = Object.freeze({
  projectUrl: 'https://xctzrcprhwsawnalbypi.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjdHpyY3ByaHdzYXduYWxieXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTYwNDEsImV4cCI6MjEwNzAzMjA0MX0.nYZikfjkTudQxAA8oaeSFFAhJ5RGrGr2oPd--Cc_deQ',
  publishableKey: 'sb_publishable_hAkwDSANcb2xURtd3UKqHg_l0iUMOts',
  apiUrl(path) {
    // path = /bookings, /contacts, /admin/login etc
    // Final URL: https://...supabase.co/functions/v1/api/bookings
    if (!path.startsWith('/')) path = '/' + path;
    return `${this.projectUrl}/functions/v1/api${path}`;
  },
  headers(accessToken) {
    // Supabase Edge Functions needs both apikey and Authorization
    // Use legacy JWT for compatibility
    return {
      apikey: this.anonKey,
      Authorization: `Bearer ${accessToken || this.anonKey}`,
      'Content-Type': 'application/json',
    };
  },
});
console.log("✅ ElectroTechSupabase config loaded - Fixed version");
