import { Language } from '../locales';

/**
 * Arabic display names for built-in DATA values (seeded categories,
 * system templates, income sources, recurrence, account types).
 * User-created custom names fall back to the stored value unchanged.
 */

const CATEGORY_AR: Record<string, string> = {
  // Default parents (seeded)
  'Housing & Utilities': 'السكن والمرافق',
  'Food & Dining': 'الطعام والمطاعم',
  Transportation: 'المواصلات',
  'Lifestyle & Fun': 'نمط الحياة والترفيه',
  'Healthcare & Fitness': 'الصحة واللياقة',
  'Savings & Investments': 'الادخار والاستثمار',
  // Default subcategories (seeded)
  'Rent / Mortgage': 'إيجار / تمويل عقاري',
  'Electricity & Water': 'كهرباء وماء',
  'Internet & Mobile': 'إنترنت وجوال',
  'Supermarket Groceries': 'بقّالة السوبرماركت',
  'Restaurants & Cafes': 'مطاعم ومقاهي',
  'Car Fuel / Petrol': 'وقود السيارة / بنزين',
  'Car Maintenance & Wash': 'صيانة وغسيل السيارة',
  'Public Transit / Taxi': 'نقل عام / تاكسي',
  'Events & Movies': 'فعاليات وسينما',
  'Streaming & Apps': 'بث وتطبيقات',
  'Sports & Hobbies': 'رياضة وهوايات',
  'Gym Membership': 'اشتراك النادي',
  'Pharmacy & Medical': 'صيدلية وطبي',
  'Emergency Vault': 'خزنة الطوارئ',
  'Stock Portfolio': 'محفظة الأسهم',
  // System template inner names
  Utilities: 'المرافق',
  'Dining Out': 'الأكل خارجاً',
  'Fuel & Transit': 'وقود ومواصلات',
  Maintenance: 'صيانة',
  Entertainment: 'ترفيه',
  Subscriptions: 'اشتراكات',
  'Emergency Fund': 'صندوق الطوارئ',
  Investments: 'استثمارات',
  'Special Food Supplies': 'مؤن غذائية خاصة',
  'Iftar Gatherings & Catering': 'تجمعات إفطار وضيافة',
  'Zakat al-Fitr & Alms': 'زكاة الفطر والصدقات',
  'Community Sponsorships': 'رعايات مجتمعية',
  'Eid Clothing & Gifts': 'ملابس وهدايا العيد',
  'Hospitality & Sweets': 'ضيافة وحلويات',
  'Rent & Housing': 'إيجار وسكن',
  'Monthly Buffer': 'احتياطي شهري',
  'Airline Tickets': 'تذاكر طيران',
  'Local Taxis & Car Rental': 'تاكسي محلي وتأجير سيارات',
  'Resort & Hotel Stays': 'إقامات منتجعات وفنادق',
  'Local Restaurants': 'مطاعم محلية',
  'Snacks & Cafes': 'وجبات خفيفة ومقاهي',
  'Guided Tours & Tickets': 'جولات مرشدة وتذاكر',
  'Souvenirs & Gifts': 'هدايا تذكارية',
  'School/College Fees': 'رسوم مدرسة/جامعة',
  'Extracurricular Activities': 'أنشطة لاصفية',
  'School Uniforms': 'الزي المدرسي',
  'Sports Gear': 'معدات رياضية',
  'Laptops/Tablets': 'لابتوب/تابلت',
  'Stationery & Books': 'قرطاسية وكتب',
  'Daily Living Essentials': 'أساسيات المعيشة اليومية',
  'Ramadan Groceries & Iftar': 'بقّالة رمضان والإفطار',
  'Zakat & Charitable Giving': 'الزكاة والصدقات',
  'Eid Gifts & Hospitality': 'هدايا وضيافة العيد',
  'Housing & Essential Utilities': 'السكن والمرافق الأساسية',
  'Emergency Savings': 'ادخار الطوارئ',
  'Flights & Transit': 'طيران ومواصلات',
  'Hotels & Accommodation': 'فنادق وإقامة',
  'Dining & Food Experience': 'مطاعم وتجارب طعام',
  'Excursions & Shopping': 'رحلات وتسوق',
  'Tuition & Academic Fees': 'رسوم دراسية وأكاديمية',
  'Uniforms & Clothing': 'زي وملابس',
  'Supplies & Devices': 'مستلزمات وأجهزة',
  'General Household': 'المنزل العام',
};

const TEMPLATE_AR: Record<string, string> = {
  'Standard Household (50/30/20)': 'أسرة معيارية (50/30/20)',
  'Balanced monthly distribution for essentials, lifestyle, and automated savings.':
    'توزيع شهري متوازن للأساسيات ونمط الحياة والادخار الآلي.',
  'Ramadan Special Budget': 'ميزانية رمضان الخاصة',
  'Customized allocations prioritizing food, charity (Zakat/Sadaqah), family gatherings, and gifts.':
    'تخصيصات مخصصة تعطي أولوية للطعام والصدقة (الزكاة) والتجمعات العائلية والهدايا.',
  'Vacation & Travel Budget': 'ميزانية الإجازة والسفر',
  'Designed for holiday trips, flights, lodging, excursions, and souvenirs.':
    'مصممة للرحلات: طيران وإقامة وجولات وهدايا تذكارية.',
  'Back to School Season': 'موسم العودة للمدارس',
  'Focused allocation for tuition fees, textbooks, uniforms, supplies, and electronics.':
    'تخصيص مركّز للرسوم الدراسية والكتب والزي والمستلزمات والأجهزة.',
};

const INCOME_CATEGORY_AR: Record<string, string> = {
  Salary: 'راتب',
  Freelance: 'عمل حر',
  Investment: 'استثمار',
  Business: 'تجارة',
  Sale: 'بيع أصل',
  'Asset Sale': 'بيع أصل',
  Gift: 'هدية / مكافأة',
  'Gift / Bonus': 'هدية / مكافأة',
  Other: 'أخرى',
};

const RECURRENCE_AR: Record<string, string> = {
  once: 'مرة واحدة',
  monthly: 'شهري',
  weekly: 'أسبوعي',
  yearly: 'سنوي',
};

const ACCOUNT_TYPE_AR: Record<string, string> = {
  bank: 'حساب بنكي',
  wallet: 'محفظة إلكترونية',
  cash: 'خزنة نقدية',
  crypto: 'عملات رقمية / أخرى',
  'Bank Account': 'حساب بنكي',
  'E-Wallet': 'محفظة إلكترونية',
  'Digital Wallet': 'محفظة رقمية',
  'Cash Vault': 'خزنة نقدية',
  'Crypto / Other': 'عملات رقمية / أخرى',
};

/**
 * Translate a stored data label for display. Unknown/custom values
 * are returned unchanged.
 */
export function translateDataName(
  name: string | undefined | null,
  lang: Language,
  extra?: Record<string, string>
): string {
  const value = name ?? '';
  if (lang !== 'ar' || !value) return value;
  return (
    extra?.[value] ??
    CATEGORY_AR[value] ??
    TEMPLATE_AR[value] ??
    INCOME_CATEGORY_AR[value] ??
    RECURRENCE_AR[value] ??
    ACCOUNT_TYPE_AR[value] ??
    value
  );
}
