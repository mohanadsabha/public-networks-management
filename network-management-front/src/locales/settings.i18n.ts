export type SettingsI18n = {
  title: string;
  subtitle: string;
  vpn: {
    pageTitle: string;
    pageSubtitle: string;
    backToSettings: string;
    sectionTitle: string;
    sectionHint: string;
    title: string;
    live: string;
    offlineStream: string;
    refresh: string;
    enable: string;
    disable: string;
    enableSuccess: string;
    disableSuccess: string;
    powerOff: string;
    previewMode: string;
    previewBadge: string;
    previewHint: string;
    status: {
      DISCONNECTED: string;
      CONNECTING: string;
      CONNECTED: string;
      RECONNECTING: string;
      ERROR: string;
    };
    hint_DISCONNECTED: string;
    hint_DISABLED: string;
    hint_CONNECTING: string;
    hint_CONNECTED: string;
    hint_RECONNECTING: string;
    hint_ERROR: string;
    syncEveryMinutes: string;
    connectionError: string;
    checkingStatus: string;
    flow: {
      sectionTitle: string;
      sectionHint: string;
      vpnNode: string;
      mikrotikNode: string;
      viaApi: string;
      viaSsh: string;
      methodNode: string;
      methodHint: string;
      methodWaiting: string;
      methodPending: string;
      methodActive: string;
      previewNode: string;
      previewBanner: string;
      waitingVpn: string;
      vpnDisabled: string;
      vpnActive: string;
      mikrotikActive: string;
      mikrotikPending: string;
      mikrotikWaiting: string;
      pathVpn: string;
      pathMethod: string;
      pathRouter: string;
    };
  };
  hub: {
    comingSoon: string;
    logs: { title: string; description: string };
    excel: { title: string; description: string };
    users: { title: string; description: string };
    data: { title: string; description: string };
    routers: { title: string; description: string };
    vpn: { title: string; description: string };
  };
  routers: {
    backToSettings: string;
    title: string;
    subtitle: string;
    editTitle: string;
    addTitle: string;
    uploadImage: string;
    nameLabel: string;
    namePlaceholder: string;
    add: string;
    listTitle: string;
    empty: string;
    nameRequired: string;
    createSuccess: string;
    updateSuccess: string;
    deleteTitle: string;
    deleteMessage: string;
    deleteSuccess: string;
  };
  data: {
    backToSettings: string;
    title: string;
    subtitle: string;
    dangerZoneTitle: string;
    dangerZoneHint: string;
    customers: {
      title: string;
      description: string;
      recordCount: string;
    };
    subscribers: {
      title: string;
      description: string;
      recordCount: string;
    };
  };
  excel: {
    backToSettings: string;
    backToExcel: string;
    title: string;
    subtitle: string;
    hub: {
      availableUsernames: { title: string; description: string };
      subscribers: { title: string; description: string };
      usernameHistory: { title: string; description: string };
    };
    availableUsernames: {
      pageTitle: string;
      pageSubtitle: string;
      pickSpeed: string;
      importAction: string;
      exportAction: string;
      adminOnly: string;
      noSpeeds: string;
    };
    subscribers: {
      pageTitle: string;
      pageSubtitle: string;
      importAction: string;
      exportAction: string;
      importModalTitle: string;
      importSubmit: string;
      importHint: string;
      columnsHint: string;
      lineIdHint: string;
      selectFile: string;
      adminOnly: string;
      importSuccess: string;
      importSuccessUpdated: string;
      importSuccessMixed: string;
      exportSuccess: string;
    };
    usernameHistory: {
      pageTitle: string;
      pageSubtitle: string;
      importAction: string;
      exportAction: string;
      importModalTitle: string;
      importSubmit: string;
      importHint: string;
      columnsHint: string;
      lineIdHint: string;
      selectFile: string;
      adminOnly: string;
      importSuccess: string;
      exportSuccess: string;
    };
  };
};

export const settingsEn: SettingsI18n = {
  title: "Settings",
  subtitle: "Admin tools — activity log, data management, Excel import/export, and user management.",
  vpn: {
    pageTitle: "VPN",
    pageSubtitle: "VPN tunnel → RouterOS API or SSH fallback → MikroTik router.",
    backToSettings: "Back to settings",
    sectionTitle: "Connection status",
    sectionHint: "Live updates when linked to the server. Admins can turn VPN on or off and refresh status while it is running.",
    title: "VPN connection",
    live: "Live",
    offlineStream: "Status stream offline — use refresh",
    refresh: "Refresh status",
    enable: "Turn on VPN",
    disable: "Turn off VPN",
    enableSuccess: "VPN is starting",
    disableSuccess: "VPN turned off",
    powerOff: "Off",
    previewMode: "Not linked to server",
    previewBadge: "Preview",
    previewHint:
      "VPN panel is ready. Live status and on/off controls will work once OpenVPN is set up on the server.",
    status: {
      DISCONNECTED: "Disconnected",
      CONNECTING: "Connecting",
      CONNECTED: "Connected",
      RECONNECTING: "Reconnecting",
      ERROR: "Error",
    },
    hint_DISCONNECTED:
      "VPN is on but the tunnel is not connected yet. Wait a moment or refresh the status.",
    hint_DISABLED:
      "VPN is turned off. Turn it on to reach MikroTik and load online users.",
    hint_CONNECTING: "OpenVPN is starting — please wait.",
    hint_CONNECTED: "VPN tunnel is up. MikroTik sync runs over this connection.",
    hint_RECONNECTING: "Connection lost — OpenVPN is trying to reconnect automatically.",
    hint_ERROR: "VPN reported an error. Refresh the status or turn VPN off and on again.",
    syncEveryMinutes: "Usage syncs every {{minutes}} minutes",
    connectionError: "Cannot reach VPN API: {{message}}",
    checkingStatus: "Checking VPN status…",
    flow: {
      sectionTitle: "Connection path",
      sectionHint: "VPN tunnel → RouterOS API or SSH fallback → MikroTik router",
      vpnNode: "VPN tunnel",
      mikrotikNode: "MikroTik router",
      viaApi: "RouterOS API",
      viaSsh: "SSH fallback",
      methodNode: "RouterOS API or SSH",
      methodHint: "Primary: RouterOS API — SSH is used if API is unreachable",
      methodWaiting: "RouterOS API or SSH",
      methodPending: "Reachable after VPN",
      methodActive: "Connected to router",
      previewNode: "Preview",
      previewBanner: "Path diagram is ready — live status will appear when the server is linked.",
      waitingVpn: "Live mode — waiting for VPN tunnel. Nodes turn green when connected.",
      vpnDisabled: "VPN is turned off. Turn it on below to connect to MikroTik.",
      vpnActive: "Tunnel up",
      mikrotikActive: "{{count}} subscribers online",
      mikrotikPending: "Connecting…",
      mikrotikWaiting: "After VPN + method",
      pathVpn: "VPN tunnel",
      pathMethod: "RouterOS API or SSH fallback",
      pathRouter: "MikroTik router",
    },
  },
  hub: {
    comingSoon: "UI only",
    logs: {
      title: "Activity log",
      description: "Who did what and when across the system.",
    },
    excel: {
      title: "Excel tools",
      description: "Import and export available usernames, subscribers, and username history.",
    },
    users: {
      title: "Users & permissions",
      description: "Manage dashboard accounts and roles.",
    },
    data: {
      title: "Data management",
      description: "Bulk delete customers and subscribers — irreversible actions.",
    },
    routers: {
      title: "Router models",
      description: "Catalog of router names and images for subscriber profiles.",
    },
    vpn: {
      title: "VPN",
      description: "VPN tunnel → RouterOS API or SSH fallback → MikroTik router",
    },
  },
  routers: {
    backToSettings: "Back to settings",
    title: "Router models",
    subtitle: "Define router names and images — they appear as a dropdown in each subscriber profile.",
    editTitle: "Edit router model",
    addTitle: "Add router model",
    uploadImage: "Upload image",
    nameLabel: "Model name",
    namePlaceholder: "e.g. MikroTik hAP ac²",
    add: "Add model",
    listTitle: "Saved models",
    empty: "No router models yet.",
    nameRequired: "Enter a model name",
    createSuccess: "Router model added",
    updateSuccess: "Router model updated",
    deleteTitle: "Delete router model?",
    deleteMessage: "Remove {{name}} from the catalog? Subscriber profiles using it will keep their image until changed.",
    deleteSuccess: "Router model removed",
  },
  data: {
    backToSettings: "Back to settings",
    title: "Data management",
    subtitle: "Destructive bulk operations for customers and subscribers. Use only when you need to clear registry data.",
    dangerZoneTitle: "Danger zone",
    dangerZoneHint:
      "These actions permanently remove records and cannot be undone. Individual delete on list pages is unchanged.",
    customers: {
      title: "Delete all customers",
      description: "Remove every customer currently in the registry list.",
      recordCount: "{{count}} customers",
    },
    subscribers: {
      title: "Delete all subscribers",
      description: "Remove every active subscriber on the subscribers list (non-expired usernames).",
      recordCount: "{{count}} subscribers",
    },
  },
  excel: {
    backToSettings: "Back to settings",
    backToExcel: "Back to Excel tools",
    title: "Excel tools",
    subtitle: "Choose a section, then import or export Jawwal-style Excel files.",
    hub: {
      availableUsernames: {
        title: "Available usernames",
        description: "Import or export the username pool for a selected speed tier.",
      },
      subscribers: {
        title: "Subscribers",
        description: "Import or export the active subscribers list with line ID, credentials, and dates.",
      },
      usernameHistory: {
        title: "Username history",
        description: "Past usernames per subscriber — linked by full line ID (e.g. W04-228).",
      },
    },
    availableUsernames: {
      pageTitle: "Available usernames — Excel",
      pageSubtitle: "Select the speed tier first, then upload or download the pool for that tier.",
      pickSpeed: "Select speed tier",
      importAction: "Import Excel — {{speed}}",
      exportAction: "Export Excel — {{speed}}",
      adminOnly: "Only admins can import or export usernames.",
      noSpeeds: "No speed tiers found. Add speeds first, then return here.",
    },
    subscribers: {
      pageTitle: "Subscribers — Excel",
      pageSubtitle: "Bulk import or export subscribers using the Jawwal column layout.",
      importAction: "Import Excel",
      exportAction: "Export Excel",
      importModalTitle: "Import subscribers",
      importSubmit: "Import file",
      importHint:
        "Upload a Jawwal-style Excel file. Columns: subscriber, line ID, username, password, speed, first connection, disconnect date, status, phone, facility type.",
      columnsHint:
        "Export columns: المشترك · رقم الخط · اسم المستخدم · كلمة المرور · السرعة · تاريخ اول اتصال · تاريخ الفصل · الحالة · الهاتف · نوع المنشأة",
      lineIdHint:
        "On import, package line 4 becomes full line ID W04-228 (W + line + sequence). Copy that ID from the subscribers list for username history import.",
      selectFile: "Choose Excel file",
      adminOnly: "Only admins can import or export subscribers.",
      importSuccess: "Imported {{count}} subscriber(s)",
      importSuccessUpdated: "Updated {{count}} subscriber(s)",
      importSuccessMixed: "Imported {{imported}}, updated {{updated}}",
      exportSuccess: "Subscribers Excel downloaded",
    },
    usernameHistory: {
      pageTitle: "Username history — Excel",
      pageSubtitle:
        "Import past usernames for each subscriber. Rows are matched by full line ID — copy it from the subscriber profile after importing subscribers.",
      importAction: "Import Excel",
      exportAction: "Export Excel",
      importModalTitle: "Import username history",
      importSubmit: "Import file",
      importHint:
        "Each row needs the full line ID (e.g. W04-228), username, password, and usage dates. Package number alone (4) is not enough — use the ID shown on the website.",
      columnsHint:
        "Columns: المشترك · رقم الخط · اسم المستخدم · كلمة المرور · تاريخ اول اتصال - من · تاريخ الفصل - الى",
      lineIdHint:
        "Workflow: import subscribers first (line may be 4 → server creates W04-228). Then copy each W04-228 from the subscribers list into this Excel before importing history.",
      selectFile: "Choose Excel file",
      adminOnly: "Only admins can import or export username history.",
      importSuccess: "Imported {{count}} history row(s)",
      exportSuccess: "Username history Excel downloaded",
    },
  },
};

export const settingsAr: SettingsI18n = {
  title: "الإعدادات",
  subtitle: "أدوات الإدارة — سجل العمليات، إدارة البيانات، Excel، وإدارة المستخدمين.",
  vpn: {
    pageTitle: "VPN",
    pageSubtitle: "راوتر MikroTik → RouterOS API أو SSH احتياطي → نفق VPN",
    backToSettings: "العودة للإعدادات",
    sectionTitle: "حالة الاتصال",
    sectionHint: "تحديث مباشر عند الربط بالخادم. المسؤولون يمكنهم تشغيل VPN أو إيقافه وتحديث الحالة أثناء التشغيل.",
    title: "اتصال VPN",
    live: "مباشر",
    offlineStream: "بث الحالة غير متصل — استخدم التحديث",
    refresh: "تحديث الحالة",
    enable: "تشغيل VPN",
    disable: "إيقاف VPN",
    enableSuccess: "جارٍ تشغيل VPN",
    disableSuccess: "تم إيقاف VPN",
    powerOff: "متوقف",
    previewMode: "غير مربوط بالخادم",
    previewBadge: "معاينة",
    previewHint:
      "لوحة VPN جاهزة. الحالة المباشرة وأزرار التشغيل/الإيقاف ستعمل بعد إعداد OpenVPN على الخادم.",
    status: {
      DISCONNECTED: "غير متصل",
      CONNECTING: "جارٍ الاتصال",
      CONNECTED: "متصل",
      RECONNECTING: "إعادة الاتصال",
      ERROR: "خطأ",
    },
    hint_DISCONNECTED:
      "VPN مفعّل لكن النفق غير متصل بعد. انتظر قليلًا أو حدّث الحالة.",
    hint_DISABLED:
      "VPN متوقف. شغّله للوصول إلى MikroTik وعرض المتصلين.",
    hint_CONNECTING: "جارٍ تشغيل OpenVPN — انتظر قليلًا.",
    hint_CONNECTED: "نفق VPN يعمل. مزامنة MikroTik تتم عبر هذا الاتصال.",
    hint_RECONNECTING: "انقطع الاتصال — OpenVPN يحاول إعادة الاتصال تلقائيًا.",
    hint_ERROR: "حدث خطأ في VPN. حدّث الحالة أو أوقف VPN ثم شغّله من جديد.",
    syncEveryMinutes: "يتم المزامنة كل {{minutes}} دقائق",
    connectionError: "تعذّر الوصول إلى VPN API: {{message}}",
    checkingStatus: "جاري التحقق من حالة VPN…",
    flow: {
      sectionTitle: "مسار الاتصال",
      sectionHint: "راوتر MikroTik → RouterOS API أو SSH احتياطي → نفق VPN",
      vpnNode: "نفق VPN",
      mikrotikNode: "راوتر MikroTik",
      viaApi: "RouterOS API",
      viaSsh: "SSH احتياطي",
      methodNode: "RouterOS API أو SSH",
      methodHint: "الأساسي: RouterOS API — يُستخدم SSH احتياطي إذا تعذّر الوصول عبر API",
      methodWaiting: "RouterOS API أو SSH",
      methodPending: "بعد اكتمال VPN",
      methodActive: "متصل بالراوتر",
      previewNode: "معاينة",
      previewBanner: "مخطط المسار جاهز — ستظهر الحالة المباشرة عند ربط الخادم.",
      waitingVpn: "وضع مباشر — بانتظار نفق VPN. تتحول العقد إلى اللون الأخضر عند الاتصال.",
      vpnDisabled: "VPN متوقف. شغّله من الأسفل للاتصال بـ MikroTik.",
      vpnActive: "النفق يعمل",
      mikrotikActive: "{{count}} مشترك متصل",
      mikrotikPending: "جارٍ الاتصال…",
      mikrotikWaiting: "بعد VPN والطريقة",
      pathVpn: "نفق VPN",
      pathMethod: "RouterOS API أو SSH احتياطي",
      pathRouter: "راوتر MikroTik",
    },
  },
  hub: {
    comingSoon: "واجهة فقط",
    logs: {
      title: "سجل العمليات",
      description: "من قام بماذا ومتى في النظام.",
    },
    excel: {
      title: "أدوات Excel",
      description: "استيراد وتصدير الأسماء المتاحة والمشتركين وسجل الأسماء.",
    },
    users: {
      title: "المستخدمين والصلاحيات",
      description: "إدارة حسابات لوحة التحكم والأدوار.",
    },
    data: {
      title: "إدارة البيانات",
      description: "حذف جماعي للزبائن والمشتركين — إجراءات لا رجعة فيها.",
    },
    routers: {
      title: "موديلات الراوتر",
      description: "قائمة أسماء وصور الراوترات لملفات المشتركين.",
    },
    vpn: {
      title: "VPN",
      description: "راوتر MikroTik → RouterOS API أو SSH احتياطي → نفق VPN",
    },
  },
  routers: {
    backToSettings: "العودة للإعدادات",
    title: "موديلات الراوتر",
    subtitle: "عرّف أسماء وصور الراوترات — تظهر كقائمة منسدلة في ملف كل مشترك.",
    editTitle: "تعديل موديل الراوتر",
    addTitle: "إضافة موديل راوتر",
    uploadImage: "رفع صورة",
    nameLabel: "اسم الموديل",
    namePlaceholder: "مثال: MikroTik hAP ac²",
    add: "إضافة موديل",
    listTitle: "الموديلات المحفوظة",
    empty: "لا توجد موديلات راوتر بعد.",
    nameRequired: "أدخل اسم الموديل",
    createSuccess: "تمت إضافة موديل الراوتر",
    updateSuccess: "تم تحديث موديل الراوتر",
    deleteTitle: "حذف موديل الراوتر؟",
    deleteMessage: "إزالة {{name}} من القائمة؟ الملفات التي تستخدمه تحتفظ بالصورة حتى يتم تغييرها.",
    deleteSuccess: "تم حذف موديل الراوتر",
  },
  data: {
    backToSettings: "العودة للإعدادات",
    title: "إدارة البيانات",
    subtitle: "عمليات حذف جماعية للزبائن والمشتركين. استخدمها فقط عند الحاجة لتفريغ السجل.",
    dangerZoneTitle: "منطقة خطرة",
    dangerZoneHint:
      "هذه الإجراءات تحذف السجلات نهائياً ولا يمكن التراجع. الحذف الفردي من صفحات القوائم يبقى كما هو.",
    customers: {
      title: "حذف كل الزبائن",
      description: "إزالة كل الزبائن الموجودين حالياً في سجل الزبائن.",
      recordCount: "{{count}} زبون",
    },
    subscribers: {
      title: "حذف كل المشتركين",
      description: "إزالة كل المشتركين النشطين في قائمة المشتركين (أسماء غير منتهية).",
      recordCount: "{{count}} مشترك",
    },
  },
  excel: {
    backToSettings: "العودة للإعدادات",
    backToExcel: "العودة لأدوات Excel",
    title: "أدوات Excel",
    subtitle: "اختر القسم ثم استورد أو صدّر ملفات Excel بصيغة جوال.",
    hub: {
      availableUsernames: {
        title: "الأسماء المتاحة",
        description: "استيراد أو تصدير مجموعة الأسماء لسرعة محددة.",
      },
      subscribers: {
        title: "المشتركين",
        description: "استيراد أو تصدير قائمة المشتركين مع رقم الخط والبيانات والتواريخ.",
      },
      usernameHistory: {
        title: "سجل أسماء المستخدمين",
        description: "أسماء سابقة لكل مشترك — مربوطة برقم الخط الكامل (مثل W04-228).",
      },
    },
    availableUsernames: {
      pageTitle: "الأسماء المتاحة — Excel",
      pageSubtitle: "اختر السرعة أولاً ثم ارفع الملف أو نزّله لتلك السرعة.",
      pickSpeed: "اختر السرعة",
      importAction: "استيراد Excel — {{speed}}",
      exportAction: "تصدير Excel — {{speed}}",
      adminOnly: "الاستيراد والتصدير للمسؤولين فقط.",
      noSpeeds: "لا توجد سرعات. أضف السرعات أولاً ثم عد إلى هنا.",
    },
    subscribers: {
      pageTitle: "المشتركين — Excel",
      pageSubtitle: "استيراد أو تصدير جماعي للمشتركين بأعمدة جوال.",
      importAction: "استيراد Excel",
      exportAction: "تصدير Excel",
      importModalTitle: "استيراد المشتركين",
      importSubmit: "استيراد الملف",
      importHint:
        "ارفع ملف Excel بصيغة جوال. الأعمدة: المشترك، رقم الخط، اسم المستخدم، كلمة المرور، السرعة، تاريخ اول اتصال، تاريخ الفصل، الحالة، الهاتف، نوع المنشأة.",
      columnsHint:
        "أعمدة التصدير: المشترك · رقم الخط · اسم المستخدم · كلمة المرور · السرعة · تاريخ اول اتصال · تاريخ الفصل · الحالة · الهاتف · نوع المنشأة",
      lineIdHint:
        "عند الاستيراد، رقم الخط 4 يصبح W04-228 (W + الخط + تسلسل). انسخ هذا الرقم من قائمة المشتركين لاستيراد سجل الأسماء.",
      selectFile: "اختر ملف Excel",
      adminOnly: "الاستيراد والتصدير للمسؤولين فقط.",
      importSuccess: "تم استيراد {{count}} مشترك",
      importSuccessUpdated: "تم تحديث {{count}} مشترك",
      importSuccessMixed: "تم استيراد {{imported}} وتحديث {{updated}}",
      exportSuccess: "تم تنزيل ملف المشتركين",
    },
    usernameHistory: {
      pageTitle: "سجل أسماء المستخدمين — Excel",
      pageSubtitle:
        "استيراد أسماء مستخدمين سابقة لكل مشترك. الربط يتم برقم الخط الكامل — انسخه من ملف المشترك بعد استيراد المشتركين.",
      importAction: "استيراد Excel",
      exportAction: "تصدير Excel",
      importModalTitle: "استيراد سجل الأسماء",
      importSubmit: "استيراد الملف",
      importHint:
        "كل صف يحتاج رقم الخط الكامل (مثل W04-228) واسم المستخدم وكلمة المرور وتواريخ الاستخدام. رقم الخط فقط (4) غير كافٍ — استخدم الرقم الظاهر في الموقع.",
      columnsHint:
        "الأعمدة: المشترك · رقم الخط · اسم المستخدم · كلمة المرور · تاريخ اول اتصال - من · تاريخ الفصل - الى",
      lineIdHint:
        "الخطوات: استورد المشتركين أولاً (رقم الخط قد يكون 4 ← النظام ينشئ W04-228). ثم انسخ كل W04-228 من قائمة المشتركين إلى ملف السجل قبل الاستيراد.",
      selectFile: "اختر ملف Excel",
      adminOnly: "الاستيراد والتصدير للمسؤولين فقط.",
      importSuccess: "تم استيراد {{count}} سجل",
      exportSuccess: "تم تنزيل ملف سجل الأسماء",
    },
  },
};
