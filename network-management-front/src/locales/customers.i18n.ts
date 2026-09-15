export type CustomersI18n = {
  title: string;
  subtitle: string;
  titleNew: string;
  titleProfile: string;
  kind: {
    customer: string;
    subscriber: string;
    stopped: string;
  };
  filters: {
    search: string;
    searchPlaceholder: string;
    kind: string;
    kind_all: string;
    kind_customer: string;
    kind_subscriber: string;
    kind_stopped: string;
    speed: string;
  };
  actions: {
    add: string;
    openProfile: string;
    deleteSelected: string;
    deleteAll: string;
    viewSubscription: string;
  };
  table: {
    sectionSubtitle: string;
    lineId: string;
    fullName: string;
    phone: string;
    type: string;
    username: string;
    speed: string;
    balance: string;
    actions: string;
    empty: string;
    emptyHint: string;
    selectedCount: string;
    selectAll: string;
  };
  form: {
    fullName: string;
    fullNameRequired: string;
    facilityType: string;
    facilityTypeOther: string;
    facilityTypeOtherRequired: string;
    lineNumber: string;
    lineNumberRequired: string;
    subscriberId: string;
    phone: string;
    notes: string;
    editTitle: string;
    create: string;
    createSuccess: string;
    updateSuccess: string;
    deleteSuccess: string;
    deleteTitle: string;
    deleteMessage: string;
    deleteBulkTitle: string;
    deleteBulkMessage: string;
    deleteBulkSuccess: string;
    deleteAllTitle: string;
    deleteAllMessage: string;
    deleteAllSuccess: string;
    saveProfile: string;
    balance: string;
    balanceHint: string;
    balanceInvalid: string;
  };
  add: {
    title: string;
    hint: string;
  };
  successModal: {
    title: string;
    subtitle: string;
    nameLabel: string;
    lineIdLabel: string;
    phoneLabel: string;
    noPhone: string;
    noPhoneHint: string;
    welcomeLabel: string;
    welcomeDefault: string;
    sendWelcome: string;
    sentLabel: string;
    sendSuccess: string;
    addAnother: string;
    goToProfile: string;
  };
  profile: {
    backToList: string;
    notFound: string;
    detailsSection: string;
    assignSection: string;
    assignHint: string;
    assignAction: string;
    assignSuccess: string;
    restoreSubscriberSuccess: string;
    noUsername: string;
    expiringHint: string;
    subscriberHint: string;
    stoppedHint: string;
    stoppedNoDebt: string;
    balanceOwed: string;
    afterStoppedTitle: string;
  };
  assign: {
    title: string;
    hint: string;
    pickSpeed: string;
    pickSpeedHint: string;
    poolForSpeed: string;
    noSpeedTiers: string;
    pickUsername: string;
    confirm: string;
    mockNote: string;
    currentSpeed: string;
    speedReadOnlyHint: string;
    speedMissingHint: string;
    openSubscriberProfile: string;
  };
  balance: {
    sectionTitle: string;
    currentBalance: string;
    sectionHint: string;
    sectionHintReadOnly: string;
    recordPayment: string;
    paymentTitle: string;
    paymentHint: string;
    amount: string;
    amountRequired: string;
    confirmPayment: string;
    stillOwes: string;
    paidOff: string;
    afterPaidHint: string;
    editProfileHint: string;
  };
};

export const customersEn: CustomersI18n = {
  title: "Customers",
  subtitle:
    "Everyone in the system — including stopped accounts that may still owe money. Assign a username to start a subscription.",
  titleNew: "Add customer",
  titleProfile: "Customer profile",
  kind: {
    customer: "Customer",
    subscriber: "Subscriber",
    stopped: "Canceled",
  },
  filters: {
    search: "Search",
    searchPlaceholder: "Name, phone, line ID, username, previous username…",
    kind: "Type",
    kind_all: "All",
    kind_customer: "Customers only",
    kind_subscriber: "With username",
    kind_stopped: "Canceled",
    speed: "Speed",
  },
  actions: {
    add: "Add customer",
    openProfile: "Open profile",
    deleteSelected: "Delete selected ({{count}})",
    deleteAll: "Delete all",
    viewSubscription: "Subscription profile",
  },
  table: {
    sectionSubtitle: "{{count}} in registry",
    lineId: "Line ID",
    fullName: "Full name",
    phone: "Phone",
    type: "Type",
    username: "Username",
    speed: "Speed",
    balance: "Balance",
    actions: "Actions",
    empty: "No customers match your filters",
    emptyHint: "Add a customer or adjust filters.",
    selectedCount: "{{count}} selected",
    selectAll: "Select all",
  },
  form: {
    fullName: "Full name",
    fullNameRequired: "Full name is required",
    facilityType: "Facility type",
    facilityTypeOther: "Specify facility type",
    facilityTypeOtherRequired: "Facility type is required",
    lineNumber: "Line number",
    lineNumberRequired: "Line number is required",
    subscriberId: "Subscriber ID",
    phone: "Phone",
    notes: "Notes",
    editTitle: "Edit {{lineId}}",
    create: "Create customer",
    createSuccess: "Customer created",
    updateSuccess: "Customer updated",
    deleteSuccess: "Customer deleted",
    deleteTitle: "Delete customer",
    deleteMessage: "Delete {{lineId}}? This cannot be undone.",
    deleteBulkTitle: "Delete selected",
    deleteBulkMessage: "Delete {{count}} selected?",
    deleteBulkSuccess: "Deleted {{count}} customer(s)",
    deleteAllTitle: "Delete all",
    deleteAllMessage: "Delete all {{count}} customers on this list?",
    deleteAllSuccess: "All deleted",
    saveProfile: "Save changes",
    balance: "Opening balance (₪)",
    balanceHint: "Use a negative value for debt (e.g. -100). Leave 0 if none.",
    balanceInvalid: "Enter a valid balance amount",
  },
  add: {
    title: "Add customer",
    hint: "Creates a line ID only. Assign a username later to make them a subscriber.",
  },
  successModal: {
    title: "Customer created successfully",
    subtitle: "You can send them a quick welcome message now.",
    nameLabel: "Name",
    lineIdLabel: "Line ID",
    phoneLabel: "Phone",
    noPhone: "No phone",
    noPhoneHint: "No phone number on file — add one to send a welcome SMS.",
    welcomeLabel: "Welcome SMS",
    welcomeDefault:
      "Hello {{name}}, welcome to WeNet. Your line {{lineId}} has been registered. Our support team is here for any questions.",
    sendWelcome: "Send welcome SMS",
    sentLabel: "Sent",
    sendSuccess: "Welcome SMS sent",
    addAnother: "Add another",
    goToProfile: "Open profile",
  },
  profile: {
    backToList: "Back to customers",
    notFound: "Customer not found",
    detailsSection: "Customer details",
    assignSection: "Assign username",
    assignHint: "Pick an available username from the pool. This starts the subscription and moves them to the Subscribers list.",
    assignAction: "Assign from pool",
    assignSuccess: "Username assigned (mock) — now a subscriber",
    restoreSubscriberSuccess: "Reactivated — returned to Subscribers list",
    noUsername: "No username yet",
    expiringHint: "Subscription cycle ended — see Expiring page.",
    subscriberHint: "Active subscription — open full subscriber profile.",
    stoppedHint: "Canceled subscription — removed from Subscribers; username returned to pool. Account stays here for balance and history.",
    stoppedNoDebt: "No outstanding balance — no payment needed.",
    balanceOwed: "Balance owed",
    afterStoppedTitle: "After stop — payments & profile",
  },
  assign: {
    title: "Assign username",
    hint: "Pick an available username from the selected speed pool. This starts the subscription and moves them to the Subscribers list.",
    pickSpeed: "Speed tier (username pool)",
    pickSpeedHint: "Choose any speed — usernames are listed per tier.",
    poolForSpeed: "Username pool for",
    noSpeedTiers: "No speed tiers configured — add speeds first.",
    pickUsername: "Available username",
    confirm: "Assign",
    mockNote: "Will call API to link usernameId and start billing cycle.",
    currentSpeed: "Subscription speed",
    speedReadOnlyHint: "Speed is shown for reference only — change it on the subscriber Statistics tab.",
    speedMissingHint: "Speed is not set yet. Set it on the subscriber Statistics tab before assigning a username.",
    openSubscriberProfile: "Open subscriber profile (Statistics)",
  },
  balance: {
    sectionTitle: "Balance & payments",
    currentBalance: "Current balance",
    sectionHint:
      "Record a payment or debt anytime. Positive adds credit (+); negative records a charge (−).",
    sectionHintReadOnly: "Invoice history for reference.",
    recordPayment: "Record payment / debt",
    paymentTitle: "Record payment / debt",
    paymentHint: "Positive adds credit (+). Negative records a charge or debt (−), e.g. -100.",
    amount: "Amount (₪)",
    amountRequired: "Enter a non-zero amount (use − for debt)",
    confirmPayment: "Save payment",
    stillOwes: "Balance is still negative — collect remaining debt before assigning a new username.",
    paidOff: "No debt on file — you can assign a new username below when ready.",
    afterPaidHint: "Profile edits save with «Save changes» in customer details.",
    editProfileHint: "Update phone, notes, or name in customer details anytime.",
  },
};

export const customersAr: CustomersI18n = {
  title: "الزبائن",
  subtitle:
    "كل الأشخاص في النظام — بما فيهم المتوقفون الذين قد يبقى عليهم رصيد. عيّن اسمًا من المجموعة لبدء الاشتراك.",
  titleNew: "إضافة زبون",
  titleProfile: "ملف الزبون",
  kind: {
    customer: "زبون",
    subscriber: "مشترك",
    stopped: "ملغي",
  },
  filters: {
    search: "بحث",
    searchPlaceholder: "اسم، هاتف، رقم الخط، اسم مستخدم، اسم مستخدم سابق…",
    kind: "النوع",
    kind_all: "الكل",
    kind_customer: "زبائن فقط",
    kind_subscriber: "لديهم اسم مستخدم",
    kind_stopped: "ملغي",
    speed: "السرعة",
  },
  actions: {
    add: "إضافة زبون",
    openProfile: "فتح الملف",
    deleteSelected: "حذف المحدد ({{count}})",
    deleteAll: "حذف الكل",
    viewSubscription: "ملف الاشتراك",
  },
  table: {
    sectionSubtitle: "{{count}} في السجل",
    lineId: "رقم الخط",
    fullName: "الاسم",
    phone: "الهاتف",
    type: "النوع",
    username: "اسم المستخدم",
    speed: "السرعة",
    balance: "الرصيد",
    actions: "إجراءات",
    empty: "لا يوجد زبائن يطابقون الفلتر",
    emptyHint: "أضف زبونًا أو غيّر الفلاتر.",
    selectedCount: "{{count}} محدد",
    selectAll: "تحديد الكل",
  },
  form: {
    fullName: "الاسم الكامل",
    fullNameRequired: "الاسم مطلوب",
    facilityType: "نوع المنشأة",
    facilityTypeOther: "حدد نوع المنشأة",
    facilityTypeOtherRequired: "نوع المنشأة مطلوب",
    lineNumber: "رقم الخط",
    lineNumberRequired: "رقم الخط مطلوب",
    subscriberId: "رقم المشترك",
    phone: "الهاتف",
    notes: "ملاحظات",
    editTitle: "تعديل {{lineId}}",
    create: "إنشاء زبون",
    createSuccess: "تم إنشاء الزبون",
    updateSuccess: "تم التحديث",
    deleteSuccess: "تم الحذف",
    deleteTitle: "حذف زبون",
    deleteMessage: "حذف {{lineId}}؟ لا يمكن التراجع.",
    deleteBulkTitle: "حذف المحدد",
    deleteBulkMessage: "حذف {{count}} محدد؟",
    deleteBulkSuccess: "تم حذف {{count}}",
    deleteAllTitle: "حذف الكل",
    deleteAllMessage: "حذف كل {{count}} زبون في القائمة؟",
    deleteAllSuccess: "تم حذف الكل",
    saveProfile: "حفظ التعديلات",
    balance: "الرصيد الافتتاحي (₪)",
    balanceHint: "استخدم قيمة سالبة للدين (مثل -100). اترك 0 إن لم يكن هناك رصيد.",
    balanceInvalid: "أدخل مبلغ رصيد صالحًا",
  },
  add: {
    title: "إضافة زبون",
    hint: "ينشئ رقم خط فقط. عيّن اسم مستخدم لاحقًا ليصبح مشتركًا.",
  },
  successModal: {
    title: "تم إنشاء الزبون بنجاح",
    subtitle: "يمكنك إرسال رسالة ترحيبية سريعة له الآن.",
    nameLabel: "الاسم",
    lineIdLabel: "رقم الخط",
    phoneLabel: "الهاتف",
    noPhone: "لا يوجد هاتف",
    noPhoneHint: "لا يوجد رقم هاتف مسجّل — أضف رقمًا لإرسال رسالة ترحيبية.",
    welcomeLabel: "رسالة ترحيبية",
    welcomeDefault:
      "مرحبًا {{name}}، أهلًا بك في WeNet. تم تسجيل خطك برقم {{lineId}}. فريق الدعم الفني بخدمتك لأي استفسار.",
    sendWelcome: "إرسال رسالة ترحيبية",
    sentLabel: "تم الإرسال",
    sendSuccess: "تم إرسال الرسالة الترحيبية",
    addAnother: "إضافة زبون آخر",
    goToProfile: "فتح الملف",
  },
  profile: {
    backToList: "العودة للزبائن",
    notFound: "الزبون غير موجود",
    detailsSection: "بيانات الزبون",
    assignSection: "تعيين اسم مستخدم",
    assignHint: "اختر اسمًا من المجموعة المتاحة لبدء الاشتراك ونقله لقائمة المشتركين.",
    assignAction: "تعيين من المجموعة",
    assignSuccess: "تم التعيين (تجريبي) — أصبح مشتركًا",
    restoreSubscriberSuccess: "تمت إعادة التفعيل — عاد إلى قائمة المشتركين",
    noUsername: "بدون اسم مستخدم",
    expiringHint: "انتهت دورة الاشتراك — يظهر في صفحة المنتهية.",
    subscriberHint: "اشتراك نشط — افتح ملف المشترك الكامل.",
    stoppedHint: "متوقف — أُزيل من المشتركين وأُعيد الاسم للمجموعة. يبقى هنا للرصيد والسجل.",
    stoppedNoDebt: "لا يوجد رصيد مستحق — لا حاجة لتسجيل دفعة.",
    balanceOwed: "رصيد مستحق",
    afterStoppedTitle: "بعد الإيقاف — الدفع والملف",
  },
  assign: {
    title: "تعيين اسم مستخدم",
    hint: "اختر اسمًا من مجموعة السرعة المحددة لبدء الاشتراك ونقله لقائمة المشتركين.",
    pickSpeed: "سرعة الباقة (مجموعة الأسماء)",
    pickSpeedHint: "اختر أي سرعة — الأسماء المتاحة تظهر حسب السرعة.",
    poolForSpeed: "مجموعة الأسماء لـ",
    noSpeedTiers: "لا توجد سرعات معرّفة — أضف السرعات أولاً.",
    pickUsername: "اسم متاح",
    confirm: "تعيين",
    mockNote: "سيستدعي الـ API لربط usernameId وبدء الدورة.",
    currentSpeed: "سرعة الاشتراك",
    speedReadOnlyHint: "السرعة للعرض فقط — غيّرها من تبويب الإحصائيات في ملف المشترك.",
    speedMissingHint: "لم تُحدَّد السرعة بعد. حدّدها من تبويب الإحصائيات قبل تعيين اسم مستخدم.",
    openSubscriberProfile: "فتح ملف المشترك (الإحصائيات)",
  },
  balance: {
    sectionTitle: "الرصيد والمدفوعات",
    currentBalance: "الرصيد الحالي",
    sectionHint:
      "سجّل دفعة أو دينًا في أي وقت. الموجب يضيف رصيدًا (+)؛ السالب يسجّل رسومًا أو دينًا (−).",
    sectionHintReadOnly: "سجل الفواتير للمراجعة.",
    recordPayment: "تسجيل دفعة / دين",
    paymentTitle: "تسجيل دفعة / دين",
    paymentHint: "المبلغ الموجب يضيف رصيدًا (+). المبلغ السالب يسجّل رسومًا أو دينًا (−)، مثل -100.",
    amount: "المبلغ (₪)",
    amountRequired: "أدخل مبلغًا غير صفري (استخدم − للدين)",
    confirmPayment: "حفظ الدفعة",
    stillOwes: "لا يزال هناك دين — اجمع المتبقي قبل تعيين اسم مستخدم جديد.",
    paidOff: "لا يوجد دين — يمكنك تعيين اسم مستخدم جديد أدناه عند الجاهزية.",
    afterPaidHint: "حفظ بيانات الملف عبر «حفظ التعديلات» في تفاصيل الزبون.",
    editProfileHint: "حدّث الهاتف أو الملاحظات أو الاسم في تفاصيل الزبون في أي وقت.",
  },
};
