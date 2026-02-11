'use client';

import {
  useGetUsersQuery,
  useGetUserQuery,
  useGetUserActivityLogQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useLockUserMutation,
  useUnlockUserMutation,
  useDeleteUserMutation,
} from '@clubvantage/api-client/hooks';
import type { CreateUserInput, UpdateUserInput } from '@clubvantage/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useUsers(params?: {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}) {
  return useGetUsersQuery({
    search: params?.search,
    role: params?.role,
    page: params?.page,
    limit: params?.limit,
  });
}

export function useUser(id: string) {
  return useGetUserQuery({ id }, { enabled: !!id });
}

export function useUserActivityLog(params?: {
  page?: number;
  limit?: number;
}) {
  return useGetUserActivityLogQuery({
    page: params?.page,
    limit: params?.limit,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const mutation = useCreateUserMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetUsers'] });
    },
  });

  const createUser = useCallback(
    (input: CreateUserInput) => mutation.mutateAsync({ input }),
    [mutation],
  );

  return { createUser, ...mutation };
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const mutation = useUpdateUserMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetUsers'] });
      queryClient.invalidateQueries({ queryKey: ['GetUser'] });
    },
  });

  const updateUser = useCallback(
    (id: string, input: UpdateUserInput) =>
      mutation.mutateAsync({ id, input }),
    [mutation],
  );

  return { updateUser, ...mutation };
}

export function useLockUser() {
  const queryClient = useQueryClient();
  const mutation = useLockUserMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetUsers'] });
      queryClient.invalidateQueries({ queryKey: ['GetUser'] });
    },
  });

  const lockUser = useCallback(
    (id: string, minutes: number) => mutation.mutateAsync({ id, minutes }),
    [mutation],
  );

  return { lockUser, ...mutation };
}

export function useUnlockUser() {
  const queryClient = useQueryClient();
  const mutation = useUnlockUserMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetUsers'] });
      queryClient.invalidateQueries({ queryKey: ['GetUser'] });
    },
  });

  const unlockUser = useCallback(
    (id: string) => mutation.mutateAsync({ id }),
    [mutation],
  );

  return { unlockUser, ...mutation };
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const mutation = useDeleteUserMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetUsers'] });
    },
  });

  const deleteUser = useCallback(
    (id: string) => mutation.mutateAsync({ id }),
    [mutation],
  );

  return { deleteUser, ...mutation };
}
