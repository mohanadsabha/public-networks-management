export type StatisticsI18n = {
  title: string;
  subtitle: string;
  refresh: string;
  yearLabel: string;
  todayBadge: string;
  liveBadge: string;
  hero: {
    totalRecords: string;
    activeSubscribers: string;
    connectedSubscribers: string;
    connectedActiveSubscribers: string;
    poolAvailable: string;
  };
  overview: {
    totalRecords: string;
    totalRecordsHint: string;
    totalSubscribers: string;
    totalSubscribersHint: string;
    connectedSubscribers: string;
    connectedSubscribersHint: string;
    connectedUnavailableHint: string;
    connectedActiveSubscribersHint: string;
    availableUsernames: string;
    availableUsernamesHint: string;
    expiringSoon: string;
    expiringSoonHint: string;
    expired: string;
    expiredHint: string;
    stopped: string;
    stoppedHint: string;
    customersOnly: string;
    customersOnlyHint: string;
  };
  lifecycle: {
    sectionTitle: string;
    sectionSubtitle: string;
    total: string;
    new: string;
    active: string;
    disabled: string;
    suspended: string;
  };
  customers: {
    sectionTitle: string;
    sectionSubtitle: string;
    customer: string;
    subscriber: string;
    expiring: string;
    stopped: string;
  };
  activity: {
    sectionTitle: string;
    sectionSubtitle: string;
    newSubscribers: string;
    usernamesAdded: string;
    speedChanges: string;
    usernameChanges: string;
    thisMonth: string;
  };
  charts: {
    statusDonut: string;
    statusDonutSub: string;
    monthlyTrend: string;
    monthlyTrendSub: string;
    monthlyBars: string;
    monthlyBarsSub: string;
    subscribersBySpeed: string;
    subscribersBySpeedSub: string;
    availableBySpeed: string;
    availableBySpeedSub: string;
    dailyNew: string;
    dailyNewSub: string;
    dailyAvailable: string;
    dailyAvailableSub: string;
    facilityTypes: string;
    facilityTypesSub: string;
    customerKinds: string;
    customerKindsSub: string;
    poolBreakdown: string;
    poolBreakdownSub: string;
    status_new: string;
    status_active: string;
    status_disabled: string;
    status_suspended: string;
    days_full: string;
    days_half: string;
    days_quarter: string;
    days_low: string;
  };
  recent: {
    newSubscribersTitle: string;
    newSubscribersSub: string;
    emptyNewForDay: string;
    usernameChangesTitle: string;
    usernameChangesSub: string;
    emptyNew: string;
    emptyChanges: string;
    emptyChangesForDay: string;
    previousDay: string;
    nextDay: string;
    today: string;
    yesterday: string;
    name: string;
    lineId: string;
    username: string;
    phone: string;
    oldUsername: string;
    currentUsername: string;
    addedAt: string;
    addedAtShort: string;
    changedAt: string;
    changedAtShort: string;
  };
  links: {
    viewExpiring: string;
    viewStopped: string;
    viewCustomers: string;
    viewSubscribers: string;
  };
};

export const statisticsEn: StatisticsI18n = {
  title: "Statistics",
  subtitle: "A detailed overview of customers, subscribers, usernames, and subscription health.",
  refresh: "Refresh",
  yearLabel: "Year",
  todayBadge: "Today",
  liveBadge: "Live data",
  hero: {
    totalRecords: "Registry",
    activeSubscribers: "Active",
    connectedSubscribers: "Connected",
    connectedActiveSubscribers: "{{count}} connected",
    poolAvailable: "Pool",
  },
  overview: {
    totalRecords: "Total customers",
    totalRecordsHint: "Everyone in the registry",
    totalSubscribers: "Active subscribers",
    totalSubscribersHint: "Not stopped — includes expiring; never below connected count",
    connectedSubscribers: "Connected now",
    connectedSubscribersHint: "Live PPP sessions on MikroTik (same as Online Users page)",
    connectedUnavailableHint: "Live sessions unavailable",
    connectedActiveSubscribersHint: "{{count}} connected now",
    availableUsernames: "Available usernames",
    availableUsernamesHint: "Ready in the pool",
    expiringSoon: "Expiring soon",
    expiringSoonHint: "Within 7 days",
    expired: "Expired",
    expiredHint: "Needs renewal",
    stopped: "Canceled",
    stoppedHint: "Canceled subscriptions",
    customersOnly: "Customers only",
    customersOnlyHint: "No username yet",
  },
  lifecycle: {
    sectionTitle: "Subscription summary",
    sectionSubtitle: "Current status breakdown — share of all records",
    total: "Total subscriptions",
    new: "New this month",
    active: "Active",
    disabled: "Expiring / expired",
    suspended: "Canceled subscriptions",
  },
  customers: {
    sectionTitle: "Customer types",
    sectionSubtitle: "How records are distributed across lifecycle stages",
    customer: "Customer only",
    subscriber: "Active subscriber",
    expiring: "Expiring window",
    stopped: "Canceled subscriptions",
  },
  activity: {
    sectionTitle: "This week",
    sectionSubtitle: "Saturday → Friday activity",
    newSubscribers: "New subscribers",
    usernamesAdded: "Usernames added",
    speedChanges: "Speed changes",
    usernameChanges: "Username changes",
    thisMonth: "{{count}} new this month",
  },
  charts: {
    statusDonut: "Status distribution",
    statusDonutSub: "Share of current subscription states",
    monthlyTrend: "Monthly trend",
    monthlyTrendSub: "New, active, expiring, and stopped — {{year}}",
    monthlyBars: "Monthly comparison",
    monthlyBarsSub: "Stacked view for the selected year",
    subscribersBySpeed: "Subscribers by speed",
    subscribersBySpeedSub: "Active subscriptions per tier",
    availableBySpeed: "Pool by speed",
    availableBySpeedSub: "Available usernames per tier",
    dailyNew: "New subscribers (7 days)",
    dailyNewSub: "Daily sign-ups",
    dailyAvailable: "Usernames added (7 days)",
    dailyAvailableSub: "New pool entries per day",
    facilityTypes: "Facility types",
    facilityTypesSub: "Top facility categories",
    customerKinds: "Lifecycle mix",
    customerKindsSub: "Customers, subscribers, expiring, stopped",
    poolBreakdown: "Username pool health",
    poolBreakdownSub: "Remaining cooldown days by speed",
    status_new: "New",
    status_active: "Active",
    status_disabled: "Expiring / expired",
    status_suspended: "Stopped",
    days_full: "30+ days",
    days_half: "15–29 days",
    days_quarter: "7–14 days",
    days_low: "Under 7 days",
  },
  recent: {
    newSubscribersTitle: "New customers",
    newSubscribersSub: "Pick a day from the last week",
    emptyNewForDay: "No customers added on {{date}}",
    previousDay: "Previous day",
    nextDay: "Next day",
    usernameChangesTitle: "Username changes",
    usernameChangesSub: "Browse by day",
    emptyNew: "No new customers today",
    emptyChanges: "No username changes today",
    emptyChangesForDay: "No changes on {{date}}",
    today: "Today",
    yesterday: "Yesterday",
    name: "Name",
    lineId: "Line ID",
    username: "Username",
    phone: "Phone",
    oldUsername: "Previous",
    currentUsername: "Current",
    addedAt: "Added",
    addedAtShort: "Time",
    changedAt: "Changed",
    changedAtShort: "Time",
  },
  links: {
    viewExpiring: "Expiring list",
    viewStopped: "Canceled list",
    viewCustomers: "All customers",
    viewSubscribers: "Subscribers",
  },
};

export const statisticsAr: StatisticsI18n = {
  title: "الاحصائيات",
  subtitle: "نظرة شاملة على الزبائن والمشتركين وأسماء المستخدمين وصحة الاشتراكات.",
  refresh: "تحديث",
  yearLabel: "السنة",
  todayBadge: "اليوم",
  liveBadge: "بيانات مباشرة",
  hero: {
    totalRecords: "السجل",
    activeSubscribers: "فعال",
    connectedSubscribers: "متصلين",
    connectedActiveSubscribers: "{{count}} متصل",
    poolAvailable: "المخزون",
  },
  overview: {
    totalRecords: "إجمالي الزبائن",
    totalRecordsHint: "كل السجلات في النظام",
    totalSubscribers: "المشتركين الفعالين",
    totalSubscribersHint: "غير موقوفين — يشمل قرب الانتهاء؛ لا يقل عن المتصلين",
    connectedSubscribers: "المتصلين الآن",
    connectedSubscribersHint: "جلسات PPP المباشرة على MikroTik (نفس صفحة المتصلين)",
    connectedUnavailableHint: "جلسات MikroTik غير متاحة",
    connectedActiveSubscribersHint: "{{count}} متصل حالياً",
    availableUsernames: "أسماء متاحة",
    availableUsernamesHint: "جاهزة في المخزون",
    expiringSoon: "تنتهي قريباً",
    expiringSoonHint: "خلال 7 أيام",
    expired: "منتهية",
    expiredHint: "تحتاج تجديد",
    stopped: "اشتراكات ملغية",
    stoppedHint: "اشتراكات أُلغيت",
    customersOnly: "زبائن فقط",
    customersOnlyHint: "بدون اسم مستخدم بعد",
  },
  lifecycle: {
    sectionTitle: "ملخص الاشتراكات",
    sectionSubtitle: "توزيع الحالات الحالية — نسبة من إجمالي السجلات",
    total: "إجمالي الاشتراكات",
    new: "جديد هذا الشهر",
    active: "فعال",
    disabled: "منتهية / قريبة",
    suspended: "اشتراكات ملغية",
  },
  customers: {
    sectionTitle: "أنواع الزبائن",
    sectionSubtitle: "توزيع السجلات حسب مرحلة الاشتراك",
    customer: "زبون فقط",
    subscriber: "مشترك فعال",
    expiring: "نافذة الانتهاء",
    stopped: "اشتراكات ملغية",
  },
  activity: {
    sectionTitle: "هذا الأسبوع",
    sectionSubtitle: "نشاط من السبت إلى الجمعة",
    newSubscribers: "مشتركين جدد",
    usernamesAdded: "أسماء مضافة",
    speedChanges: "تغييرات سرعة",
    usernameChanges: "تغييرات أسماء",
    thisMonth: "{{count}} جديد هذا الشهر",
  },
  charts: {
    statusDonut: "توزيع الحالات",
    statusDonutSub: "حصة كل حالة اشتراك",
    monthlyTrend: "الاتجاه الشهري",
    monthlyTrendSub: "جديد، فعال، منتهي، واشتراكات ملغية — {{year}}",
    monthlyBars: "مقارنة شهرية",
    monthlyBarsSub: "عرض مكدس للسنة المختارة",
    subscribersBySpeed: "المشتركين حسب السرعة",
    subscribersBySpeedSub: "اشتراكات فعالة لكل سرعة",
    availableBySpeed: "المخزون حسب السرعة",
    availableBySpeedSub: "أسماء متاحة لكل سرعة",
    dailyNew: "مشتركين جدد (7 أيام)",
    dailyNewSub: "تسجيلات يومية",
    dailyAvailable: "أسماء مضافة (7 أيام)",
    dailyAvailableSub: "إدخالات جديدة يومياً",
    facilityTypes: "أنواع المنشآت",
    facilityTypesSub: "أكثر التصنيفات شيوعاً",
    customerKinds: "مزيج دورة الحياة",
    customerKindsSub: "زبائن، مشتركين، منتهية، والمتوقفين",
    poolBreakdown: "الاسماء المتاحة حسب السرعة",
    poolBreakdownSub: "أيام التجميد المتبقية حسب السرعة",
    status_new: "جديد",
    status_active: "فعال",
    status_disabled: "منتهية / قريبة",
    status_suspended: "اشتراكات ملغية",
    days_full: "30+ يوم",
    days_half: "15–29 يوم",
    days_quarter: "7–14 يوم",
    days_low: "أقل من 7 أيام",
  },
  recent: {
    newSubscribersTitle: "زبائن جدد",
    newSubscribersSub: "تصفح حسب اليوم",
    emptyNewForDay: "لا إضافات في {{date}}",
    previousDay: "اليوم السابق",
    nextDay: "اليوم التالي",
    usernameChangesTitle: "تغييرات الأسماء",
    usernameChangesSub: "تصفح حسب اليوم",
    emptyNew: "لا إضافات اليوم",
    emptyChanges: "لا تغييرات أسماء اليوم",
    emptyChangesForDay: "لا تغييرات في {{date}}",
    today: "اليوم",
    yesterday: "أمس",
    name: "الاسم",
    lineId: "رقم الخط",
    username: "اسم المستخدم",
    phone: "الهاتف",
    oldUsername: "السابق",
    currentUsername: "الحالي",
    addedAt: "تاريخ الإضافة",
    addedAtShort: "الوقت",
    changedAt: "تاريخ التغيير",
    changedAtShort: "الوقت",
  },
  links: {
    viewExpiring: "قائمة المنتهية",
    viewStopped: "قائمة اشتراكات ملغية",
    viewCustomers: "كل الزبائن",
    viewSubscribers: "المشتركين",
  },
};
