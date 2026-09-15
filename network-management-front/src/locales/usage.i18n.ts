export type UsageI18n = {
  title: string;
  subtitle: string;
  refresh: string;
  summary: {
    tracked: string;
    trackedHint: string;
    over: string;
    overHint: string;
    critical: string;
    criticalHint: string;
    totalUsed: string;
    totalUsedHint: string;
  };
  filters: {
    search: string;
    searchPlaceholder: string;
    level: string;
    level_all: string;
    level_over: string;
    level_critical_up: string;
    level_high_up: string;
  };
  chart: {
    title: string;
    subtitle: string;
    usageLabel: string;
    empty: string;
    emptyHint: string;
  };
  table: {
    sectionSubtitle: string;
    rank: string;
    subscriber: string;
    lineId: string;
    speed: string;
    usage: string;
    percent: string;
    remaining: string;
    status: string;
    actions: string;
    empty: string;
    emptyHint: string;
    noResults: string;
    noLimit: string;
    openProfile: string;
  };
  level: {
    over: string;
    critical: string;
    high: string;
    normal: string;
    unknown: string;
  };
  notReady: string;
};

export const usageEn: UsageI18n = {
  title: "Data usage",
  subtitle:
    "Consumption across all active subscribers — spot heavy users and accounts near their quota at a glance.",
  refresh: "Refresh",
  summary: {
    tracked: "Tracked subscribers",
    trackedHint: "Active subscribers with a username",
    over: "Over quota",
    overHint: "Reached 100% of their limit",
    critical: "Near quota",
    criticalHint: "{{percent}}% or more used",
    totalUsed: "Total consumed",
    totalUsedHint: "Sum across tracked subscribers",
  },
  filters: {
    search: "Search",
    searchPlaceholder: "Name, line ID, username, phone…",
    level: "Usage level",
    level_all: "All",
    level_over: "Over quota",
    level_critical_up: "Near quota +",
    level_high_up: "High +",
  },
  chart: {
    title: "Top consumers",
    subtitle: "Highest data usage right now",
    usageLabel: "Usage",
    empty: "No usage recorded yet",
    emptyHint: "Usage syncs from MikroTik — it will appear here once subscribers connect.",
  },
  table: {
    sectionSubtitle: "{{count}} subscriber(s)",
    rank: "#",
    subscriber: "Subscriber",
    lineId: "Line ID",
    speed: "Speed",
    usage: "Usage / quota",
    percent: "Used %",
    remaining: "Remaining",
    status: "Status",
    actions: "Actions",
    empty: "No usage to show yet",
    emptyHint:
      "Usage is synced from MikroTik. Once subscribers connect and usage syncs, it will appear here.",
    noResults: "No subscribers match your filters",
    noLimit: "No quota",
    openProfile: "Open profile",
  },
  level: {
    over: "Over quota",
    critical: "Near quota",
    high: "High",
    normal: "Normal",
    unknown: "No quota",
  },
  notReady:
    "Usage data syncs from MikroTik. It will populate once the API server is connected to the router in production.",
};

export const usageAr: UsageI18n = {
  title: "كمية السحب",
  subtitle:
    "استهلاك جميع المشتركين النشطين — اعرف من يسحب بكثرة ومن اقترب من حد الكوتة دفعة واحدة.",
  refresh: "تحديث",
  summary: {
    tracked: "المشتركون المتابَعون",
    trackedHint: "المشتركون النشطون الذين لديهم اسم مستخدم",
    over: "تجاوزوا الكوتة",
    overHint: "وصلوا إلى 100% من الحد",
    critical: "قرب الكوتة",
    criticalHint: "استهلكوا {{percent}}% أو أكثر",
    totalUsed: "إجمالي المستهلك",
    totalUsedHint: "المجموع لكل المشتركين المتابَعين",
  },
  filters: {
    search: "بحث",
    searchPlaceholder: "اسم، رقم خط، اسم مستخدم، هاتف…",
    level: "مستوى الاستهلاك",
    level_all: "الكل",
    level_over: "تجاوز الكوتة",
    level_critical_up: "قرب الكوتة فأكثر",
    level_high_up: "مرتفع فأكثر",
  },
  chart: {
    title: "الأكثر سحبًا",
    subtitle: "أعلى استهلاك للبيانات حاليًا",
    usageLabel: "الاستهلاك",
    empty: "لا يوجد استهلاك مسجّل بعد",
    emptyHint: "تتم مزامنة الاستهلاك من MikroTik — سيظهر هنا بمجرد اتصال المشتركين.",
  },
  table: {
    sectionSubtitle: "{{count}} مشترك",
    rank: "#",
    subscriber: "المشترك",
    lineId: "رقم الخط",
    speed: "السرعة",
    usage: "الاستهلاك / الكوتة",
    percent: "النسبة %",
    remaining: "المتبقي",
    status: "الحالة",
    actions: "إجراءات",
    empty: "لا يوجد استهلاك لعرضه بعد",
    emptyHint:
      "تتم مزامنة الاستهلاك من MikroTik. سيظهر هنا بمجرد اتصال المشتركين ومزامنة الاستهلاك.",
    noResults: "لا يوجد مشتركون يطابقون الفلاتر",
    noLimit: "بلا كوتة",
    openProfile: "فتح الملف",
  },
  level: {
    over: "تجاوز الكوتة",
    critical: "قرب الكوتة",
    high: "مرتفع",
    normal: "طبيعي",
    unknown: "بلا كوتة",
  },
  notReady:
    "تتم مزامنة بيانات الاستهلاك من MikroTik. ستظهر عند ربط خادم الـ API بالراوتر في بيئة الإنتاج.",
};
