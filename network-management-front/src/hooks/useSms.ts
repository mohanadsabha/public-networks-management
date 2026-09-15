import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { smsService, type SendSmsPayload } from "@/services/sms.service";
import type { SmsAudienceFilter } from "@/types/sms";

export const smsRecipientsQueryKey = (audience: SmsAudienceFilter, search: string) =>
  ["sms", "recipients", audience, search] as const;

export const smsLogsQueryKey = (page: number) => ["sms", "logs", page] as const;

export const smsTemplatesQueryKey = ["sms", "templates"] as const;

export function useSmsRecipientsQuery(
  audience: SmsAudienceFilter,
  search: string,
  enabled = true,
) {
  return useQuery({
    queryKey: smsRecipientsQueryKey(audience, search),
    queryFn: () => smsService.listRecipients(audience, search),
    enabled,
  });
}

export function useSmsLogsQuery(page = 1) {
  return useQuery({
    queryKey: smsLogsQueryKey(page),
    queryFn: () => smsService.listLogs(page),
  });
}

export function useSmsTemplatesQuery() {
  return useQuery({
    queryKey: smsTemplatesQueryKey,
    queryFn: () => smsService.listTemplates(),
  });
}

export function useSmsTemplateMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: smsTemplatesQueryKey });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; body: string }) => smsService.createTemplate(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: number; name?: string; body?: string }) =>
      smsService.updateTemplate(id, payload),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => smsService.deleteTemplate(id),
    onSuccess: invalidate,
  });

  return { createMutation, updateMutation, deleteMutation };
}

export function useSendSmsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendSmsPayload) => smsService.send(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms", "logs"] });
    },
  });
}
