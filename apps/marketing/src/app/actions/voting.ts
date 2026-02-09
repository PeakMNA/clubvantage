'use server';

import { supabase } from '@/lib/supabase';

export async function toggleVote(email: string, featureId: string) {
  // Check if vote exists
  const { data: existing } = await supabase
    .from('feature_votes')
    .select('id')
    .eq('email', email)
    .eq('feature_id', featureId)
    .single();

  if (existing) {
    // Remove vote
    await supabase
      .from('feature_votes')
      .delete()
      .eq('email', email)
      .eq('feature_id', featureId);
  } else {
    // Add vote
    await supabase
      .from('feature_votes')
      .insert({ email, feature_id: featureId });
  }

  // Return updated counts
  return getVoteCounts();
}

export async function getVoteCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('feature_votes')
    .select('feature_id');

  if (error || !data) return {};

  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.feature_id] = (counts[row.feature_id] || 0) + 1;
  }
  return counts;
}

export async function getUserVotes(email: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('feature_votes')
    .select('feature_id')
    .eq('email', email);

  if (error || !data) return [];
  return data.map((row) => row.feature_id);
}
