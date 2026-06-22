import { useState, useEffect } from 'react';

export type Language = 'en' | 'ar' | 'fa' | 'ku' | 'tr';

export const languages: { code: Language; name: string; native: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', name: 'English', native: 'English', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', native: 'العربية', dir: 'rtl' },
  { code: 'fa', name: 'Persian', native: 'فارسی', dir: 'rtl' },
  { code: 'ku', name: 'Kurdish Sorani', native: 'کوردی سۆرانی', dir: 'rtl' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', dir: 'ltr' },
];

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

export const translations: Translations = {
  // Navigation & General
  'app.name': { en: 'DealCompass AI+', ar: 'ديل كومباس AI+', fa: 'دیلکامپاس AI+', ku: 'ديل كومباس AI+', tr: 'DealCompass AI+' },
  'nav.home': { en: 'Home', ar: 'الرئيسية', fa: 'خانه', ku: 'سەرەکی', tr: 'Ana Sayfa' },
  'nav.opportunities': { en: 'Opportunities', ar: 'الفرص', fa: 'فرصت‌ها', ku: 'دەرفەتەکان', tr: 'Fırsatlar' },
  'nav.aiAgent': { en: 'AI Sourcing Agent', ar: 'وكيل التوريد الذكي', fa: 'عامل جستجوی هوش مصنوعی', ku: 'ئەیجێنتى دابینکردنی زیرەک', tr: 'AI Tedarik Ajanı' },
  'nav.market': { en: 'Market Intelligence', ar: 'ذكاء السوق', fa: 'هوش بازار', ku: 'زانیاری بازاڕ', tr: 'Pazar İstihbaratı' },
  'nav.predeals': { en: 'Pre-Deals', ar: 'ما قبل الصفقات', fa: 'پیش‌معامله‌ها', ku: 'پێش-دەرفەتەکان', tr: 'Ön-Anlaşmalar' },
  'nav.finance': { en: 'Trade Finance', ar: 'تمويل التجارة', fa: 'تامین مالی تجارت', ku: 'دارایی بازرگانی', tr: 'Ticaret Finansmanı' },
  'nav.radar': { en: 'Trade Radar', ar: 'رادار التجارة', fa: 'رادار تجارت', ku: 'رادارى بازرگانی', tr: 'Ticaret Radarı' },
  'nav.dashboard': { en: 'Dashboard', ar: 'لوحة التحكم', fa: 'داشبورد', ku: 'داشبۆرد', tr: 'Gösterge Paneli' },
  'nav.profile': { en: 'Profile', ar: 'الملف الشخصي', fa: 'پروفایل', ku: 'پڕۆفایل', tr: 'Profil' },
  'nav.billing': { en: 'Billing', ar: 'الفواتير', fa: 'صورتحساب', ku: 'فاکتورە', tr: 'Faturalandırma' },
  'nav.language': { en: 'Language', ar: 'اللغة', fa: 'زبان', ku: 'زمان', tr: 'Dil' },

  // Landing & Headers
  'landing.hero.title': { en: 'The Global Trade Operating System', ar: 'نظام تشغيل التجارة العالمية', fa: 'سیستم عامل تجارت جهانی', ku: 'سیستەمی کارکردنی بازرگانی جیهانی', tr: 'Küresel Ticaret İşletim Sistemi' },
  'landing.hero.subtitle': { en: 'Six AI engines. One terminal. Discover, verify and close cross-border deals in minutes.', ar: 'ست محركات ذكاء اصطناعي. محطة واحدة. اكتشف الفرص وتحقق من الموردين وأغلق الصفقات عبر الحدود في دقائق.', fa: 'شش موتور هوش مصنوعی. یک ترمینال. فرصت‌ها را کشف کنید، تامین‌کنندگان را تأیید کنید و معاملات فرامرزی را در دقیقه ببندید.', ku: 'شەش ئەنجینەی زیرەکی دەستکرد. یەک تەرمینال. دەرفەتەکان بدۆزەوە، دابینکەران بپشکنە و لە چەند خولەکدا دەرفەتەکان بگرە.', tr: 'Altı yapay zeka motoru. Tek terminal. Sınır ötesi fırsatları dakikalar içinde keşfet, doğrula ve kapat.' },
  'btn.start': { en: 'Request Early Access', ar: 'اطلب وصولًا مبكرًا', fa: 'درخواست دسترسی زودهنگام', ku: 'دەستپێکردنی وەرگرتنی پێشوەختە', tr: 'Erken Erişim Talep Et' },
  'btn.explore': { en: 'Explore the 6 Engines', ar: 'استكشف المحركات الست', fa: 'شش موتور را کاوش کنید', ku: 'شەش ئەنجینەکان بەدواداچوون', tr: '6 Motoru Keşfet' },
  'engines.title': { en: 'Six Intelligence Engines', ar: 'ست محركات ذكاء', fa: 'شش موتور هوش', ku: 'شەش ئەنجینەی زیرەکی', tr: 'Altı Zeka Motoru' },

  // Engine 1: Trade Radar
  'engine.radar.title': { en: 'Trade Radar', ar: 'رادار التجارة', fa: 'رادار تجارت', ku: 'رادارى بازرگانی', tr: 'Ticaret Radarı' },
  'engine.radar.desc': { en: 'Continuous crawler scanning 40+ countries for tenders, directories and exchanges. Real-time opportunity ingestion.', ar: 'زاحف مستمر يفحص أكثر من 40 دولة للمناقصات والأدلة والبورصات. استيعاب الفرص في الوقت الفعلي.', fa: 'خزشگر مداوم در حال اسکن ۴۰+ کشور برای مناقصه‌ها، دایرکتوری‌ها و بورس‌ها. جذب فرصت‌های واقعی‌زمان.', ku: 'کراوەری بەردەوام ٤٠+ وڵات دەپشکنێ بۆ تێندەر و فەهرەست و بۆرسەکان. دەرفەتەکان لە کاتی ڕاستەوخۆدا.', tr: '40+ ülkede ihaleleri, dizinleri ve borsaları sürekli tarayan tarayıcı. Gerçek zamanlı fırsat alımı.' },
  'radar.scan': { en: 'Run Live Scan', ar: 'تشغيل مسح مباشر', fa: 'اجرای اسکن زنده', ku: 'پشکنینی ڕاستەوخۆ بەڕێوەبەر', tr: 'Canlı Tarama Çalıştır' },
  'radar.results': { en: 'New Opportunities Found', ar: 'فرص جديدة تم العثور عليها', fa: 'فرصت‌های جدید یافت شد', ku: 'دەرفەتی نوێ دۆزرایەوە', tr: 'Yeni Fırsatlar Bulundu' },

  // Engine 2: Normalization
  'engine.norm.title': { en: 'AI Normalization', ar: 'التطبيع بالذكاء الاصطناعي', fa: 'نرمال‌سازی هوش مصنوعی', ku: 'نۆرمالیزاسیۆنی زیرەکی دەستکرد', tr: 'Yapay Zeka Normalizasyonu' },
  'engine.norm.desc': { en: 'Raw data from multiple languages and formats is cleaned, translated, standardized into uniform records ready for scoring.', ar: 'تحويل البيانات الخام متعددة اللغات والتنسيقات إلى سجلات موحدة جاهزة للتسجيل.', fa: 'داده‌های خام از زبان‌ها و فرمت‌های مختلف پاکسازی، ترجمه و استانداردسازی می‌شوند.', ku: 'زانیاری خاو لە زمان و فۆرماتە جیاوازەکان پاککراوە و یەکخراوە بۆ تۆمارەکان.', tr: 'Birden fazla dil ve formattaki ham veriler temizlenir, çevrilir ve puanlamaya hazır hale getirilir.' },

  // Engine 3: Scoring
  'engine.score.title': { en: 'Opportunity Scoring', ar: 'تسجيل الفرص', fa: 'امتیازدهی فرصت', ku: 'هەڵسەنگاندنی دەرفەت', tr: 'Fırsat Puanlama' },
  'engine.score.desc': { en: '0–100 quality score based on field completeness, source reliability and freshness.', ar: 'درجة جودة 0-100 بناءً على اكتمال الحقول وموثوقية المصدر وحداثة البيانات.', fa: 'امتیاز کیفیت ۰ تا ۱۰۰ بر اساس تکمیل فیلدها، قابلیت اعتماد منبع و تازگی.', ku: 'نمره‌ی ٠-١٠٠ بەپێی تەواوکردنی خانەکان و متمانەی سەرچاوە و تازەیی.', tr: 'Alan bütünlüğü, kaynak güvenilirliği ve güncelliğe göre 0-100 kalite puanı.' },

  // Engine 4: Lead Intelligence
  'engine.lead.title': { en: 'Lead Intelligence', ar: 'استخبارات العملاء', fa: 'هوش سرنخ', ku: 'زانیاری سەرچاوە', tr: 'Müşteri İstihbaratı' },
  'engine.lead.desc': { en: 'Enriched contact data with decision-maker details, activity tier and compliance flags.', ar: 'بيانات اتصال مُثراة مع تفاصيل صانع القرار ومستوى النشاط وإشارات الامتثال.', fa: 'داده‌های تماس غنی‌شده با جزئیات تصمیم‌گیرنده، سطح فعالیت و پرچم‌های انطباق.', ku: 'زانیاری پەیوەندییەکان لەگەڵ وردەکارییەکانی بڕیاربەر، ئاستی چالاکی و نیشانەکانی پابەندبوون.', tr: 'Karar verici detayları, etkinlik seviyesi ve uyum bayraklarıyla zenginleştirilmiş iletişim verileri.' },

  // Engine 5: Market Intelligence
  'engine.market.title': { en: 'Market Intelligence', ar: 'استخبارات السوق', fa: 'هوش بازار', ku: 'زانیاری بازاڕ', tr: 'Pazar İstihbaratı' },
  'engine.market.desc': { en: 'Live price trends, demand heatmaps, supply/demand imbalances and corridor analytics.', ar: 'اتجاهات الأسعار الحية، خرائط الحرارة للطلب، اختلالات العرض والطلب وتحليلات الممرات.', fa: 'روند قیمت‌های زنده، نقشه‌های حرارتی تقاضا، عدم تعادل عرضه و تقاضا.', ku: 'ڕەوتی نرخەکانی زیندوو، نەخشەی گەرمی داواکاری، ناهاوسەنگی دابینکردن و داواکاری.', tr: 'Canlı fiyat trendleri, talep ısı haritaları, arz/talep dengesizlikleri.' },

  // Engine 6: AI Agent
  'engine.agent.title': { en: 'AI Sourcing Agent', ar: 'وكيل التوريد الذكي', fa: 'عامل جستجوی هوش مصنوعی', ku: 'ئەیجێنتى دابینکردنی زیرەک', tr: 'AI Tedarik Ajanı' },
  'engine.agent.desc': { en: 'Describe what you need in natural language. AI parses, matches and returns ranked opportunities instantly.', ar: 'صف ما تحتاجه بلغتك الطبيعية. يقوم الذكاء الاصطناعي بتحليل ومطابقة وعرض فرص مرتبة فوراً.', fa: 'آنچه نیاز دارید را به زبان طبیعی توصیف کنید. هوش مصنوعی تجزیه، تطبیق و بازگشت فرصت‌های رتبه‌بندی شده فوری.', ku: 'ئەوەی پێویستە بە زمانى سروشتی وەسف بکە. زیرەکی دەستکرد دەپشکنێ، دەگونجێنێ و دەرفەتەکان بە ڕیز دەگەڕێنێتەوە.', tr: 'İhtiyacınızı doğal dilde tarif edin. AI ayrıştırır, eşleştirir ve anında sıralı fırsatlar döndürür.' },
  'agent.placeholder': { en: 'I need 5000 MT urea 46% from Oman, CIF Istanbul by Sept 15', ar: 'أحتاج ٥٠٠٠ طن يوريا ٤٦٪ من عمان، سيف اسطنبول بحلول ١٥ سبتمبر', fa: 'نیاز به ۵۰۰۰ تن اوره ۴۶٪ از عمان، CIF استانبول تا ۱۵ سپتامبر دارم', ku: 'پێویستم بە ٥٠٠٠ تۆن یوریا ٤٦٪ لە عۆمان، CIF ئیستانبول تا ١٥ ئەیلول', tr: '15 Eylül\'e kadar CIF İstanbul için Oman\'dan 5000 MT %46 üre istiyorum' },
  'agent.submit': { en: 'Ask AI Agent', ar: 'اسأل الوكيل الذكي', fa: 'از عامل هوش مصنوعی بپرس', ku: 'لە ئەیجێنتى زیرەک بپرسە', tr: 'AI Ajanına Sor' },

  // General
  'score': { en: 'Score', ar: 'الدرجة', fa: 'امتیاز', ku: 'نمره', tr: 'Puan' },
  'credits': { en: 'Credits', ar: 'اعتمادات', fa: 'اعتبارها', ku: 'کرێدیتەکان', tr: 'Krediler' },
  'unlock': { en: 'Unlock Contact', ar: 'كشف جهة الاتصال', fa: 'باز کردن تماس', ku: 'کەشفکردنی پەیوەندی', tr: 'İletişimi Aç' },
  'form.submit': { en: 'Submit', ar: 'إرسال', fa: 'ارسال', ku: 'ناردن', tr: 'Gönder' },
  'mock.success': { en: 'Action completed successfully (demo)', ar: 'تمت العملية بنجاح (عرض)', fa: 'عملیات با موفقیت انجام شد (دمو)', ku: 'کردارەکە بە سەرکەوتوویی تەواو بوو (دیمۆ)', tr: 'İşlem başarıyla tamamlandı (demo)' },
};

let currentLang: Language = 'ar';

export function getCurrentLang(): Language {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('lang') as Language | null;
    if (saved && languages.some(l => l.code === saved)) {
      currentLang = saved;
    }
  }
  return currentLang;
}

export function setLanguage(lang: Language) {
  currentLang = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem('lang', lang);
    document.documentElement.dir = languages.find(l => l.code === lang)?.dir || 'rtl';
    document.documentElement.lang = lang;
  }
}

export function t(key: string): string {
  const lang = getCurrentLang();
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] || entry['en'] || key;
}

export function useI18n() {
  const [lang, setLang] = useState<Language>(getCurrentLang());
  
  useEffect(() => {
    const dir = languages.find(l => l.code === lang)?.dir || 'rtl';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang]);

  const changeLang = (newLang: Language) => {
    setLang(newLang);
    setLanguage(newLang);
    // Force re-render on consumers
    window.dispatchEvent(new Event('languagechange'));
  };

  return { lang, changeLang, t: (key: string) => translations[key]?.[lang] || translations[key]?.en || key };
}
