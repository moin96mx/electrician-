window.ElectroTechSupabase = Object.freeze({
  projectUrl: 'https://xctzrcprhwsawnalbypi.supabase.co',
  anonKey: 'sb_publishable_hAkwDSANcb2xURtd3UKqHg_l0iUMOts',
  apiUrl(path) {
    if (this.projectUrl.includes('YOUR_PROJECT_REF') || this.anonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
      throw new Error('Supabase setup is incomplete. Configure supabase-config.js first.');
    }
    return `${this.projectUrl}/functions/v1/api${path}`;
  },
  headers(accessToken) {
    if (this.anonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
      throw new Error('Supabase setup is incomplete. Configure supabase-config.js first.');
    }
    return {
      apikey: this.anonKey,
      Authorization: `Bearer ${accessToken || this.anonKey}`,
    };
  },
});
