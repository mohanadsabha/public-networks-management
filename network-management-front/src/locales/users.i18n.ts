export type UsersI18n = {
  title: string;
  subtitle: string;
  mockHint: string;
  actions: {
    add: string;
    edit: string;
    delete: string;
    activate: string;
    deactivate: string;
  };
  filters: {
    search: string;
    searchPlaceholder: string;
  };
  table: {
    sectionSubtitle: string;
    empty: string;
    emptyHint: string;
    noResults: string;
    name: string;
    username: string;
    email: string;
    role: string;
    status: string;
    lastLogin: string;
    createdAt: string;
    actions: string;
  };
  status: {
    active: string;
    inactive: string;
  };
  form: {
    addTitle: string;
    editTitle: string;
    name: string;
    namePlaceholder: string;
    nameRequired: string;
    username: string;
    usernamePlaceholder: string;
    usernameRequired: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    passwordRequired: string;
    passwordEditHint: string;
    confirmPassword: string;
    confirmPasswordRequired: string;
    passwordsMismatch: string;
    role: string;
    roleRequired: string;
    status: string;
    createSuccess: string;
    updateSuccess: string;
    deleteSuccess: string;
    statusSuccess: string;
    deleteTitle: string;
    deleteMessage: string;
  };
};

export const usersEn: UsersI18n = {
  title: "Admin users",
  subtitle: "Manage dashboard accounts, roles, and access. Activity log records who did what and from which IP.",
  mockHint: "Mock data for UI review — connect API with VITE_USE_ADMIN_USERS_API=true.",
  actions: {
    add: "Add user",
    edit: "Edit",
    delete: "Delete",
    activate: "Activate",
    deactivate: "Deactivate",
  },
  filters: {
    search: "Search",
    searchPlaceholder: "Name, username, email, role…",
  },
  table: {
    sectionSubtitle: "{{count}} users on this page",
    empty: "No admin users yet",
    emptyHint: "Add staff accounts so actions in the activity log can be tied to a username and IP.",
    noResults: "No users match your search",
    name: "Name",
    username: "Username",
    email: "Email",
    role: "Role",
    status: "Status",
    lastLogin: "Last login",
    createdAt: "Created",
    actions: "Actions",
  },
  status: {
    active: "Active",
    inactive: "Inactive",
  },
  form: {
    addTitle: "New admin user",
    editTitle: "Edit {{username}}",
    name: "Full name",
    namePlaceholder: "Display name",
    nameRequired: "Name is required",
    username: "Username",
    usernamePlaceholder: "login.username",
    usernameRequired: "Username is required",
    email: "Email",
    emailPlaceholder: "optional@company.ps",
    password: "Password",
    passwordPlaceholder: "Min. 6 characters",
    passwordRequired: "Password is required",
    passwordEditHint: "Leave blank to keep the current password.",
    confirmPassword: "Confirm password",
    confirmPasswordRequired: "Confirm password",
    passwordsMismatch: "Passwords do not match",
    role: "Role",
    roleRequired: "Role is required",
    status: "Status",
    createSuccess: "User created",
    updateSuccess: "User updated",
    deleteSuccess: "User deleted",
    statusSuccess: "Status updated",
    deleteTitle: "Delete user",
    deleteMessage: "Delete {{username}}? They will no longer be able to sign in.",
  },
};

export const usersAr: UsersI18n = {
  title: "مستخدمي النظام",
  subtitle: "إدارة حسابات لوحة التحكم والصلاحيات. سجل العمليات يوضح من نفّذ الإجراء ومن أي IP.",
  mockHint: "بيانات تجريبية لمراجعة الواجهة — فعّل الـ API عبر VITE_USE_ADMIN_USERS_API=true.",
  actions: {
    add: "إضافة مستخدم",
    edit: "تعديل",
    delete: "حذف",
    activate: "تفعيل",
    deactivate: "تعطيل",
  },
  filters: {
    search: "بحث",
    searchPlaceholder: "الاسم، اسم المستخدم، البريد، الدور…",
  },
  table: {
    sectionSubtitle: "{{count}} مستخدم في هذه الصفحة",
    empty: "لا يوجد مستخدمون بعد",
    emptyHint: "أضف حسابات الموظفين لربط الإجراءات في سجل العمليات باسم المستخدم وعنوان IP.",
    noResults: "لا يوجد مستخدمون مطابقون للبحث",
    name: "الاسم",
    username: "اسم المستخدم",
    email: "البريد",
    role: "الدور",
    status: "الحالة",
    lastLogin: "آخر دخول",
    createdAt: "تاريخ الإنشاء",
    actions: "إجراءات",
  },
  status: {
    active: "نشط",
    inactive: "معطّل",
  },
  form: {
    addTitle: "مستخدم جديد",
    editTitle: "تعديل {{username}}",
    name: "الاسم الكامل",
    namePlaceholder: "الاسم الظاهر",
    nameRequired: "الاسم مطلوب",
    username: "اسم المستخدم",
    usernamePlaceholder: "login.username",
    usernameRequired: "اسم المستخدم مطلوب",
    email: "البريد الإلكتروني",
    emailPlaceholder: "optional@company.ps",
    password: "كلمة المرور",
    passwordPlaceholder: "6 أحرف على الأقل",
    passwordRequired: "كلمة المرور مطلوبة",
    passwordEditHint: "اتركه فارغاً للإبقاء على كلمة المرور الحالية.",
    confirmPassword: "تأكيد كلمة المرور",
    confirmPasswordRequired: "تأكيد كلمة المرور",
    passwordsMismatch: "كلمتا المرور غير متطابقتين",
    role: "الدور",
    roleRequired: "الدور مطلوب",
    status: "الحالة",
    createSuccess: "تم إنشاء المستخدم",
    updateSuccess: "تم تحديث المستخدم",
    deleteSuccess: "تم حذف المستخدم",
    statusSuccess: "تم تحديث الحالة",
    deleteTitle: "حذف المستخدم",
    deleteMessage: "حذف {{username}}؟ لن يتمكن من تسجيل الدخول بعد ذلك.",
  },
};
