import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersService, type AdminUsersListParams } from "@/services/users.service";
import type { AdminUserFormValues, AdminUserStatus } from "@/types/adminUser";

export const adminUsersQueryKey = (params: AdminUsersListParams) =>
  ["admin-users", params] as const;

export function useAdminUsersQuery(params: AdminUsersListParams) {
  return useQuery({
    queryKey: adminUsersQueryKey(params),
    queryFn: () => usersService.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useAdminUserMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const createMutation = useMutation({
    mutationFn: (values: AdminUserFormValues) => usersService.create(values),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: Partial<AdminUserFormValues> }) =>
      usersService.update(id, values),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersService.remove(id),
    onSuccess: invalidate,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AdminUserStatus }) =>
      usersService.setStatus(id, status),
    onSuccess: invalidate,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    statusMutation,
  };
}
