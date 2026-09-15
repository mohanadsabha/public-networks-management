export type ExpiringI18n = {
  title: string;
  subtitle: string;
  filters: {
    label: string;
    all: string;
    expired: string;
    oneDay: string;
    twoDays: string;
    soon: string;
  };
  urgency: {
    expired: string;
    oneDay: string;
    twoDays: string;
    soon: string;
  };
  table: {
    sectionSubtitle: string;
    selectAll: string;
    exportSelected: string;
    exportSelectedCount: string;
    exportAllCount: string;
    exportSuccess: string;
    exportEmpty: string;
    subscriber: string;
    lineId: string;
    fullName: string;
    username: string;
    phone: string;
    disconnectDate: string;
    timeLeft: string;
    daysLeft: string;
    daysLeftExpired: string;
    daysLeftToday: string;
    daysLeftTomorrow: string;
    hoursLeft: string;
    minutesLeft: string;
    urgency: string;
    actions: string;
    empty: string;
    emptyHint: string;
    openProfile: string;
  };
};

export const expiringEn: ExpiringI18n = {
  title: "Expiring",
  subtitle:
    "Subscriptions whose cycle ended or will end soon. Renew or follow up before the username is released.",
  filters: {
    label: "Status",
    all: "All",
    expired: "Expired",
    oneDay: "1 day left",
    twoDays: "2 days left",
    soon: "Soon (3–7 days)",
  },
  urgency: {
    expired: "Expired",
    oneDay: "1 day",
    twoDays: "2 days",
    soon: "Soon",
  },
  table: {
    sectionSubtitle: "{{count}} shown",
    selectAll: "Select all",
    exportSelected: "Export Excel",
    exportSelectedCount: "Export {{count}} selected",
    exportAllCount: "Export all ({{count}})",
    exportSuccess: "Excel file downloaded",
    exportEmpty: "No subscribers to export",
    subscriber: "Subscriber",
    lineId: "Line ID",
    fullName: "Name",
    username: "Username",
    phone: "Phone",
    disconnectDate: "Disconnect date",
    timeLeft: "Time left",
    daysLeft: "{{days}} days left",
    daysLeftExpired: "Expired {{days}} days ago",
    daysLeftToday: "Expires today",
    daysLeftTomorrow: "Tomorrow",
    hoursLeft: "{{hours}} hours left",
    minutesLeft: "{{minutes}} min left",
    urgency: "Status",
    actions: "Actions",
    empty: "No subscriptions match this filter",
    emptyHint: "Try another filter or clear the search.",
    openProfile: "Open profile",
  },
};

export const expiringAr: ExpiringI18n = {
  title: "المنتهية",
  subtitle: "اشتراكات انتهت دورتها أو ستنتهي قريباً. جدّد أو تابع قبل إعادة اسم المستخدم للمجموعة.",
  filters: {
    label: "الحالة",
    all: "الكل",
    expired: "منتهي",
    oneDay: "يوم واحد",
    twoDays: "يومان",
    soon: "قريباً (3–7 أيام)",
  },
  urgency: {
    expired: "منتهي",
    oneDay: "يوم واحد",
    twoDays: "يومان",
    soon: "قريباً",
  },
  table: {
    sectionSubtitle: "{{count}} ظاهر",
    selectAll: "تحديد الكل",
    exportSelected: "تصدير Excel",
    exportSelectedCount: "تصدير {{count}} محدد",
    exportAllCount: "تصدير الكل ({{count}})",
    exportSuccess: "تم تنزيل ملف Excel",
    exportEmpty: "لا يوجد مشتركون للتصدير",
    subscriber: "المشترك",
    lineId: "رقم الخط",
    fullName: "الاسم",
    username: "اسم المستخدم",
    phone: "الهاتف",
    disconnectDate: "تاريخ الانقطاع",
    timeLeft: "الوقت المتبقي",
    daysLeft: "متبقي {{days}} يوم",
    daysLeftExpired: "منتهي منذ {{days}} يوم",
    daysLeftToday: "ينتهي اليوم",
    daysLeftTomorrow: "غداً",
    hoursLeft: "باقي {{hours}} ساعة",
    minutesLeft: "باقي {{minutes}} دقيقة",
    urgency: "الحالة",
    actions: "إجراءات",
    empty: "لا توجد اشتراكات لهذا الفلتر",
    emptyHint: "جرّب فلتراً آخر أو امسح البحث.",
    openProfile: "فتح الملف",
  },
};
