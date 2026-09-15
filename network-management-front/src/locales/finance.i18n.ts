export type FinanceI18n = {
  title: string;
  subtitle: string;
  refresh: string;
  thisMonth: string;
  kpi: {
    monthlyRevenue: string;
    monthlyRevenueSub: string;
    weeklyRevenue: string;
    weeklyRevenueSub: string;
    newMonthBilled: string;
    newMonthBilledSub: string;
  };
  debtors: {
    title: string;
    subtitle: string;
    totalOwed: string;
    customer: string;
    lineId: string;
    type: string;
    phone: string;
    amountOwed: string;
    actions: string;
    recordPayment: string;
    empty: string;
    emptyHint: string;
  };
  charts: {
    revenueTrend: string;
    revenueTrendSub: string;
    revenueBySpeed: string;
    revenueBySpeedSub: string;
    monthlyBars: string;
    monthlyBarsSub: string;
    byMethod: string;
    byMethodSub: string;
    topSubscribers: string;
    topSubscribersSub: string;
    paidLabel: string;
    methodUnset: string;
    invoiceCount: string;
  };
  topTable: {
    name: string;
    lineId: string;
    totalPaid: string;
    invoices: string;
  };
  invoices: {
    title: string;
    subtitle: string;
    allInvoices: string;
    backToFinance: string;
    search: string;
    searchPlaceholder: string;
    count: string;
    subscriber: string;
    lineId: string;
    openProfile: string;
    empty: string;
    emptyHint: string;
    previous: string;
    next: string;
    pageOf: string;
    localPreviewBanner: string;
  };
};

export const financeEn: FinanceI18n = {
  title: "Finance",
  subtitle: "Payments, invoices, and subscription revenue — focused on the current month.",
  refresh: "Refresh",
  thisMonth: "This month",
  kpi: {
    monthlyRevenue: "Total revenue this month",
    monthlyRevenueSub: "{{count}} invoices paid",
    weeklyRevenue: "Revenue this week",
    weeklyRevenueSub: "{{count}} payments",
    newMonthBilled: "Billed this month",
    newMonthBilledSub: "{{count}} new invoices",
  },
  debtors: {
    title: "Outstanding debt",
    subtitle: "Customers who still owe money — open their file to record a payment.",
    totalOwed: "{{count}} customers · {{amount}} total",
    customer: "Customer",
    lineId: "Line ID",
    type: "Type",
    phone: "Phone",
    amountOwed: "Amount owed",
    actions: "Actions",
    recordPayment: "Record payment",
    empty: "No outstanding balances",
    emptyHint: "All customer balances are cleared.",
  },
  charts: {
    revenueTrend: "Revenue trend",
    revenueTrendSub: "Last 12 months (paid invoices)",
    revenueBySpeed: "Revenue by speed",
    revenueBySpeedSub: "This month by package",
    monthlyBars: "Monthly revenue",
    monthlyBarsSub: "Paid amounts per month",
    byMethod: "By payment method",
    byMethodSub: "All-time collected",
    topSubscribers: "Top payers",
    topSubscribersSub: "By total paid on invoices",
    paidLabel: "Paid",
    methodUnset: "Not set",
    invoiceCount: "{{count}} invoices",
  },
  topTable: {
    name: "Subscriber",
    lineId: "Line ID",
    totalPaid: "Total paid",
    invoices: "Invoices",
  },
  invoices: {
    title: "All invoices",
    subtitle: "Every payment and charge recorded for subscribers — open any row for full details.",
    allInvoices: "All invoices",
    backToFinance: "Back to finance",
    search: "Search invoices",
    searchPlaceholder: "Invoice #, line ID, name, or phone…",
    count: "{{count}} invoice(s)",
    subscriber: "Subscriber",
    lineId: "Line ID",
    openProfile: "Open subscriber invoices",
    empty: "No invoices found",
    emptyHint: "Try another search or record payments from subscriber profiles.",
    previous: "Previous",
    next: "Next",
    pageOf: "Page {{page}} of {{total}}",
    localPreviewBanner: "Invoices preview (browser storage only — not connected to server)",
  },
};

export const financeAr: FinanceI18n = {
  title: "المالية",
  subtitle: "المدفوعات والفواتير وإيرادات الاشتراكات — تركيز على الشهر الحالي.",
  refresh: "تحديث",
  thisMonth: "هذا الشهر",
  kpi: {
    monthlyRevenue: "إجمالي إيرادات الشهر",
    monthlyRevenueSub: "{{count}} فاتورة مدفوعة",
    weeklyRevenue: "إيرادات هذا الأسبوع",
    weeklyRevenueSub: "{{count}} دفعة",
    newMonthBilled: "فواتير الشهر",
    newMonthBilledSub: "{{count}} فاتورة جديدة",
  },
  debtors: {
    title: "ديون متراكمة",
    subtitle: "زبائن لا يزال عليهم مبلغ — افتح الملف لتسجيل دفعة.",
    totalOwed: "{{count}} زبون · الإجمالي {{amount}}",
    customer: "الزبون",
    lineId: "رقم الخط",
    type: "النوع",
    phone: "الهاتف",
    amountOwed: "المبلغ المستحق",
    actions: "إجراءات",
    recordPayment: "تسجيل دفعة",
    empty: "لا توجد ديون مستحقة",
    emptyHint: "جميع أرصدة الزبائن مسدّدة.",
  },
  charts: {
    revenueTrend: "اتجاه الإيرادات",
    revenueTrendSub: "آخر 12 شهراً (فواتير مدفوعة)",
    revenueBySpeed: "الإيرادات حسب السرعة",
    revenueBySpeedSub: "هذا الشهر حسب الباقة",
    monthlyBars: "الإيرادات الشهرية",
    monthlyBarsSub: "المبالغ المدفوعة لكل شهر",
    byMethod: "حسب طريقة الدفع",
    byMethodSub: "إجمالي المحصل",
    topSubscribers: "أعلى المدفوعين",
    topSubscribersSub: "حسب مجموع الفواتير",
    paidLabel: "مدفوع",
    methodUnset: "غير محدد",
    invoiceCount: "{{count}} فاتورة",
  },
  topTable: {
    name: "المشترك",
    lineId: "رقم الخط",
    totalPaid: "إجمالي المدفوع",
    invoices: "فواتير",
  },
  invoices: {
    title: "كل الفواتير",
    subtitle: "جميع المدفوعات والرسوم المسجّلة للمشتركين — افتح أي صف لعرض التفاصيل.",
    allInvoices: "كل الفواتير",
    backToFinance: "العودة للمالية",
    search: "بحث في الفواتير",
    searchPlaceholder: "رقم الفاتورة، الخط، الاسم، أو الهاتف…",
    count: "{{count}} فاتورة",
    subscriber: "المشترك",
    lineId: "رقم الخط",
    openProfile: "فتح فواتير المشترك",
    empty: "لا توجد فواتير",
    emptyHint: "جرّب بحثاً آخر أو سجّل دفعات من ملفات المشتركين.",
    previous: "السابق",
    next: "التالي",
    pageOf: "صفحة {{page}} من {{total}}",
    localPreviewBanner: "معاينة الفواتير (محفوظة في المتصفح فقط — غير مربوطة بالخادم)",
  },
};
