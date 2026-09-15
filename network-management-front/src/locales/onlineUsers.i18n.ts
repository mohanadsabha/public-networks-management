export type OnlineUsersI18n = {
  title: string;
  subtitle: string;
  liveCount: string;
  syncing: string;
  refresh: string;
  lastUpdated: string;
  mikrotikError: string;
  notConfigured: string;
  vpnDisabled: string;
  filters: {
    search: string;
    searchPlaceholder: string;
    sharedConnections: string;
    groupAll: string;
    sharedLineChip: string;
    activeLine: string;
    clearGroup: string;
    withoutSubscriber: string;
    withoutSubscriberHint: string;
  };
  table: {
    sectionSubtitle: string;
    index: string;
    username: string;
    fullName: string;
    packageLine: string;
    lineNumber: string;
    ipAddress: string;
    router: string;
    remotePort: string;
    remoteOff: string;
    uptime: string;
    status: string;
    updatedAt: string;
    online: string;
    empty: string;
    emptyHint: string;
    noResults: string;
    noResultsWithoutSubscriber: string;
    openProfile: string;
    filterSameLine: string;
    sameLineAction: string;
    noSubscriberBadge: string;
  };
};

export const onlineUsersEn: OnlineUsersI18n = {
  title: "Online users",
  subtitle: "PPPoE sessions active on MikroTik — use refresh to load the latest snapshot.",
  liveCount: "{{count}} connected",
  syncing: "Syncing…",
  refresh: "Refresh now",
  lastUpdated: "Router snapshot",
  mikrotikError: "Could not reach MikroTik. Check server settings and network.",
  notConfigured: "MikroTik is not configured on the server (MIKROTIK_HOST / USERNAME / PASSWORD).",
  vpnDisabled: "Live MikroTik data is off. Set VITE_VPN_LIVE=true (and VPN_ENABLED=true on the API server) to load online users.",
  filters: {
    search: "Search",
    searchPlaceholder: "Username, subscriber name, IP, line number…",
    sharedConnections: "Shared line",
    groupAll: "All",
    sharedLineChip: "Line {{line}}",
    activeLine: "Showing users on line {{line}} · {{count}} connected",
    clearGroup: "Clear filter",
    withoutSubscriber: "Without subscriber",
    withoutSubscriberHint: "Sessions not linked to a registered subscriber",
  },
  table: {
    sectionSubtitle: "{{count}} shown",
    index: "#",
    username: "Username",
    fullName: "Subscriber name",
    packageLine: "Line",
    lineNumber: "Line {{line}}",
    ipAddress: "IP address",
    router: "Router",
    remotePort: "Remote",
    remoteOff: "Remote off",
    uptime: "Uptime",
    status: "Status",
    updatedAt: "Updated",
    online: "Online",
    empty: "No one is connected right now",
    emptyHint: "When subscribers connect via PPPoE they will appear here.",
    noResults: "No matches for your search",
    noResultsWithoutSubscriber: "All connected sessions are linked to subscribers",
    openProfile: "Open subscriber profile",
    filterSameLine: "Show others on the same line",
    sameLineAction: "Same line ({{line}})",
    noSubscriberBadge: "No subscriber",
  },
};

export const onlineUsersAr: OnlineUsersI18n = {
  title: "المتصلين",
  subtitle: "جلسات PPPoE النشطة على MikroTik — استخدم «تحديث الآن» لجلب أحدث البيانات.",
  liveCount: "{{count}} متصل",
  syncing: "جاري التحديث…",
  refresh: "تحديث الآن",
  lastUpdated: "لقطة من الراوتر",
  mikrotikError: "تعذّر الاتصال بـ MikroTik. تحقق من إعدادات الخادم والشبكة.",
  notConfigured: "لم يُضبط MikroTik على الخادم (MIKROTIK_HOST / USERNAME / PASSWORD).",
  vpnDisabled: "بيانات MikroTik المباشرة متوقفة. فعّل VITE_VPN_LIVE=true (وVPN_ENABLED=true على الخادم) لعرض المتصلين.",
  filters: {
    search: "بحث",
    searchPlaceholder: "اسم مستخدم، اسم مشترك، IP، رقم الخط…",
    sharedConnections: "خط مشترك",
    groupAll: "الكل",
    sharedLineChip: "خط {{line}}",
    activeLine: "عرض المتصلين على الخط {{line}} · {{count}} متصل",
    clearGroup: "إلغاء الفلتر",
    withoutSubscriber: "بدون مشترك",
    withoutSubscriberHint: "جلسات غير مرتبطة بمشترك مسجّل",
  },
  table: {
    sectionSubtitle: "{{count}} معروض",
    index: "#",
    username: "اسم المستخدم",
    fullName: "اسم المشترك",
    packageLine: "الخط",
    lineNumber: "خط {{line}}",
    ipAddress: "عنوان IP",
    router: "الراوتر",
    remotePort: "ريموت",
    remoteOff: "الريموت معطّل",
    uptime: "مدة الاتصال",
    status: "الحالة",
    updatedAt: "آخر تحديث",
    online: "متصل",
    empty: "لا يوجد متصلون حالياً",
    emptyHint: "عند اتصال المشتركين عبر PPPoE ستظهر أسماؤهم هنا.",
    noResults: "لا توجد نتائج للبحث",
    noResultsWithoutSubscriber: "كل الجلسات المتصلة مرتبطة بمشتركين",
    openProfile: "فتح ملف المشترك",
    filterSameLine: "عرض الآخرين على نفس الخط",
    sameLineAction: "نفس الخط ({{line}})",
    noSubscriberBadge: "بدون مشترك",
  },
};
