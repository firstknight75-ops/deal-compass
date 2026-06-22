import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ديل كومباس AI+ — نظام تشغيل التجارة العالمية" },
      {
        name: "description",
        content:
          "محطة استخبارات تجارية واحدة تجمع رادار الفرص، التطبيع بالذكاء الاصطناعي، استخبارات العملاء، وأدوات التمويل التجاري للتجار عبر العراق وإيران وتركيا والاتحاد الأوروبي.",
      },
    ],
  }),
  component: Landing,
});

const engines = [
  { n: "01", title: "رادار الفرص", body: "زواحف مستمرة لغرف التجارة، المناقصات الحكومية، الموانئ، والأدلة الصناعية في 40+ دولة. تتدفق كل فرصة جديدة إلى المحطة خلال دقائق." },
  { n: "02", title: "التطبيع بالذكاء الاصطناعي", body: "تحويل البيانات الفوضوية متعددة اللغات إلى سجل قياسي: منتج، فئة، كمية، وحدة، عملة، إنكوترمز — جاهز للبحث والمقارنة." },
  { n: "03", title: "تسجيل الفرص", body: "درجة جودة 0–100 لكل فرصة تجمع اكتمال الحقول، موثوقية المصدر، وحداثة البيانات. لا مزيد من السماسرة الوهميين." },
  { n: "04", title: "استخبارات العملاء", body: "تكشف الاعتمادات عن صانع القرار الحقيقي: الاسم، الهاتف، البريد، والشركة — مع تاريخ النشاط التجاري والتحقق من العقوبات." },
  { n: "05", title: "استخبارات السوق", body: "أسعار حية، اتجاهات الممرات، أحجام الصادرات، ومنحنيات الطلب لكل سلعة وممر تجاري تعمل فيه." },
  { n: "06", title: "عميل التوريد الذكي", body: "اكتب طلبك بلغتك الطبيعية، ويعيد العميل قائمة مرتبة من الموردين المطابقين خلال ثوانٍ، مع أسباب المطابقة." },
];

const segments = [
  { tag: "أساسي", title: "تجار السلع", body: "تجار جملة عبر الحدود يديرون عشرات الصفقات شهريًا. يحتاجون تدفقًا ثابتًا من الفرص الموثقة وأدوات إغلاق سريعة." },
  { tag: "ثانوي", title: "المصنّعون والمنتجون", body: "مصانع تبحث عن قنوات تصدير مباشرة بدون وسطاء، مع رؤية واضحة لطلبات السوق وأسعارها." },
  { tag: "ثالثي", title: "المستوردون والموزعون", body: "موزعون محليون يحتاجون مصادر منتجات موثوقة بأسعار تنافسية وشحن مضمون." },
  { tag: "مؤسسي", title: "المشترون المؤسسيون", body: "حكومات وشركات كبرى تتطلب امتثالًا صارمًا، تكاملًا عبر API، واتفاقيات مستوى خدمة مخصصة." },
];

const lanes = [
  { route: "العراق ⇄ تركيا", note: "ممر نشط — حديد، إسمنت، أغذية" },
  { route: "إيران ⇄ العراق", note: "ممر نشط — بتروكيماويات، زراعة" },
  { route: "تركيا ⇄ الاتحاد الأوروبي", note: "ممر أولوية — منسوجات، تصنيع" },
  { route: "الخليج ⇄ شرق إفريقيا", note: "ممر توسع — سلع استهلاكية" },
  { route: "الصين ⇄ الشرق الأوسط", note: "ممر أولوية — إلكترونيات، معدات" },
  { route: "أوكرانيا ⇄ الشرق الأوسط", note: "ممر نشط — حبوب، زيوت" },
];

const tiers = [
  { name: "برونزي", price: "49$", per: "شهريًا", points: ["درجات الفرص مرئية", "10 اعتمادات شهريًا", "تنبيهات ذكية أساسية"] },
  { name: "فضي", price: "149$", per: "شهريًا", points: ["30 اعتماد شهريًا", "الوصول لما قبل الصفقة", "عميل ذكاء اصطناعي أساسي"] },
  { name: "ذهبي", price: "349$", per: "شهريًا", featured: true, points: ["100 اعتماد شهريًا", "استخبارات السوق الكاملة", "عمولة منصة مخفضة", "أولوية في قائمة ما قبل الصفقة"] },
  { name: "بلاتيني", price: "749$", per: "شهريًا", points: ["اعتمادات غير محدودة", "عميل ذكاء اصطناعي متقدم", "مدير حساب مخصص"] },
  { name: "أسود", price: "حسب الطلب", per: "للمؤسسات", points: ["وصول API كامل", "اتفاقية امتثال مخصصة", "خيار العلامة البيضاء"] },
];

function Landing() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="absolute top-0 right-0 left-0 z-20">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2 font-display text-lg font-extrabold text-paper">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-gold" />
            ديل<span className="gold-text">كومباس</span>
          </div>
          <ul className="hidden items-center gap-8 text-sm text-paper/70 md:flex">
            <li><a href="#engines" className="transition hover:text-gold">المحركات</a></li>
            <li><a href="#segments" className="transition hover:text-gold">المستخدمون</a></li>
            <li><a href="#lanes" className="transition hover:text-gold">الممرات</a></li>
            <li><a href="#pricing" className="transition hover:text-gold">الأسعار</a></li>
          </ul>
          <a href="#cta" className="rounded-full border border-gold/40 bg-gold/10 px-5 py-2 text-sm font-semibold text-gold transition hover:bg-gold hover:text-ink">
            ابدأ تجربتك
          </a>
        </nav>
      </header>

      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[var(--ink-deep)] px-6 pt-32 pb-24 text-paper">
        <div className="grid-bg absolute inset-0 opacity-60" />
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }} />
        <div className="relative mx-auto w-full max-w-6xl">
          <div className="chip mb-8">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
            الإصدار 2026 · محطة الاستخبارات التجارية
          </div>
          <h1 className="max-w-4xl font-display text-5xl leading-[1.05] font-black tracking-tight md:text-7xl lg:text-8xl">
            نظام تشغيل
            <br />
            <span className="gold-text">التجارة العالمية</span>.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-paper/65 md:text-xl">
            ست محركات ذكاء اصطناعي تحت محطة واحدة. اكتشف الفرص، تحقّق من الموردين، وأغلق الصفقات عبر الحدود — من العراق وإيران وتركيا إلى الاتحاد الأوروبي والعالم.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <a href="#cta" className="rounded-full bg-gold px-8 py-4 text-sm font-bold text-ink shadow-[0_20px_60px_-20px_var(--gold)] transition hover:scale-[1.02] hover:bg-gold-dim">
              اطلب وصولًا مبكرًا ←
            </a>
            <a href="#engines" className="rounded-full border border-paper/20 px-8 py-4 text-sm font-semibold text-paper/80 transition hover:border-gold hover:text-gold">
              استكشف المحركات الست
            </a>
          </div>
          <div className="mt-24 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-paper/10 pt-10 md:grid-cols-4">
            {[["40+", "دولة مغطاة"], ["6", "محركات ذكاء"], ["5", "ممرات أولوية"], ["72س", "دورة ما قبل الصفقة"]].map(([k, v]) => (
              <div key={v}>
                <div className="font-display text-3xl font-extrabold gold-text md:text-4xl">{k}</div>
                <div className="mt-2 text-xs tracking-wider text-paper/50 uppercase">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-paper px-6 py-28">
        <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="chip mb-6">المشكلة</div>
            <h2 className="font-display text-4xl leading-tight font-extrabold md:text-5xl">
              ما يواجهه التجار<br />عبر الحدود اليوم.
            </h2>
          </div>
          <div className="space-y-8 md:col-span-7">
            {[
              ["فرص مبعثرة", "آلاف المناقصات والطلبات موزعة على غرف تجارة وأدلة لا يطّلع عليها أحد."],
              ["موردون غير موثوقين", "وسطاء وهميون، عقوبات غير مفحوصة، وشركات بدون سجل تجاري حقيقي."],
              ["لا توجد استخبارات أسعار", "أنت تتفاوض في الظلام بدون مرجع لأسعار السوق الحالية أو حجم الطلب."],
              ["أدوات تمويل مفقودة", "إدارة الاعتمادات المستندية والتحصيل المستندي ما زالت تتم عبر البريد الإلكتروني."],
            ].map(([t, b]) => (
              <div key={t} className="border-r-2 border-gold pr-6">
                <h3 className="font-display text-xl font-bold">{t}</h3>
                <p className="mt-2 text-muted-foreground">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="engines" className="bg-[var(--ink)] px-6 py-32 text-paper">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="chip mb-6">المحركات</div>
              <h2 className="max-w-2xl font-display text-4xl leading-tight font-extrabold md:text-6xl">
                ستة محركات استخبارات<br /><span className="gold-text">تحت محطة واحدة.</span>
              </h2>
            </div>
            <p className="max-w-md text-paper/60">ليست منصة تسويق، ولا سوقًا إلكترونيًا — بل محطة عمل احترافية للتجار الجادين.</p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-paper/10 bg-paper/10 md:grid-cols-2 lg:grid-cols-3">
            {engines.map((e) => (
              <div key={e.n} className="group relative bg-[var(--ink)] p-8 transition hover:bg-[var(--ink-deep)]">
                <div className="font-mono text-xs text-gold">ENGINE {e.n}</div>
                <h3 className="mt-4 font-display text-2xl font-bold transition group-hover:text-gold">{e.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-paper/60">{e.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="segments" className="bg-paper px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="chip mb-6">المستخدمون</div>
          <h2 className="max-w-3xl font-display text-4xl leading-tight font-extrabold md:text-5xl">
            مبنيّ لمن يحرّك التجارة فعلًا.
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {segments.map((s) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-8 transition hover:-translate-y-1 hover:border-gold hover:shadow-[var(--shadow-elegant)]">
                <div className="text-xs font-bold tracking-widest text-emerald uppercase">{s.tag}</div>
                <h3 className="mt-3 font-display text-2xl font-bold">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="lanes" className="relative overflow-hidden bg-[var(--ink-deep)] px-6 py-28 text-paper">
        <div className="grid-bg absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-12">
            <div className="chip mb-6">الممرات الجغرافية</div>
            <h2 className="font-display text-4xl leading-tight font-extrabold md:text-5xl">
              ممرات نشطة <span className="gold-text">وأخرى ذات أولوية</span>.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lanes.map((l) => (
              <div key={l.route} className="flex flex-col gap-3 rounded-xl border border-paper/10 bg-paper/5 p-6 backdrop-blur transition hover:border-gold/60">
                <div className="font-display text-xl font-bold">{l.route}</div>
                <div className="text-sm text-paper/55">{l.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-paper px-6 py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <div className="chip mb-6">العضويات</div>
            <h2 className="font-display text-4xl leading-tight font-extrabold md:text-5xl">
              خمسة مستويات. <span className="gold-text">اقتصاد اعتمادات واحد</span>.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
              كل اعتماد يكشف تفاصيل اتصال صانع قرار واحد موثّق. ادفع مقابل القيمة، لا مقابل التصفح.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {tiers.map((t) => (
              <div key={t.name} className={`relative flex flex-col rounded-2xl border p-7 transition ${
                t.featured ? "border-gold bg-[var(--ink)] text-paper shadow-[var(--shadow-gold)] lg:-translate-y-3" : "border-border bg-card hover:border-gold/60"
              }`}>
                {t.featured && (
                  <div className="absolute -top-3 right-6 rounded-full bg-gold px-3 py-1 text-[10px] font-bold tracking-wider text-ink uppercase">
                    الأكثر شيوعًا
                  </div>
                )}
                <div className="font-display text-lg font-bold">{t.name}</div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className={`font-display text-3xl font-extrabold ${t.featured ? "gold-text" : ""}`}>{t.price}</span>
                  <span className={`text-xs ${t.featured ? "text-paper/50" : "text-muted-foreground"}`}>{t.per}</span>
                </div>
                <ul className={`mt-6 space-y-3 text-sm ${t.featured ? "text-paper/80" : "text-muted-foreground"}`}>
                  {t.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="text-gold">◆</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cta" className="relative overflow-hidden bg-[var(--ink)] px-6 py-32 text-paper">
        <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(ellipse at center, var(--gold) 0%, transparent 60%)" }} />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="chip mx-auto mb-8">ابدأ الآن</div>
          <h2 className="font-display text-4xl leading-[1.1] font-black md:text-6xl">
            توقّف عن التفاوض في الظلام.<br />
            <span className="gold-text">تداول بضوء كامل.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-paper/65">
            انضم إلى قائمة الوصول المبكر. المقاعد الأولى محجوزة للتجار العاملين في ممرات العراق، إيران، تركيا، والاتحاد الأوروبي.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
            <input type="email" required placeholder="بريدك الإلكتروني التجاري"
              className="flex-1 rounded-full border border-paper/20 bg-paper/5 px-5 py-3.5 text-sm text-paper placeholder:text-paper/40 outline-none transition focus:border-gold" />
            <button type="submit" className="rounded-full bg-gold px-6 py-3.5 text-sm font-bold text-ink transition hover:scale-[1.02] hover:bg-gold-dim">
              انضم ←
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-paper/10 bg-[var(--ink-deep)] px-6 py-12 text-paper/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-sm md:flex-row">
          <div className="font-display font-bold text-paper">
            ديل<span className="gold-text">كومباس</span> AI+
          </div>
          <div className="text-xs">© 2026 DealCompass. جميع الحقوق محفوظة.</div>
          <div className="flex gap-6 text-xs">
            <a href="#" className="transition hover:text-gold">الخصوصية</a>
            <a href="#" className="transition hover:text-gold">الشروط</a>
            <a href="#" className="transition hover:text-gold">تواصل</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
