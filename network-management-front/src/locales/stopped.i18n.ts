export type StoppedI18n = {
  title: string;
  subtitle: string;
  table: {
    sectionSubtitle: string;
    subscriber: string;
    lineId: string;
    fullName: string;
    phone: string;
    balance: string;
    stoppedAt: string;
    owesBalance: string;
    balanceCleared: string;
    actions: string;
    empty: string;
    emptyHint: string;
    openCustomer: string;
    openProfile: string;
  };
  actions: {
    restore: string;
    restoreSuccess: string;
  };
};

export const stoppedEn: StoppedI18n = {
  title: "Canceled",
  subtitle:
    "Subscribers who canceled their subscription. Username returned to the available pool. Customer record remains for balance.",
  table: {
    sectionSubtitle: "{{count}} canceled",
    subscriber: "Customer",
    lineId: "Line ID",
    fullName: "Name",
    phone: "Phone",
    balance: "Balance",
    stoppedAt: "Canceled on",
    owesBalance: "Outstanding balance",
    balanceCleared: "No debt — can assign username",
    actions: "Actions",
    empty: "No canceled subscribers",
    emptyHint: "Canceled subscriptions appear here after a subscriber ends their active plan.",
    openCustomer: "Customer file",
    openProfile: "Open profile",
  },
  actions: {
    restore: "Reactivate",
    restoreSuccess: "Reactivated (mock)",
  },
};

export const stoppedAr: StoppedI18n = {
  title: "اشتراكات ملغية",
  subtitle:
    "مشتركون أُلغي اشتراكهم. أُعيد اسم المستخدم للمجموعة. يبقى ملف الزبون للرصيد.",
  table: {
    sectionSubtitle: "{{count}} اشتراك ملغي",
    subscriber: "الزبون",
    lineId: "رقم الخط",
    fullName: "الاسم",
    phone: "الهاتف",
    balance: "الرصيد",
    stoppedAt: "تاريخ الإلغاء",
    owesBalance: "رصيد مستحق",
    balanceCleared: "لا دين — يمكن تعيين اسم مستخدم",
    actions: "إجراءات",
    empty: "لا توجد اشتراكات ملغية",
    emptyHint: "تظهر هنا بعد إلغاء اشتراك نشط.",
    openCustomer: "ملف الزبون",
    openProfile: "فتح الملف",
  },
  actions: {
    restore: "إعادة تفعيل",
    restoreSuccess: "تمت إعادة التفعيل (تجريبي)",
  },
};
