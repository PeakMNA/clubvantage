import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  createClient,
  SupabaseClient,
  RealtimeChannel,
} from '@supabase/supabase-js';
import supabaseConfig from '@/config/supabase.config';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export interface ChannelSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

export interface TableChangePayload<T = Record<string, unknown>> {
  eventType: RealtimeEvent;
  table: string;
  schema: string;
  old: T | null;
  new: T | null;
  commitTimestamp: string;
}

@Injectable()
export class SupabaseRealtimeService implements OnModuleDestroy {
  private supabase: SupabaseClient;
  private channels: Map<string, RealtimeChannel> = new Map();

  constructor(
    @Inject(supabaseConfig.KEY)
    private config: ConfigType<typeof supabaseConfig>,
  ) {
    this.supabase = createClient(this.config.url, this.config.serviceRoleKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }

  /**
   * Subscribe to changes on a specific table
   */
  subscribeToTable<T = Record<string, unknown>>(
    table: string,
    event: RealtimeEvent,
    callback: (payload: TableChangePayload<T>) => void,
    filter?: string,
  ): ChannelSubscription {
    const channelName = `${table}-${event}-${filter || 'all'}-${Date.now()}`;

    const channelConfig = {
      event,
      schema: 'public',
      table,
      filter,
    };

    const channel = this.supabase.channel(channelName);

    // Use type assertion to handle Supabase's strict typing
    (channel as any).on(
      'postgres_changes',
      channelConfig,
      (payload: {
        eventType: string;
        table: string;
        schema: string;
        old: Record<string, unknown>;
        new: Record<string, unknown>;
        commit_timestamp: string;
      }) => {
        callback({
          eventType: payload.eventType as RealtimeEvent,
          table: payload.table,
          schema: payload.schema,
          old: (payload.old as T) || null,
          new: (payload.new as T) || null,
          commitTimestamp: payload.commit_timestamp,
        });
      },
    );

    channel.subscribe();

    this.channels.set(channelName, channel);

    return {
      channel,
      unsubscribe: () => {
        channel.unsubscribe();
        this.channels.delete(channelName);
      },
    };
  }

  /**
   * Subscribe to tee time changes for a specific tenant
   */
  subscribeToTeeTimes(
    tenantId: string,
    callback: (payload: TableChangePayload) => void,
  ): ChannelSubscription {
    return this.subscribeToTable(
      'tee_times',
      '*',
      callback,
      `tenant_id=eq.${tenantId}`,
    );
  }

  /**
   * Subscribe to tee time changes for a specific date
   */
  subscribeToTeeTimesForDate(
    tenantId: string,
    date: string,
    callback: (payload: TableChangePayload) => void,
  ): ChannelSubscription {
    return this.subscribeToTable(
      'tee_times',
      '*',
      callback,
      `tenant_id=eq.${tenantId},tee_date=eq.${date}`,
    );
  }

  /**
   * Subscribe to member changes for a specific tenant
   */
  subscribeToMembers(
    tenantId: string,
    callback: (payload: TableChangePayload) => void,
  ): ChannelSubscription {
    return this.subscribeToTable(
      'members',
      '*',
      callback,
      `tenant_id=eq.${tenantId}`,
    );
  }

  /**
   * Subscribe to invoice changes for a specific tenant
   */
  subscribeToInvoices(
    tenantId: string,
    callback: (payload: TableChangePayload) => void,
  ): ChannelSubscription {
    return this.subscribeToTable(
      'invoices',
      '*',
      callback,
      `tenant_id=eq.${tenantId}`,
    );
  }

  /**
   * Subscribe to payment changes for a specific tenant
   */
  subscribeToPayments(
    tenantId: string,
    callback: (payload: TableChangePayload) => void,
  ): ChannelSubscription {
    return this.subscribeToTable(
      'payments',
      '*',
      callback,
      `tenant_id=eq.${tenantId}`,
    );
  }

  /**
   * Create a broadcast channel for custom events
   */
  createBroadcastChannel(
    channelName: string,
    onMessage: (event: string, payload: Record<string, unknown>) => void,
  ): ChannelSubscription {
    const channel = this.supabase
      .channel(channelName)
      .on('broadcast', { event: '*' }, ({ event, payload }) => {
        onMessage(event, payload as Record<string, unknown>);
      })
      .subscribe();

    this.channels.set(channelName, channel);

    return {
      channel,
      unsubscribe: () => {
        channel.unsubscribe();
        this.channels.delete(channelName);
      },
    };
  }

  /**
   * Broadcast a message to a channel
   */
  async broadcast(
    channelName: string,
    event: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    let channel = this.channels.get(channelName);

    if (!channel) {
      channel = this.supabase.channel(channelName);
      await channel.subscribe();
      this.channels.set(channelName, channel);
    }

    await channel.send({
      type: 'broadcast',
      event,
      payload,
    });
  }

  /**
   * Create a presence channel for tracking online users
   */
  createPresenceChannel(
    channelName: string,
    onSync: (state: Record<string, unknown[]>) => void,
    onJoin: (key: string, currentPresences: unknown[], newPresences: unknown[]) => void,
    onLeave: (key: string, currentPresences: unknown[], leftPresences: unknown[]) => void,
  ): ChannelSubscription {
    const channel = this.supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        onSync(state);
      })
      .on('presence', { event: 'join' }, ({ key, currentPresences, newPresences }) => {
        onJoin(key, currentPresences, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, currentPresences, leftPresences }) => {
        onLeave(key, currentPresences, leftPresences);
      })
      .subscribe();

    this.channels.set(channelName, channel);

    return {
      channel,
      unsubscribe: () => {
        channel.unsubscribe();
        this.channels.delete(channelName);
      },
    };
  }

  /**
   * Track user presence
   */
  async trackPresence(
    channelName: string,
    userInfo: Record<string, unknown>,
  ): Promise<void> {
    let channel = this.channels.get(channelName);

    if (!channel) {
      channel = this.supabase.channel(channelName);
      await channel.subscribe();
      this.channels.set(channelName, channel);
    }

    await channel.track(userInfo);
  }

  /**
   * Untrack user presence
   */
  async untrackPresence(channelName: string): Promise<void> {
    const channel = this.channels.get(channelName);
    if (channel) {
      await channel.untrack();
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    this.channels.forEach((channel) => {
      channel.unsubscribe();
    });
    this.channels.clear();
  }

  onModuleDestroy() {
    this.unsubscribeAll();
  }
}
