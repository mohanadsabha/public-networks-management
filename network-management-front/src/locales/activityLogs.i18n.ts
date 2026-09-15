export type ActivityLogsI18n = {
  title: string;
  subtitle: string;
  mockHint: string;
  filters: {
    search: string;
    searchPlaceholder: string;
  };
  actions: {
    Created: string;
    Updated: string;
    Deleted: string;
  };
  subjectTypes: {
    Subscriber: string;
    Customer: string;
    Username: string;
    Speed: string;
    Invoice: string;
    Role: string;
    "Admin User": string;
    Mikrotik: string;
    SMS: string;
    Support: string;
    "Card Group": string;
    "Group Bandwidth Scheduler": string;
    Router: string;
    Other: string;
  };
  table: {
    sectionSubtitle: string;
    empty: string;
    emptyHint: string;
    noResults: string;
    date: string;
    activityEvent: string;
    subjectType: string;
    subjectName: string;
    userName: string;
    ip: string;
    details: string;
  };
  notConfigured: string;
};

export const activityLogsEn: ActivityLogsI18n = {
  title: "Activity log",
  subtitle: "Who changed what, on which record, and from which IP.",
  mockHint: "Mock data — set VITE_USE_ACTIVITY_LOGS_MOCK=true only for offline UI review.",
  filters: {
    search: "Search",
    searchPlaceholder: "Subject, user, endpoint, details…",
  },
  actions: {
    Created: "Created",
    Updated: "Updated",
    Deleted: "Deleted",
  },
  subjectTypes: {
    Subscriber: "Subscriber",
    Customer: "Customer",
    Username: "Username",
    Speed: "Speed",
    Invoice: "Invoice",
    Role: "Role",
    "Admin User": "Admin user",
    Mikrotik: "MikroTik",
    SMS: "SMS",
    Support: "Support",
    "Card Group": "Card group",
    "Group Bandwidth Scheduler": "Group bandwidth scheduler",
    Router: "Router",
    Other: "Other",
  },
  table: {
    sectionSubtitle: "{{count}} entries on this page",
    empty: "No activity recorded yet",
    emptyHint: "Actions appear here when admins change data in the system.",
    noResults: "No logs match your search",
    date: "Date",
    activityEvent: "Activity event",
    subjectType: "Subject type",
    subjectName: "Subject name",
    userName: "User name",
    ip: "IP",
    details: "Details",
  },
  notConfigured: "Activity log API is not available yet.",
};

export const activityLogsAr: ActivityLogsI18n = {
  title: "سجل العمليات",
  subtitle: "من غيّر ماذا، على أي سجل، ومن أي IP.",
  mockHint: "بيانات تجريبية — استخدم VITE_USE_ACTIVITY_LOGS_MOCK=true للمراجعة بدون خادم فقط.",
  filters: {
    search: "بحث",
    searchPlaceholder: "اسم السجل، المستخدم، المسار، التفاصيل…",
  },
  actions: {
    Created: "إنشاء",
    Updated: "تحديث",
    Deleted: "حذف",
  },
  subjectTypes: {
    Subscriber: "مشترك",
    Customer: "زبون",
    Username: "اسم مستخدم",
    Speed: "سرعة",
    Invoice: "فاتورة",
    Role: "دور",
    "Admin User": "مستخدم نظام",
    Mikrotik: "ميكروتيك",
    SMS: "رسائل",
    Support: "دعم",
    "Card Group": "مجموعة بطاقات",
    "Group Bandwidth Scheduler": "جدولة عرض النطاق",
    Router: "راوتر",
    Other: "أخرى",
  },
  table: {
    sectionSubtitle: "{{count}} سجل في هذه الصفحة",
    empty: "لا يوجد نشاط مسجّل بعد",
    emptyHint: "ستظهر الإجراءات هنا عند تعديل البيانات في النظام.",
    noResults: "لا توجد سجلات مطابقة للبحث",
    date: "التاريخ",
    activityEvent: "الحدث",
    subjectType: "نوع السجل",
    subjectName: "اسم السجل",
    userName: "المستخدم",
    ip: "IP",
    details: "التفاصيل",
  },
  notConfigured: "واجهة سجل العمليات غير متاحة بعد.",
};
