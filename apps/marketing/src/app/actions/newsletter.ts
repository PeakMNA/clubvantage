'use server';

import { supabase } from '@/lib/supabase';

export async function subscribeNewsletter(email: string, source: 'footer' | 'cta' = 'footer') {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email, source }, { onConflict: 'email' });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
