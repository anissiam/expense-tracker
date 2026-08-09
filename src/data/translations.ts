export type Language = 'en' | 'ar';

export interface TranslationDictionary {
  // Common & Navigation
  appName: string;
  appSubtitle: string;
  cycle: string;
  available: string;
  salaryModeActive: string;
  systemReady: string;
  closeCycle: string;
  userProfile: string;
  language: string;
  english: string;
  arabic: string;
  selectCurrency: string;
  
  // Sidebar Items
  navModules: string;
  dashboard: string;
  dashboardDesc: string;
  budgetWizard: string;
  budgetWizardDesc: string;
  categoriesAllocations: string;
  categoriesDesc: string;
  expensesManager: string;
  expensesDesc: string;
  budgetTemplates: string;
  templatesDesc: string;
  monthlyClosing: string;
  closingDesc: string;
  savingsVault: string;
  savingsDesc: string;
  reportsAnalytics: string;
  reportsDesc: string;
  smartAiInsights: string;
  insightsDesc: string;
  incomingAndAccounts: string;
  incomingDesc: string;
  addAccountBtn: string;
  addIncomingBtn: string;
  accountsSectionTitle: string;
  incomingsSectionTitle: string;
  totalBankBalances: string;
  totalPendingIncome: string;
  totalReceivedIncome: string;
  systemEngine: string;

  // Dashboard View
  implementationPlan: string;
  wizardBtn: string;
  addExpenseBtn: string;
  monthlySpendingTrend: string;
  dailyAvg: string;
  cumulative: string;
  availableBudget: string;
  remainingToSpend: string;
  recentActivity: string;
  viewAll: string;
  noActivityYet: string;
  savingsBalance: string;
  protected: string;
  longTermVault: string;
  smartHealthAdvisory: string;
  categoryAllocations: string;
  individualBudgetCards: string;
  manageAll: string;
  spent: string;
  limit: string;
  subItems: string;

  // Expense Manager
  expensesTitle: string;
  addExpenseModal: string;
  searchPlaceholder: string;
  allCategories: string;
  allPaymentMethods: string;
  cash: string;
  creditCard: string;
  debitCard: string;
  bankTransfer: string;
  applePay: string;
  amount: string;
  date: string;
  category: string;
  subcategory: string;
  paymentMethod: string;
  notes: string;
  actions: string;
  saveExpense: string;
  cancel: string;
  aiAutoCategorize: string;
  categorizing: string;
  noExpensesFound: string;
  expenseLogTitle: string;
  expenseLogDesc: string;
  exportCsv: string;
  newExpenseBtn: string;
  editExpenseModalTitle: string;
  addExpenseModalTitle: string;
  expenseTitleLabel: string;
  autoCategorizeBtn: string;
  amountLabel: string;
  categoryLabel: string;
  subcategoryLabel: string;
  paymentMethodLabel: string;
  notesLabel: string;
  cancelBtn: string;
  saveExpenseBtn: string;

  // Budget Wizard
  budgetWizardTitle: string;
  budgetWizardSubtitle: string;
  selectMode: string;
  fixedSalaryMode: string;
  flexiblePlannedMode: string;
  monthlyIncome: string;
  saveBudgetConfig: string;
  wizardHeaderTitle: string;
  wizardHeaderDesc: string;
  step1SelectMode: string;
  fixedSalaryTitle: string;
  fixedSalaryDesc: string;
  plannedFlexibleTitle: string;
  plannedFlexibleDesc: string;
  step2SelectCurrency: string;
  currencyHelpText: string;
  step3MonthlyIncome: string;
  salaryIncome: string;
  targetBudget: string;
  incomeHelpText: string;
  allocationCheck: string;
  warningOverAllocated: string;
  orApplyTemplate: string;
  budgetSaved: string;
  saveAndUpdateCycle: string;

  // Categories
  categoriesTitle: string;
  addCategory: string;
  allocatedBudget: string;
  totalAllocated: string;
  unallocated: string;
  addSubcategory: string;
  categoryName: string;
  categoryManagementTitle: string;
  categoryManagementDesc: string;
  newCategoryBtn: string;
  totalIncomeAllocation: string;
  unallocatedRemaining: string;
  overallocatedBy: string;
  allocatedToCategories: string;
  totalIncomeCap: string;
  moveUp: string;
  moveDown: string;
  archive: string;
  delete: string;
  editLimit: string;
  saveLimit: string;
  subcategoriesList: string;
  addSubcategoryInline: string;
  subcategoryNamePlaceholder: string;
  optionalLimit: string;
  createCategoryModalTitle: string;
  chooseIcon: string;
  chooseThemeColor: string;
  initialSubcategories: string;
  addSubcatBtn: string;
  createCategoryBtn: string;

  // Templates
  templatesTitle: string;
  applyTemplate: string;
  ramadanTemplate: string;
  travelTemplate: string;
  vacationTemplate: string;
  schoolTemplate: string;
  defaultTemplate: string;
  templatesHeaderTitle: string;
  templatesHeaderDesc: string;
  templateActiveNotice: string;
  applyTemplateBtn: string;
  templateApplied: string;

  // Monthly Closing
  closingTitle: string;
  closingSubtitle: string;
  launchClosingWizard: string;
  carryForwardOption: string;
  toSavingsVault: string;
  toNextMonth: string;
  splitBetweenBoth: string;
  confirmClosing: string;
  closingHeaderTitle: string;
  closingHeaderDesc: string;
  totalCycleIncome: string;
  totalCycleSpent: string;
  netSurplusDeficit: string;
  carryForwardOptionTitle: string;
  optionSavings: string;
  optionNextMonth: string;
  optionSplit: string;
  executeClosingBtn: string;

  // Savings Vault
  savingsVaultTitle: string;
  savingsGoals: string;
  deposit: string;
  withdraw: string;
  target: string;
  current: string;
  addGoal: string;
  savingsVaultHeaderTitle: string;
  savingsVaultHeaderDesc: string;
  totalVaultBalance: string;
  totalGoalsTarget: string;
  newGoalBtn: string;
  depositFunds: string;
  withdrawFunds: string;
  goalNameLabel: string;
  targetAmountLabel: string;
  currentBalanceLabel: string;
  saveGoalBtn: string;
  depositModalTitle: string;
  withdrawModalTitle: string;
  enterAmount: string;
  confirm: string;

  // Reports
  reportsTitle: string;
  monthlyComparison: string;
  categoryDistribution: string;
  reportsHeaderTitle: string;
  reportsHeaderDesc: string;
  incomeVsExpenseChart: string;
  categoryBreakdownChart: string;
  spendingVelocityChart: string;
  exportPdfReport: string;

  // Insights
  insightsTitle: string;
  generateInsightsBtn: string;
  aiAnalyzing: string;
  insightsHeaderTitle: string;
  insightsHeaderDesc: string;
  refreshAiInsights: string;
  highPriority: string;
  mediumPriority: string;
  lowPriority: string;

  // User Profile Modal
  userProfileTitle: string;
  userProfileDesc: string;
  selectLanguageLabel: string;
  selectCurrencyLabel: string;
  saveSettingsBtn: string;

  // Design Themes
  themeOptions: string;
  themeObsidian: string;
  themeEmeraldLight: string;
  themeSapphire: string;
  themeAmber: string;
  selectTheme: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'ExpenseTracker',
    appSubtitle: 'Implementation Plan',
    cycle: 'Cycle',
    available: 'Available',
    salaryModeActive: 'Salary Mode: Active',
    systemReady: 'System Ready',
    closeCycle: 'Close Cycle',
    userProfile: 'User Settings',
    language: 'Language',
    english: 'English',
    arabic: 'العربية',
    selectCurrency: 'Select Currency',

    navModules: 'Navigation Modules',
    dashboard: 'Dashboard',
    dashboardDesc: 'Monthly summary & spending metrics',
    budgetWizard: 'Budget Wizard',
    budgetWizardDesc: 'Set salary mode & income limits',
    categoriesAllocations: 'Categories & Allocations',
    categoriesDesc: 'Subcategories & budget limits',
    expensesManager: 'Expenses Manager',
    expensesDesc: 'Track, search & filter expenses',
    budgetTemplates: 'Budget Templates',
    templatesDesc: 'Apply 1-click prebuilt templates',
    monthlyClosing: 'Monthly Closing',
    closingDesc: 'Review & carry forward savings',
    savingsVault: 'Savings Vault',
    savingsDesc: 'Track goals & reserve balances',
    reportsAnalytics: 'Reports & Analytics',
    reportsDesc: 'Weekly & monthly chart breakdowns',
    smartAiInsights: 'Smart AI Insights',
    insightsDesc: 'Rule-based & AI recommendations',
    incomingAndAccounts: 'Incoming & Accounts',
    incomingDesc: 'Manage banks, e-wallets & future income',
    addAccountBtn: 'Add Bank / E-Wallet',
    addIncomingBtn: 'Schedule Future Income',
    accountsSectionTitle: 'Banks & Digital Wallets',
    incomingsSectionTitle: 'Future Scheduled Income Streams',
    totalBankBalances: 'Total Liquid Funds in Accounts',
    totalPendingIncome: 'Expected Future Inflow',
    totalReceivedIncome: 'Received Inflow This Cycle',
    systemEngine: 'System Engine',

    implementationPlan: 'Implementation Plan',
    wizardBtn: 'Wizard',
    addExpenseBtn: 'Add Expense',
    monthlySpendingTrend: 'Monthly Spending Trend',
    dailyAvg: 'Daily Avg',
    cumulative: 'Cumulative',
    availableBudget: 'Available Budget',
    remainingToSpend: 'Remaining to spend this cycle',
    recentActivity: 'Recent Activity',
    viewAll: 'View All',
    noActivityYet: 'No activity recorded yet',
    savingsBalance: 'Savings Balance',
    protected: 'Protected',
    longTermVault: 'Long-Term Vault & Emergency Reserve',
    smartHealthAdvisory: 'Smart Health Advisory',
    categoryAllocations: 'Category Allocations',
    individualBudgetCards: 'Individual budget cards & spending progress',
    manageAll: 'Manage All',
    spent: 'Spent',
    limit: 'Limit',
    subItems: 'sub-items',

    expensesTitle: 'Expenses Manager',
    addExpenseModal: 'Add New Expense',
    searchPlaceholder: 'Search expenses...',
    allCategories: 'All Categories',
    allPaymentMethods: 'All Payment Methods',
    cash: 'Cash',
    creditCard: 'Credit Card',
    debitCard: 'Debit Card',
    bankTransfer: 'Bank Transfer',
    applePay: 'Apple Pay',
    amount: 'Amount',
    date: 'Date',
    category: 'Category',
    subcategory: 'Subcategory',
    paymentMethod: 'Payment Method',
    notes: 'Notes',
    actions: 'Actions',
    saveExpense: 'Save Expense',
    cancel: 'Cancel',
    aiAutoCategorize: 'AI Smart Categorize',
    categorizing: 'Categorizing...',
    noExpensesFound: 'No expenses found matching filters.',
    expenseLogTitle: 'Expense Management & Log',
    expenseLogDesc: 'Track daily transactions, filter payment channels, and manage expense records.',
    exportCsv: 'Export CSV',
    newExpenseBtn: 'New Expense',
    editExpenseModalTitle: 'Edit Expense Record',
    addExpenseModalTitle: 'Log New Expense',
    expenseTitleLabel: 'Title / Item Description',
    autoCategorizeBtn: 'AI Auto-Categorize',
    amountLabel: 'Amount',
    categoryLabel: 'Category',
    subcategoryLabel: 'Subcategory',
    paymentMethodLabel: 'Payment Method',
    notesLabel: 'Notes / Receipt Reference (Optional)',
    cancelBtn: 'Cancel',
    saveExpenseBtn: 'Save Expense',

    budgetWizardTitle: 'Monthly Budget Setup Wizard',
    budgetWizardSubtitle: 'Configure your active income cycle & budget allocation rules',
    selectMode: 'Select Budget Mode',
    fixedSalaryMode: 'Fixed Salary Mode',
    flexiblePlannedMode: 'Planned Flexible Mode',
    monthlyIncome: 'Monthly Income Amount',
    saveBudgetConfig: 'Save Budget Configuration',
    wizardHeaderTitle: 'Monthly Budget Wizard',
    wizardHeaderDesc: 'Configure your core income, budget mode, and currency for cycle:',
    step1SelectMode: '1. Select Budget Mode',
    fixedSalaryTitle: 'Fixed Salary Mode',
    fixedSalaryDesc: 'Best for fixed monthly salaries or wages. Sets a rigid cap to allocate across categories.',
    plannedFlexibleTitle: 'Planned Flexible Mode',
    plannedFlexibleDesc: 'Best for freelancers or variable incomes. Adjusts target income dynamically with project inflows.',
    step2SelectCurrency: '2. Select Operating Currency',
    currencyHelpText: 'All dashboard charts and reports will display in',
    step3MonthlyIncome: '3. Monthly',
    salaryIncome: 'Salary / Income',
    targetBudget: 'Target Budget',
    incomeHelpText: 'Total available funds for the month before category allocations.',
    allocationCheck: 'Allocation Balance Check',
    warningOverAllocated: 'Warning: Category allocations exceed total income by',
    orApplyTemplate: 'Or apply a 1-click Budget Template (Ramadan, Travel, 50/30/20)',
    budgetSaved: 'Budget Saved!',
    saveAndUpdateCycle: 'Save & Update Cycle',

    categoriesTitle: 'Category & Subcategory Allocations',
    addCategory: 'Add Category',
    allocatedBudget: 'Allocated Budget',
    totalAllocated: 'Total Allocated',
    unallocated: 'Unallocated Income',
    addSubcategory: 'Add Subcategory',
    categoryName: 'Category Name',
    categoryManagementTitle: 'Category & Budget Allocation Management',
    categoryManagementDesc: 'Organize custom categories, unlimited subcategories, icons, and monthly spending limits.',
    newCategoryBtn: 'New Category',
    totalIncomeAllocation: 'Total Income Allocation',
    unallocatedRemaining: 'Unallocated',
    overallocatedBy: 'Overallocated by',
    allocatedToCategories: 'Allocated across Categories',
    totalIncomeCap: 'Total Income',
    moveUp: 'Move Up',
    moveDown: 'Move Down',
    archive: 'Archive',
    delete: 'Delete',
    editLimit: 'Edit Limit',
    saveLimit: 'Save Limit',
    subcategoriesList: 'Subcategories',
    addSubcategoryInline: '+ Add Subcategory',
    subcategoryNamePlaceholder: 'Subcategory name...',
    optionalLimit: 'Optional limit',
    createCategoryModalTitle: 'Create Custom Category',
    chooseIcon: 'Choose Icon',
    chooseThemeColor: 'Theme Color',
    initialSubcategories: 'Initial Subcategories (Optional)',
    addSubcatBtn: 'Add',
    createCategoryBtn: 'Create Category',

    templatesTitle: 'Prebuilt Budget Templates',
    applyTemplate: 'Apply Template',
    ramadanTemplate: 'Ramadan Budget Template',
    travelTemplate: 'Travel & Vacation Template',
    vacationTemplate: 'Summer Vacation Template',
    schoolTemplate: 'Back to School Template',
    defaultTemplate: 'Balanced Monthly Template',
    templatesHeaderTitle: 'Prebuilt Budget Templates',
    templatesHeaderDesc: 'Apply complete, expert-designed category budget allocations in a single click.',
    templateActiveNotice: 'Applying a template will overwrite current category allocations.',
    applyTemplateBtn: 'Apply Template',
    templateApplied: 'Template Applied Successfully!',

    closingTitle: 'Monthly Review & Closing',
    closingSubtitle: 'Finalize current cycle expenses and decide how unspent funds are allocated',
    launchClosingWizard: 'Launch Closing Wizard',
    carryForwardOption: 'Carry Forward Option',
    toSavingsVault: 'Transfer Remaining to Savings Vault',
    toNextMonth: 'Rollover to Next Month Budget',
    splitBetweenBoth: 'Split 50/50 Between Savings & Rollover',
    confirmClosing: 'Confirm Monthly Closing',
    closingHeaderTitle: 'Monthly Cycle Closing Workflow',
    closingHeaderDesc: 'Review final figures, calculate surplus or deficit, and allocate remaining balance.',
    totalCycleIncome: 'Total Cycle Income',
    totalCycleSpent: 'Total Cycle Spent',
    netSurplusDeficit: 'Net Surplus / Deficit',
    carryForwardOptionTitle: 'How would you like to allocate the surplus?',
    optionSavings: '100% to Savings Vault',
    optionNextMonth: '100% Rollover to Next Month',
    optionSplit: '50% Savings / 50% Rollover',
    executeClosingBtn: 'Close Month & Carry Forward',

    savingsVaultTitle: 'Savings Vault & Goals',
    savingsGoals: 'Savings Goals',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    target: 'Target',
    current: 'Current',
    addGoal: 'Add Goal',
    savingsVaultHeaderTitle: 'Savings Vault & Goals Tracker',
    savingsVaultHeaderDesc: 'Ringfence emergency reserves and track progress towards financial targets.',
    totalVaultBalance: 'Total Savings Vault Balance',
    totalGoalsTarget: 'Total Goals Target',
    newGoalBtn: 'New Savings Goal',
    depositFunds: 'Deposit Funds',
    withdrawFunds: 'Withdraw Funds',
    goalNameLabel: 'Goal Name',
    targetAmountLabel: 'Target Amount',
    currentBalanceLabel: 'Initial Deposit',
    saveGoalBtn: 'Create Goal',
    depositModalTitle: 'Deposit to Goal',
    withdrawModalTitle: 'Withdraw from Goal',
    enterAmount: 'Enter Amount',
    confirm: 'Confirm',

    reportsTitle: 'Financial Reports & Analytics',
    monthlyComparison: 'Monthly Income vs Expenses',
    categoryDistribution: 'Category Distribution',
    reportsHeaderTitle: 'Financial Reports & Visual Analytics',
    reportsHeaderDesc: 'Deep-dive charts comparing income vs. spending, daily velocity, and category allocations.',
    incomeVsExpenseChart: 'Income vs. Total Spending',
    categoryBreakdownChart: 'Category Spending Breakdown',
    spendingVelocityChart: 'Daily Spending Velocity',
    exportPdfReport: 'Export PDF Report',

    insightsTitle: 'Smart Financial Intelligence',
    generateInsightsBtn: 'Refresh AI Insights',
    aiAnalyzing: 'AI Analyzing Spending Patterns...',
    insightsHeaderTitle: 'Smart AI Financial Insights',
    insightsHeaderDesc: 'Automated rule-based & AI-driven recommendations to optimize your spending and savings.',
    refreshAiInsights: 'Refresh AI Insights',
    highPriority: 'High Priority',
    mediumPriority: 'Medium Priority',
    lowPriority: 'Low Priority',

    userProfileTitle: 'User Settings & Language',
    userProfileDesc: 'Customize app display, currency preference, and regional language.',
    selectLanguageLabel: 'Application Language',
    selectCurrencyLabel: 'Default Currency',
    saveSettingsBtn: 'Save Settings',

    themeOptions: 'Design Themes & Styles',
    themeObsidian: 'Obsidian Dark (Modern Slate)',
    themeEmeraldLight: 'Emerald Mint (Clean Light)',
    themeSapphire: 'Sapphire Night (Royal Navy)',
    themeAmber: 'Desert Sunset (Warm Amber)',
    selectTheme: 'Select Visual Theme',
  },
  ar: {
    appName: 'متبع المصاريف',
    appSubtitle: 'خطة التنفيذ المالي',
    cycle: 'الدورة',
    available: 'المتاح',
    salaryModeActive: 'وضع الراتب: نشط',
    systemReady: 'النظام جاهز',
    closeCycle: 'إغلاق الدورة',
    userProfile: 'إعدادات المستخدم',
    language: 'اللغة',
    english: 'English',
    arabic: 'العربية',
    selectCurrency: 'اختر العملة',

    navModules: 'وحدات التنقل',
    dashboard: 'لوحة التحكم',
    dashboardDesc: 'ملخص شهري ومؤشرات الإنفاق',
    budgetWizard: 'معالج الميزانية',
    budgetWizardDesc: 'ضبط وضع الراتب وحدود الدخل',
    categoriesAllocations: 'الفئات والتخصيصات',
    categoriesDesc: 'الفئات الفرعية وحدود الميزانية',
    expensesManager: 'إدارة المصاريف',
    expensesDesc: 'تتبع وتصفية والبحث في المصاريف',
    budgetTemplates: 'قوالب الميزانية',
    templatesDesc: 'تطبيق قوالب جاهزة بنقرة واحدة',
    monthlyClosing: 'الإغلاق الشهري',
    closingDesc: 'مراجعة وتحويل المدخرات',
    savingsVault: 'خزينة المدخرات',
    savingsDesc: 'متابعة الأهداف وأرصدة الاحتياطي',
    reportsAnalytics: 'التقارير والتحليلات',
    reportsDesc: 'تحليلات بيانية أسبوعية وشهرية',
    smartAiInsights: 'تحليلات الذكاء الاصطناعي',
    insightsDesc: 'توصيات ذكية وقواعد مالية',
    incomingAndAccounts: 'الدخل القادم والمحافظ',
    incomingDesc: 'إدارة البنوك والمحافظ الإلكترونية والدخل المستقبلي',
    addAccountBtn: 'إضافة بنك / محفظة',
    addIncomingBtn: 'إضافة دخل مستقبلي',
    accountsSectionTitle: 'الحسابات البنكية والمحافظ الرقمية',
    incomingsSectionTitle: 'جدول الدخل القادم والمستقبلي',
    totalBankBalances: 'إجمالي السيولة في الحسابات',
    totalPendingIncome: 'الدخل القادم المتوقع',
    totalReceivedIncome: 'الدخل المستلم في الدورة الحالية',
    systemEngine: 'محرك النظام',

    implementationPlan: 'خطة التنفيذ المالي',
    wizardBtn: 'المعالج',
    addExpenseBtn: 'إضافة مصروف',
    monthlySpendingTrend: 'مؤشر الإنفاق الشهري',
    dailyAvg: 'المعدل اليومي',
    cumulative: 'التراكمي',
    availableBudget: 'الميزانية المتاحة',
    remainingToSpend: 'المتبقي للإنفاق في هذه الدورة',
    recentActivity: 'النشاط الأخير',
    viewAll: 'عرض الكل',
    noActivityYet: 'لم يتم تسجيل أي عمليات بعد',
    savingsBalance: 'رصيد المدخرات',
    protected: 'محمي',
    longTermVault: 'خزينة طويلة الأجل واحتياطي الطوارئ',
    smartHealthAdvisory: 'التوصية المالية الذكية',
    categoryAllocations: 'تخصيصات الفئات',
    individualBudgetCards: 'بطاقات الميزانية الفردية ومستوى الإنفاق',
    manageAll: 'إدارة الكل',
    spent: 'المصروف',
    limit: 'الحد',
    subItems: 'عناصر فرعية',

    expensesTitle: 'إدارة المصاريف',
    addExpenseModal: 'إضافة مصروف جديد',
    searchPlaceholder: 'بحث في المصاريف...',
    allCategories: 'جميع الفئات',
    allPaymentMethods: 'جميع طرق الدفع',
    cash: 'نقداً',
    creditCard: 'بطاقة ائتمان',
    debitCard: 'بطاقة مدى / خصم',
    bankTransfer: 'تحويل بنكي',
    applePay: 'آبل باي',
    amount: 'المبلغ',
    date: 'التاريخ',
    category: 'الفئة',
    subcategory: 'الفئة الفرعية',
    paymentMethod: 'طريقة الدفع',
    notes: 'ملاحظات',
    actions: 'الإجراءات',
    saveExpense: 'حفظ المصروف',
    cancel: 'إلغاء',
    aiAutoCategorize: 'تصنيف ذكي تلقائي',
    categorizing: 'جاري التصنيف...',
    noExpensesFound: 'لم يتم العثور على مصاريف تطابق الفلاتر.',
    expenseLogTitle: 'إدارة وسجل المصاريف',
    expenseLogDesc: 'تتبع المعاملات اليومية، تصفية قنوات الدفع، وإدارة سجلات المصاريف.',
    exportCsv: 'تصدير CSV',
    newExpenseBtn: 'مصروف جديد',
    editExpenseModalTitle: 'تعديل سجل المصروف',
    addExpenseModalTitle: 'تسجيل مصروف جديد',
    expenseTitleLabel: 'العنوان / وصف العنصر',
    autoCategorizeBtn: 'تصنيف ذكي تلقائي',
    amountLabel: 'المبلغ',
    categoryLabel: 'الفئة',
    subcategoryLabel: 'الفئة الفرعية',
    paymentMethodLabel: 'طريقة الدفع',
    notesLabel: 'ملاحظات / مرجع الفاتورة (اختياري)',
    cancelBtn: 'إلغاء',
    saveExpenseBtn: 'حفظ المصروف',

    budgetWizardTitle: 'معالج إعداد الميزانية الشهرية',
    budgetWizardSubtitle: 'تكوين دورة الدخل النشطة وقواعد توزيع الميزانية',
    selectMode: 'اختر وضع الميزانية',
    fixedSalaryMode: 'وضع الراتب الثابت',
    flexiblePlannedMode: 'الوضع المخطط المرن',
    monthlyIncome: 'مبلغ الدخل الشهري',
    saveBudgetConfig: 'حفظ إعدادات الميزانية',
    wizardHeaderTitle: 'معالج الميزانية الشهرية',
    wizardHeaderDesc: 'تكوين الدخل الأساسي، وضع الميزانية، والعملة للدورة:',
    step1SelectMode: '1. اختر وضع الميزانية',
    fixedSalaryTitle: 'وضع الراتب الثابت',
    fixedSalaryDesc: 'الأفضل للرواتب والأجور الشهرية الثابتة. يحدد سقفاً ثابتاً للتوزيع على الفئات.',
    plannedFlexibleTitle: 'الوضع المخطط المرن',
    plannedFlexibleDesc: 'الأفضل للمستقلين أو أصحاب الدخل المتغير. يضبط هدف الدخل ديناميكياً حسب التدفقات.',
    step2SelectCurrency: '2. اختر عملة التشغيل',
    currencyHelpText: 'جميع المخططات والتقارير ستعرض بـ',
    step3MonthlyIncome: '3. الدخل الشهري',
    salaryIncome: 'الراتب / الدخل',
    targetBudget: 'الميزانية المستهدفة',
    incomeHelpText: 'إجمالي الأموال المتاحة للشهر قبل توزيعات الفئات.',
    allocationCheck: 'فحص توازن التوزيع',
    warningOverAllocated: 'تحذير: تخصيصات الفئات تتجاوز إجمالي الدخل بمقدار',
    orApplyTemplate: 'أو طبق قالب ميزانية بنقرة واحدة (رمضان، سفر، 50/30/20)',
    budgetSaved: 'تم حفظ الميزانية!',
    saveAndUpdateCycle: 'حفظ وتحديث الدورة',

    categoriesTitle: 'تخصيصات الفئات والفئات الفرعية',
    addCategory: 'إضافة فئة',
    allocatedBudget: 'الميزانية المخصصة',
    totalAllocated: 'إجمالي المخصص',
    unallocated: 'الدخل غير المخصص',
    addSubcategory: 'إضافة فئة فرعية',
    categoryName: 'اسم الفئة',
    categoryManagementTitle: 'إدارة الفئات وتخصيصات الميزانية',
    categoryManagementDesc: 'تنظيم الفئات المخصصة، الفئات الفرعية، الأيقونات، وحدود الإنفاق الشهرية.',
    newCategoryBtn: 'فئة جديدة',
    totalIncomeAllocation: 'إجمالي توزيع الدخل',
    unallocatedRemaining: 'غير مخصص',
    overallocatedBy: 'تجاوز التخصيص بمقدار',
    allocatedToCategories: 'المخصص للفئات',
    totalIncomeCap: 'سقف الدخل الإجمالي',
    moveUp: 'تحريك للأعلى',
    moveDown: 'تحريك للأسفل',
    archive: 'أرشفة',
    delete: 'حذف',
    editLimit: 'تعديل الحد',
    saveLimit: 'حفظ الحد',
    subcategoriesList: 'الفئات الفرعية',
    addSubcategoryInline: '+ إضافة فئة فرعية',
    subcategoryNamePlaceholder: 'اسم الفئة الفرعية...',
    optionalLimit: 'حد اختياري',
    createCategoryModalTitle: 'إنشاء فئة مخصصة',
    chooseIcon: 'اختر الأيقونة',
    chooseThemeColor: 'لون المظهر',
    initialSubcategories: 'الفئات الفرعية الأولية (اختياري)',
    addSubcatBtn: 'إضافة',
    createCategoryBtn: 'إنشاء الفئة',

    templatesTitle: 'قوالب الميزانية الجاهزة',
    applyTemplate: 'تطبيق القالب',
    ramadanTemplate: 'قالب ميزانية رمضان',
    travelTemplate: 'قالب السفر والسياحة',
    vacationTemplate: 'قالب العطلة الصيفية',
    schoolTemplate: 'قالب العودة للمدارس',
    defaultTemplate: 'القالب الشهري المتوازن',
    templatesHeaderTitle: 'قوالب الميزانية الجاهزة',
    templatesHeaderDesc: 'تطبيق تخصيصات ميزانية كاملة ومصممة بعناية بنقرة واحدة.',
    templateActiveNotice: 'تطبيق القالب سيعيد ضبط تخصيصات الفئات الحالية.',
    applyTemplateBtn: 'تطبيق القالب',
    templateApplied: 'تم تطبيق القالب بنجاح!',

    closingTitle: 'المراجعة والإغلاق الشهري',
    closingSubtitle: 'إنهاء مصاريف الدورة الحالية وتحديد كيفية توجيه الفائض',
    launchClosingWizard: 'بدء معالج الإغلاق',
    carryForwardOption: 'خيار تدوير المبلغ المتبقي',
    toSavingsVault: 'تحويل المتبقي لخزينة المدخرات',
    toNextMonth: 'تدوير للشهر القادم',
    splitBetweenBoth: 'تقسيم 50/50 بين المدخرات والتدوير',
    confirmClosing: 'تأكيد الإغلاق الشهري',
    closingHeaderTitle: 'سير عمل إغلاق الدورة الشهرية',
    closingHeaderDesc: 'مراجعة الأرقام النهائية، حساب الفائض أو العجز، وتوزيع الرصيد المتبقي.',
    totalCycleIncome: 'إجمالي دخل الدورة',
    totalCycleSpent: 'إجمالي المصروف في الدورة',
    netSurplusDeficit: 'صافي الفائض / العجز',
    carryForwardOptionTitle: 'كيف ترغب في توزيع الفائض؟',
    optionSavings: '100% إلى خزينة المدخرات',
    optionNextMonth: '100% تدوير للشهر القادم',
    optionSplit: '50% مدخرات / 50% تدوير',
    executeClosingBtn: 'إغلاق الشهر وتدوير الفائض',

    savingsVaultTitle: 'خزينة المدخرات والأهداف',
    savingsGoals: 'أهداف الادخار',
    deposit: 'إيداع',
    withdraw: 'سحب',
    target: 'الهدف',
    current: 'الحالي',
    addGoal: 'إضافة هدف',
    savingsVaultHeaderTitle: 'خزينة المدخرات ومتبع الأهداف',
    savingsVaultHeaderDesc: 'عزل احتياطيات الطوارئ ومتابعة التقدم نحو الأهداف المالية.',
    totalVaultBalance: 'إجمالي رصيد خزينة المدخرات',
    totalGoalsTarget: 'إجمالي الأهداف المستهدفة',
    newGoalBtn: 'هدف ادخار جديد',
    depositFunds: 'إيداع أموال',
    withdrawFunds: 'سحب أموال',
    goalNameLabel: 'اسم الهدف',
    targetAmountLabel: 'المبلغ المستهدف',
    currentBalanceLabel: 'الإيداع الأولي',
    saveGoalBtn: 'إنشاء الهدف',
    depositModalTitle: 'إيداع في الهدف',
    withdrawModalTitle: 'سحب من الهدف',
    enterAmount: 'أدخل المبلغ',
    confirm: 'تأكيد',

    reportsTitle: 'التقارير المالية والتحليلات',
    monthlyComparison: 'مقارنة الدخل الشهري مع المصاريف',
    categoryDistribution: 'توزيع الفئات',
    reportsHeaderTitle: 'التقارير المالية والتحليلات البصرية',
    reportsHeaderDesc: 'مخططات تفصيلية تقارن الدخل بالإنفاق، معدل الإنفاق اليومي، وتوزيع الفئات.',
    incomeVsExpenseChart: 'الدخل مقابل إجمالي الإنفاق',
    categoryBreakdownChart: 'توزيع الإنفاق حسب الفئة',
    spendingVelocityChart: 'معدل الإنفاق اليومي',
    exportPdfReport: 'تصدير تقرير PDF',

    insightsTitle: 'الذكاء المالي المتقدم',
    generateInsightsBtn: 'تحديث التحليلات الذكية',
    aiAnalyzing: 'جاري تحليل أنماط الإنفاق بواسطة الذكاء الاصطناعي...',
    insightsHeaderTitle: 'تحليلات الذكاء الاصطناعي المالية',
    insightsHeaderDesc: 'توصيات آلية وقائمة على الذكاء الاصطناعي لتحسين الإنفاق والادخار.',
    refreshAiInsights: 'تحديث تحليلات الذكاء الاصطناعي',
    highPriority: 'أولوية عالية',
    mediumPriority: 'أولوية متوسطة',
    lowPriority: 'أولوية منخفضة',

    userProfileTitle: 'إعدادات المستخدم واللغة',
    userProfileDesc: 'تخصيص مظهر التطبيق، تفضيلات العملة، واللغة الإقليمية.',
    selectLanguageLabel: 'لغة التطبيق',
    selectCurrencyLabel: 'العملة الافتراضية',
    saveSettingsBtn: 'حفظ الإعدادات',

    themeOptions: 'خيارات التصميم والمظهر',
    themeObsidian: 'الماس الأسود (داكن مدرع)',
    themeEmeraldLight: 'الزمرد النعناعي (فاتح أنيق)',
    themeSapphire: 'الأزرق الياقوتي (ليلي ملكي)',
    themeAmber: 'الغروب الدافئ (ذهبي دافئ)',
    selectTheme: 'اختر مظهر الواجهة',
  },
};
