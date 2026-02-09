'use server';

import { supabase } from '@/lib/supabase';

interface SuggestionData {
  email?: string;
  title: string;
  description: string;
  category: string;
}

export async function submitFeatureSuggestion(data: SuggestionData) {
  const { error } = await supabase
    .from('feature_suggestions')
    .insert({
      email: data.email || null,
      title: data.title,
      description: data.description,
      category: data.category,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
