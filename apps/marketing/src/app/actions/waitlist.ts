'use server';

import { supabase } from '@/lib/supabase';

interface WaitlistData {
  name: string;
  email: string;
  clubName: string;
  country: string;
  clubType: string;
}

export async function submitWaitlist(data: WaitlistData) {
  const { data: existing } = await supabase
    .from('waitlist_signups')
    .select('position')
    .eq('email', data.email)
    .single();

  if (existing) {
    return { success: true, position: existing.position, alreadyExists: true };
  }

  const { data: inserted, error } = await supabase
    .from('waitlist_signups')
    .insert({
      name: data.name,
      email: data.email,
      club_name: data.clubName,
      role: data.clubType,
    })
    .select('position')
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, position: inserted.position };
}

export async function getWaitlistCount() {
  const { count, error } = await supabase
    .from('waitlist_signups')
    .select('*', { count: 'exact', head: true });

  if (error) return 0;
  return count ?? 0;
}
