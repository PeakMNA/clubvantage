'use server';

import { supabase } from '@/lib/supabase';

interface ContactData {
  name: string;
  email: string;
  clubName: string;
  message: string;
}

export async function submitContact(data: ContactData) {
  const { error } = await supabase
    .from('contact_submissions')
    .insert({
      name: data.name,
      email: data.email,
      club_name: data.clubName,
      message: data.message,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
