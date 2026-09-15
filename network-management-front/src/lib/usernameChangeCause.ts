export type UsernameChangeCauseTemplate =
  | "username_expired"
  | "quota_finished"
  | "subscriber_request"
  | "other";

export const USERNAME_CHANGE_CAUSE_TEMPLATES: UsernameChangeCauseTemplate[] = [
  "username_expired",
  "quota_finished",
  "subscriber_request",
  "other",
];

export function resolveUsernameChangeCause(
  template: UsernameChangeCauseTemplate,
  customText: string,
  labels: Record<UsernameChangeCauseTemplate, string>,
): string {
  if (template === "other") {
    return customText.trim();
  }
  return labels[template];
}
