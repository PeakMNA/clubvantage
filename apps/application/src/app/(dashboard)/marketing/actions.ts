'use server';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { requireAuth } from '@/lib/auth/server-auth';

// ============================================================================
// SERVER-SIDE GRAPHQL CLIENT
// ============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function serverGqlRequest<T = any>(
  document: string,
  variables?: Record<string, any>,
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-access-token')?.value;

  const body = JSON.stringify({ query: document, variables });

  const res = await globalThis.fetch(`${API_URL}/graphql`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body,
  });

  const json = await res.json();

  if (json.errors?.length) {
    const msg = typeof json.errors[0].message === 'string'
      ? json.errors[0].message
      : JSON.stringify(json.errors[0]);
    throw new Error(msg);
  }

  return json.data as T;
}

// ============================================================================
// GRAPHQL DOCUMENTS (defined locally to avoid 'use client' import issues)
// ============================================================================

// --- Query Documents ---

const GetMarketingStatsDocument = /* GraphQL */ `
  query GetMarketingStats {
    marketingStats {
      totalCampaigns
      activeCampaigns
      totalAudienceSize
      totalEmailsSent
    }
  }
`;

const GetSegmentsDocument = /* GraphQL */ `
  query GetSegments($filter: SegmentFilterInput) {
    marketingSegments(filter: $filter) {
      id
      name
      description
      type
      rules
      naturalLanguageQuery
      memberCount
      isArchived
      refreshedAt
      createdAt
      updatedAt
    }
  }
`;

const GetSegmentDocument = /* GraphQL */ `
  query GetSegment($id: ID!) {
    marketingSegment(id: $id) {
      id
      name
      description
      type
      rules
      naturalLanguageQuery
      memberCount
      isArchived
      refreshedAt
      createdAt
      updatedAt
    }
  }
`;

const GetSegmentMembersDocument = /* GraphQL */ `
  query GetSegmentMembers($segmentId: ID!, $skip: Int, $take: Int) {
    marketingSegmentMembers(segmentId: $segmentId, skip: $skip, take: $take) {
      id
      memberId
      firstName
      lastName
      email
      status
      membershipTypeName
    }
  }
`;

const TranslateSegmentQueryDocument = /* GraphQL */ `
  query TranslateSegmentQuery($query: String!) {
    translateSegmentQuery(query: $query) {
      rules
      explanation
      estimatedCount
    }
  }
`;

const GetCampaignsDocument = /* GraphQL */ `
  query GetCampaigns($filter: CampaignFilterInput) {
    marketingCampaigns(filter: $filter) {
      id
      name
      type
      status
      channels
      scheduledAt
      sentAt
      createdAt
      updatedAt
      segments {
        id
        name
        memberCount
      }
      segmentCount
      contentPieceCount
      memberCount
    }
  }
`;

const GetCampaignDocument = /* GraphQL */ `
  query GetCampaign($id: ID!) {
    marketingCampaign(id: $id) {
      id
      name
      type
      status
      channels
      scheduledAt
      sentAt
      createdAt
      updatedAt
      segments {
        id
        name
        description
        type
        memberCount
      }
      contentPieces {
        id
        type
        subject
        body
        previewText
        status
        generatedBy
        variantLabel
        createdAt
        updatedAt
      }
      segmentCount
      contentPieceCount
      memberCount
    }
  }
`;

const GetCampaignMetricsDocument = /* GraphQL */ `
  query GetCampaignMetrics($campaignId: ID!) {
    marketingCampaignMetrics(campaignId: $campaignId) {
      sent
      delivered
      opened
      clicked
      bounced
      unsubscribed
    }
  }
`;

const GetBrandConfigDocument = /* GraphQL */ `
  query GetBrandConfig {
    marketingBrandConfig {
      id
      logoUrl
      primaryColor
      secondaryColor
      tone
      language
      fromName
      fromEmail
      replyToEmail
      guidelines
      createdAt
      updatedAt
    }
  }
`;

const GetChannelsDocument = /* GraphQL */ `
  query GetChannels {
    marketingChannels {
      id
      type
      status
      lastSyncAt
      createdAt
      updatedAt
    }
  }
`;

// --- Mutation Documents ---

const CreateSegmentDocument = /* GraphQL */ `
  mutation CreateMarketingSegment($input: CreateSegmentInput!) {
    createMarketingSegment(input: $input) {
      id
      name
      description
      type
      rules
      naturalLanguageQuery
      memberCount
      isArchived
      refreshedAt
      createdAt
      updatedAt
    }
  }
`;

const UpdateSegmentDocument = /* GraphQL */ `
  mutation UpdateMarketingSegment($id: ID!, $input: UpdateSegmentInput!) {
    updateMarketingSegment(id: $id, input: $input) {
      id
      name
      description
      type
      rules
      naturalLanguageQuery
      memberCount
      isArchived
      refreshedAt
      createdAt
      updatedAt
    }
  }
`;

const DeleteSegmentDocument = /* GraphQL */ `
  mutation DeleteMarketingSegment($id: ID!) {
    deleteMarketingSegment(id: $id)
  }
`;

const CreateCampaignDocument = /* GraphQL */ `
  mutation CreateMarketingCampaign($input: CreateCampaignInput!) {
    createMarketingCampaign(input: $input) {
      id
      name
      type
      status
      channels
      scheduledAt
      sentAt
      createdAt
      updatedAt
      segmentCount
      contentPieceCount
      memberCount
    }
  }
`;

const UpdateCampaignDocument = /* GraphQL */ `
  mutation UpdateMarketingCampaign($id: ID!, $input: UpdateCampaignInput!) {
    updateMarketingCampaign(id: $id, input: $input) {
      id
      name
      type
      status
      channels
      scheduledAt
      sentAt
      createdAt
      updatedAt
      segmentCount
      contentPieceCount
      memberCount
    }
  }
`;

const DeleteCampaignDocument = /* GraphQL */ `
  mutation DeleteMarketingCampaign($id: ID!) {
    deleteMarketingCampaign(id: $id)
  }
`;

const SendCampaignDocument = /* GraphQL */ `
  mutation SendMarketingCampaign($id: ID!) {
    sendMarketingCampaign(id: $id) {
      id
      name
      type
      status
      channels
      scheduledAt
      sentAt
      createdAt
      updatedAt
    }
  }
`;

const GenerateContentDocument = /* GraphQL */ `
  mutation GenerateMarketingContent($input: GenerateContentInput!) {
    generateMarketingContent(input: $input) {
      subject
      body
      previewText
    }
  }
`;

const UpdateBrandConfigDocument = /* GraphQL */ `
  mutation UpdateMarketingBrandConfig($input: UpdateBrandConfigInput!) {
    updateMarketingBrandConfig(input: $input) {
      id
      logoUrl
      primaryColor
      secondaryColor
      tone
      language
      fromName
      fromEmail
      replyToEmail
      guidelines
      createdAt
      updatedAt
    }
  }
`;

const RefreshSegmentCountDocument = /* GraphQL */ `
  mutation RefreshSegmentCount($id: ID!) {
    refreshSegmentCount(id: $id) {
      id
      memberCount
      refreshedAt
    }
  }
`;

// ============================================================================
// CACHED QUERY FUNCTIONS
// React.cache() deduplicates calls within a single request lifecycle
// ============================================================================

/**
 * Get marketing overview stats (total campaigns, active campaigns, audience size, emails sent)
 */
export const getMarketingStats = cache(async () => {
  const data = await serverGqlRequest<{ marketingStats: any }>(GetMarketingStatsDocument);
  return data.marketingStats;
});

/**
 * Get audience segments with optional filter (type, isArchived)
 */
export const getSegments = cache(async (filter?: { type?: string; isArchived?: boolean }) => {
  const data = await serverGqlRequest<{ marketingSegments: any[] }>(
    GetSegmentsDocument,
    filter ? { filter } : undefined,
  );
  return data.marketingSegments;
});

/**
 * Get a single audience segment by ID
 */
export const getSegment = cache(async (id: string) => {
  const data = await serverGqlRequest<{ marketingSegment: any }>(
    GetSegmentDocument,
    { id },
  );
  return data.marketingSegment;
});

/**
 * Get members belonging to a segment (paginated)
 */
export async function getSegmentMembers(
  segmentId: string,
  skip: number = 0,
  take: number = 50,
) {
  const data = await serverGqlRequest<{ marketingSegmentMembers: any[] }>(
    GetSegmentMembersDocument,
    { segmentId, skip, take },
  );
  return data.marketingSegmentMembers;
}

/**
 * Translate a natural language query into segment rules
 */
export async function translateSegmentQuery(query: string) {
  const data = await serverGqlRequest<{ translateSegmentQuery: any }>(
    TranslateSegmentQueryDocument,
    { query },
  );
  return data.translateSegmentQuery;
}

/**
 * Get marketing campaigns with optional filter (status, type, limit, offset)
 */
export const getCampaigns = cache(async (filter?: {
  status?: string;
  type?: string;
  limit?: number;
  offset?: number;
}) => {
  const data = await serverGqlRequest<{ marketingCampaigns: any[] }>(
    GetCampaignsDocument,
    filter ? { filter } : undefined,
  );
  return data.marketingCampaigns;
});

/**
 * Get a single campaign by ID (includes segments, content pieces)
 */
export const getCampaign = cache(async (id: string) => {
  const data = await serverGqlRequest<{ marketingCampaign: any }>(
    GetCampaignDocument,
    { id },
  );
  return data.marketingCampaign;
});

/**
 * Get campaign delivery metrics (sent, delivered, opened, clicked, bounced, unsubscribed)
 */
export async function getCampaignMetrics(campaignId: string) {
  const data = await serverGqlRequest<{ marketingCampaignMetrics: any }>(
    GetCampaignMetricsDocument,
    { campaignId },
  );
  return data.marketingCampaignMetrics;
}

/**
 * Get brand configuration (logo, colors, tone, sender details, guidelines)
 */
export const getBrandConfig = cache(async () => {
  const data = await serverGqlRequest<{ marketingBrandConfig: any }>(GetBrandConfigDocument);
  return data.marketingBrandConfig;
});

/**
 * Get marketing channel configurations (email, social, LINE, etc.)
 */
export const getChannels = cache(async () => {
  const data = await serverGqlRequest<{ marketingChannels: any[] }>(GetChannelsDocument);
  return data.marketingChannels;
});

// ============================================================================
// MUTATION ACTION FUNCTIONS
// ============================================================================

/**
 * Create a new audience segment
 */
export async function createSegmentAction(input: {
  name: string;
  description?: string;
  type: string;
  rules: any[];
  naturalLanguageQuery?: string;
}) {
  await requireAuth();
  const data = await serverGqlRequest<{ createMarketingSegment: any }>(
    CreateSegmentDocument,
    { input },
  );
  return data.createMarketingSegment;
}

/**
 * Update an existing audience segment
 */
export async function updateSegmentAction(
  id: string,
  input: {
    name?: string;
    description?: string;
    rules?: any[];
  },
) {
  await requireAuth();
  const data = await serverGqlRequest<{ updateMarketingSegment: any }>(
    UpdateSegmentDocument,
    { id, input },
  );
  return data.updateMarketingSegment;
}

/**
 * Delete (archive) an audience segment
 */
export async function deleteSegmentAction(id: string) {
  await requireAuth();
  const data = await serverGqlRequest<{ deleteMarketingSegment: boolean }>(
    DeleteSegmentDocument,
    { id },
  );
  return data.deleteMarketingSegment;
}

/**
 * Create a new marketing campaign
 */
export async function createCampaignAction(input: {
  name: string;
  type: string;
  channels: string[];
  segmentIds?: string[];
}) {
  await requireAuth();
  const data = await serverGqlRequest<{ createMarketingCampaign: any }>(
    CreateCampaignDocument,
    { input },
  );
  return data.createMarketingCampaign;
}

/**
 * Update an existing marketing campaign
 */
export async function updateCampaignAction(
  id: string,
  input: {
    name?: string;
    type?: string;
    channels?: string[];
    scheduledAt?: string;
    segmentIds?: string[];
  },
) {
  await requireAuth();
  const data = await serverGqlRequest<{ updateMarketingCampaign: any }>(
    UpdateCampaignDocument,
    { id, input },
  );
  return data.updateMarketingCampaign;
}

/**
 * Delete a draft campaign
 */
export async function deleteCampaignAction(id: string) {
  await requireAuth();
  const data = await serverGqlRequest<{ deleteMarketingCampaign: boolean }>(
    DeleteCampaignDocument,
    { id },
  );
  return data.deleteMarketingCampaign;
}

/**
 * Send a campaign to its audience
 */
export async function sendCampaignAction(id: string) {
  await requireAuth();
  const data = await serverGqlRequest<{ sendMarketingCampaign: any }>(
    SendCampaignDocument,
    { id },
  );
  return data.sendMarketingCampaign;
}

/**
 * AI-generate email content for a campaign
 */
export async function generateContentAction(input: {
  campaignGoal: string;
  audienceDescription?: string;
  tone?: string;
  contentType?: string;
}) {
  await requireAuth();
  const data = await serverGqlRequest<{ generateMarketingContent: any }>(
    GenerateContentDocument,
    { input },
  );
  return data.generateMarketingContent;
}

/**
 * Refresh a segment's member count
 */
export async function refreshSegmentCountAction(id: string) {
  await requireAuth();
  const data = await serverGqlRequest<{ refreshSegmentCount: any }>(
    RefreshSegmentCountDocument,
    { id },
  );
  return data.refreshSegmentCount;
}

/**
 * Update brand configuration (logo, colors, tone, sender details, guidelines)
 */
export async function updateBrandConfigAction(input: {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  tone?: string;
  language?: string;
  fromName?: string;
  fromEmail?: string;
  replyToEmail?: string;
  guidelines?: string;
}) {
  await requireAuth();
  const data = await serverGqlRequest<{ updateMarketingBrandConfig: any }>(
    UpdateBrandConfigDocument,
    { input },
  );
  return data.updateMarketingBrandConfig;
}
