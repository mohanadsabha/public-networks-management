import { FileSpreadsheet, History, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ExcelHubItem {
  titleKey: string;
  descriptionKey: string;
  to: string;
  icon: LucideIcon;
}

export const excelHubItems: ExcelHubItem[] = [
  {
    titleKey: "settings.excel.hub.availableUsernames.title",
    descriptionKey: "settings.excel.hub.availableUsernames.description",
    to: "/settings/excel/available-usernames",
    icon: FileSpreadsheet,
  },
  {
    titleKey: "settings.excel.hub.subscribers.title",
    descriptionKey: "settings.excel.hub.subscribers.description",
    to: "/settings/excel/subscribers",
    icon: Users,
  },
  {
    titleKey: "settings.excel.hub.usernameHistory.title",
    descriptionKey: "settings.excel.hub.usernameHistory.description",
    to: "/settings/excel/username-history",
    icon: History,
  },
];
