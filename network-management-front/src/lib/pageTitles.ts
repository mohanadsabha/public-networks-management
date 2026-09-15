/** Maps route paths to i18n keys used for `document.title` */
const ROUTE_TITLE_KEYS: Array<{ match: (path: string) => boolean; titleKey: string }> = [
  { match: (path) => path === "/", titleKey: "home.title" },
  { match: (path) => path === "/login", titleKey: "pageTitles.login" },
  { match: (path) => path === "/forgot-password", titleKey: "auth.forgotPassword.title" },
  { match: (path) => path === "/reset-password", titleKey: "auth.resetPassword.title" },
  { match: (path) => path === "/statistics", titleKey: "nav.items.statistics" },
  { match: (path) => path === "/customers/new", titleKey: "customers.titleNew" },
  { match: (path) => /^\/customers\/[^/]+$/.test(path) && path !== "/customers/new", titleKey: "customers.titleProfile" },
  { match: (path) => path.startsWith("/customers"), titleKey: "customers.title" },
  { match: (path) => path === "/subscribers/new", titleKey: "customers.titleNew" },
  {
    match: (path) =>
      /^\/subscribers\/[^/]+(\/(stats|invoices|username|sms|pricing))?$/.test(path) &&
      path !== "/subscribers/new",
    titleKey: "subscribers.titleProfile",
  },
  { match: (path) => path.startsWith("/subscribers"), titleKey: "subscribers.title" },
  { match: (path) => path === "/online-users", titleKey: "nav.items.onlineUsers" },
  { match: (path) => path === "/usage", titleKey: "usage.title" },
  { match: (path) => path === "/expiring", titleKey: "pages.expiring" },
  { match: (path) => path === "/stopped", titleKey: "nav.items.canceled" },
  { match: (path) => path === "/speeds", titleKey: "speeds.title" },
  {
    match: (path) =>
      path === "/available-usernames" || /^\/available-usernames\/\d+$/.test(path),
    titleKey: "availableUsernames.title",
  },
  {
    match: (path) => path === "/sms" || /^\/sms\/(groups|logs|templates)$/.test(path),
    titleKey: "sms.title",
  },
  { match: (path) => path === "/support", titleKey: "support.title" },
  { match: (path) => path === "/finance/invoices", titleKey: "finance.invoices.title" },
  { match: (path) => path === "/finance", titleKey: "nav.items.finance" },
  { match: (path) => path === "/users", titleKey: "pages.users" },
  { match: (path) => path === "/logs", titleKey: "nav.items.logs" },
  { match: (path) => path === "/settings/data", titleKey: "settings.data.title" },
  { match: (path) => path === "/settings/routers", titleKey: "settings.routers.title" },
  { match: (path) => path === "/settings/vpn", titleKey: "settings.vpn.pageTitle" },
  { match: (path) => path === "/settings/excel/available-usernames", titleKey: "settings.excel.availableUsernames.pageTitle" },
  { match: (path) => path === "/settings/excel/subscribers", titleKey: "settings.excel.subscribers.pageTitle" },
  { match: (path) => path === "/settings/excel/username-history", titleKey: "settings.excel.usernameHistory.pageTitle" },
  { match: (path) => path === "/settings/excel", titleKey: "settings.excel.title" },
  { match: (path) => path === "/settings", titleKey: "settings.title" },
];

const DEFAULT_TITLE_KEY = "nav.dashboard";

export function resolvePageTitleKey(pathname: string): string {
  const path = pathname.replace(/\/+$/, "") || "/";
  const entry = ROUTE_TITLE_KEYS.find(({ match }) => match(path));
  return entry?.titleKey ?? DEFAULT_TITLE_KEY;
}

export function formatDocumentTitle(pageTitle: string, appName = "WeWiFi"): string {
  return `${pageTitle} — ${appName}`;
}
