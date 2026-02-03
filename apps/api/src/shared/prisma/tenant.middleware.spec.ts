import {
  getCurrentTenantId,
  shouldBypassTenantFilter,
  withTenantContext,
} from './tenant.middleware';

describe('Tenant Middleware', () => {
  describe('tenantContext (AsyncLocalStorage)', () => {
    it('should return undefined when no context is set', () => {
      expect(getCurrentTenantId()).toBeUndefined();
    });

    it('should return tenantId within context', async () => {
      await withTenantContext('tenant-123', async () => {
        expect(getCurrentTenantId()).toBe('tenant-123');
      });
    });

    it('should not leak context between calls', async () => {
      await withTenantContext('tenant-a', async () => {
        expect(getCurrentTenantId()).toBe('tenant-a');
      });

      await withTenantContext('tenant-b', async () => {
        expect(getCurrentTenantId()).toBe('tenant-b');
      });

      expect(getCurrentTenantId()).toBeUndefined();
    });
  });

  describe('shouldBypassTenantFilter', () => {
    it('should return false when no context is set', () => {
      expect(shouldBypassTenantFilter()).toBe(false);
    });

    it('should return false by default', async () => {
      await withTenantContext('tenant-123', async () => {
        expect(shouldBypassTenantFilter()).toBe(false);
      });
    });

    it('should return true when bypass is enabled', async () => {
      await withTenantContext('tenant-123', async () => {
        expect(shouldBypassTenantFilter()).toBe(false);
      }, false);

      await withTenantContext('tenant-123', async () => {
        expect(shouldBypassTenantFilter()).toBe(true);
      }, true);
    });
  });

  describe('nested tenant contexts', () => {
    it('should maintain isolation in nested contexts', async () => {
      await withTenantContext('outer-tenant', async () => {
        expect(getCurrentTenantId()).toBe('outer-tenant');

        await withTenantContext('inner-tenant', async () => {
          expect(getCurrentTenantId()).toBe('inner-tenant');
        });

        // After inner context ends, outer should be restored
        expect(getCurrentTenantId()).toBe('outer-tenant');
      });

      expect(getCurrentTenantId()).toBeUndefined();
    });
  });

  describe('withTenantContext return value', () => {
    it('should return the result of the callback', async () => {
      const result = await withTenantContext('tenant-123', async () => {
        return { data: 'test', count: 42 };
      });

      expect(result).toEqual({ data: 'test', count: 42 });
    });

    it('should propagate errors from callback', async () => {
      await expect(
        withTenantContext('tenant-123', async () => {
          throw new Error('Test error');
        }),
      ).rejects.toThrow('Test error');
    });
  });
});
