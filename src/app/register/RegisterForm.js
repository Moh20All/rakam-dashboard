'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Gift, Loader2, MessageCircle, Store, MapPin, Sparkles } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { WILAYAS, COMMUNES } from '@/lib/places';
import { CONTACT_WHATSAPP } from '@/lib/offer';
import { registerAction } from './actions';

const T = {
  fr: {
    eyebrow: 'Inscription & précommande',
    title: 'Réservez Warshati pour votre atelier',
    lede: 'Remplissez ce formulaire en 1 minute. On vous appelle pour l’installation.',
    offer: (n) => `Les ${n} premiers ateliers inscrits auront Warshati gratuitement.`,
    left: (n) => (n > 0 ? `Encore ${n} place${n > 1 ? 's' : ''} gratuite${n > 1 ? 's' : ''}` : 'Les places gratuites sont parties : inscrivez-vous pour la précommande'),
    s_shop: 'Votre atelier', s_place: 'Où êtes-vous ?', s_more: 'Pour mieux vous aider',
    shop_name: 'Nom de l’atelier', shop_ph: 'ex. Atelier Phone Bab Ezzouar',
    owner_name: 'Votre nom et prénom', phone: 'Téléphone (WhatsApp)', email: 'E-mail (facultatif)',
    wilaya: 'Wilaya', wilaya_pick: 'Choisir la wilaya', commune: 'Commune', commune_pick: 'Choisir la commune', commune_first: 'Choisissez d’abord la wilaya',
    address: 'Adresse (facultatif)', address_ph: 'Rue, quartier, repère…',
    pcs: 'Nombre de PC dans l’atelier', tool: 'Aujourd’hui, vous gérez avec…',
    tools: { notebook: 'Un cahier', excel: 'Excel', software: 'Un autre logiciel', nothing: 'Rien pour l’instant' },
    message: 'Un message ? (facultatif)', message_ph: 'Ce dont vous avez besoin, vos questions…',
    submit: 'Réserver ma place', sending: 'Envoi…', required: '* obligatoire',
    privacy: 'Vos informations servent uniquement à vous contacter pour Warshati.',
    errors: {
      required: 'Remplissez le nom de l’atelier et votre nom.', phone: 'Numéro de téléphone algérien invalide (ex. 0555 12 34 56).',
      place: 'Choisissez votre wilaya et votre commune.', email: 'Adresse e-mail invalide.',
      limit: 'Trop d’inscriptions depuis cette connexion. Réessayez dans une heure.', server: 'Un problème est survenu. Réessayez dans un instant.',
    },
    done_title: 'C’est noté, merci !', done_already: 'Vous êtes déjà inscrit, merci !',
    done_pos: (n) => `Vous êtes l’atelier n° ${n}.`,
    done_free: 'Vous faites partie des premiers : Warshati sera gratuit pour vous.',
    done_paid: 'Votre précommande est enregistrée. On vous contacte très vite.',
    done_next: 'On vous appelle dans les prochains jours pour installer Warshati avec vous.',
    done_wa: 'Écrire sur WhatsApp', wa_text: (shop) => `Bonjour, je viens de m'inscrire sur Warshati (${shop}).`,
    home: 'Retour au site',
  },
  ar: {
    eyebrow: 'التسجيل والطلب المسبق',
    title: 'احجز ورشتي لمحلك',
    lede: 'املأ هذه الاستمارة في دقيقة واحدة، ونتصل بك لتثبيت البرنامج.',
    offer: (n) => `أول ${n} محل يسجّل يحصل على ورشتي مجاناً.`,
    left: (n) => (n > 0 ? `بقي ${n} مكان مجاني` : 'انتهت الأماكن المجانية: سجّل للطلب المسبق'),
    s_shop: 'محلك', s_place: 'أين تقع؟', s_more: 'لنساعدك أكثر',
    shop_name: 'اسم المحل', shop_ph: 'مثال: محل الهاتف باب الزوار',
    owner_name: 'الاسم واللقب', phone: 'رقم الهاتف (واتساب)', email: 'البريد الإلكتروني (اختياري)',
    wilaya: 'الولاية', wilaya_pick: 'اختر الولاية', commune: 'البلدية', commune_pick: 'اختر البلدية', commune_first: 'اختر الولاية أولاً',
    address: 'العنوان (اختياري)', address_ph: 'الشارع، الحي، معلم قريب…',
    pcs: 'عدد الحواسيب في المحل', tool: 'حالياً تسيّر محلك بـ…',
    tools: { notebook: 'كراس', excel: 'Excel', software: 'برنامج آخر', nothing: 'لا شيء حالياً' },
    message: 'رسالة؟ (اختياري)', message_ph: 'ما تحتاجه، أسئلتك…',
    submit: 'احجز مكاني', sending: 'جارٍ الإرسال…', required: '* إجباري',
    privacy: 'معلوماتك تُستعمل فقط للتواصل معك بخصوص ورشتي.',
    errors: {
      required: 'اكتب اسم المحل واسمك.', phone: 'رقم هاتف جزائري غير صحيح (مثال: 0555 12 34 56).',
      place: 'اختر الولاية والبلدية.', email: 'البريد الإلكتروني غير صحيح.',
      limit: 'تسجيلات كثيرة من هذا الاتصال. أعد المحاولة بعد ساعة.', server: 'حدث خطأ. أعد المحاولة بعد قليل.',
    },
    done_title: 'تم التسجيل، شكراً!', done_already: 'أنت مسجّل من قبل، شكراً!',
    done_pos: (n) => `أنت المحل رقم ${n}.`,
    done_free: 'أنت من الأوائل: ورشتي سيكون مجانياً لك.',
    done_paid: 'تم تسجيل طلبك المسبق. سنتصل بك قريباً.',
    done_next: 'نتصل بك خلال الأيام القادمة لنثبّت ورشتي معك.',
    done_wa: 'راسلنا على واتساب', wa_text: (shop) => `السلام عليكم، سجّلت للتو في ورشتي (${shop}).`,
    home: 'العودة إلى الموقع',
  },
  en: {
    eyebrow: 'Register & pre-order',
    title: 'Reserve Warshati for your workshop',
    lede: 'Fill in this form in 1 minute. We will call you to set it up.',
    offer: (n) => `The first ${n} workshops to sign up get Warshati for free.`,
    left: (n) => (n > 0 ? `${n} free spot${n > 1 ? 's' : ''} left` : 'The free spots are gone: sign up to pre-order'),
    s_shop: 'Your workshop', s_place: 'Where are you?', s_more: 'To help you better',
    shop_name: 'Workshop name', shop_ph: 'e.g. Atelier Phone Bab Ezzouar',
    owner_name: 'Your full name', phone: 'Phone (WhatsApp)', email: 'Email (optional)',
    wilaya: 'Wilaya', wilaya_pick: 'Choose the wilaya', commune: 'Commune', commune_pick: 'Choose the commune', commune_first: 'Choose the wilaya first',
    address: 'Address (optional)', address_ph: 'Street, area, landmark…',
    pcs: 'Number of PCs in the shop', tool: 'Today you manage with…',
    tools: { notebook: 'A notebook', excel: 'Excel', software: 'Another software', nothing: 'Nothing yet' },
    message: 'A message? (optional)', message_ph: 'What you need, your questions…',
    submit: 'Reserve my spot', sending: 'Sending…', required: '* required',
    privacy: 'Your details are only used to contact you about Warshati.',
    errors: {
      required: 'Enter the workshop name and your name.', phone: 'Not a valid Algerian phone number (e.g. 0555 12 34 56).',
      place: 'Choose your wilaya and commune.', email: 'Not a valid email address.',
      limit: 'Too many sign-ups from this connection. Try again in an hour.', server: 'Something went wrong. Try again in a moment.',
    },
    done_title: 'Got it, thank you!', done_already: 'You are already signed up, thank you!',
    done_pos: (n) => `You are workshop no. ${n}.`,
    done_free: 'You are one of the first: Warshati will be free for you.',
    done_paid: 'Your pre-order is saved. We will contact you very soon.',
    done_next: 'We will call you in the coming days to set Warshati up with you.',
    done_wa: 'Message us on WhatsApp', wa_text: (shop) => `Hello, I just signed up for Warshati (${shop}).`,
    home: 'Back to the website',
  },
};

const LANGS = [['fr', 'FR'], ['ar', 'ع'], ['en', 'EN']];

export default function RegisterForm({ initialLang, freeSpots, spotsLeft }) {
  const [lang, setLang] = useState(initialLang);
  const [wilaya, setWilaya] = useState('');
  const [pcs, setPcs] = useState(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);
  const t = T[lang];
  const ar = lang === 'ar';
  const communes = useMemo(() => (wilaya ? COMMUNES[wilaya] || [] : []), [wilaya]);

  function switchLang(l) {
    setLang(l);
    try { history.replaceState(null, '', `?lang=${l}`); } catch {}
  }

  async function submit(e) {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget));
    setPending(true);
    setError(null);
    let res;
    try {
      res = await registerAction({ ...form, pcs, lang });
    } catch {
      res = { error: 'server' };
    }
    setPending(false);
    if (res?.ok) setDone({ ...res, shop: form.shop_name });
    else {
      setError(res?.error || 'server');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <div dir={ar ? 'rtl' : 'ltr'} lang={lang} className={`min-h-screen bg-background ${ar ? 'font-arabic' : ''}`}>
      {/* Graphite header with the launch offer */}
      <header className="relative overflow-hidden bg-inverse text-inverse-foreground">
        <div className="pointer-events-none absolute -top-24 -end-24 size-72 rounded-full bg-flux/15" aria-hidden />
        <div className="relative mx-auto max-w-2xl px-5 pt-5 pb-8">
          <div className="flex items-center justify-between">
            <a href="/" aria-label="Warshati"><Logo /></a>
            <div className="flex gap-1" role="group" aria-label="Language">
              {LANGS.map(([k, label]) => (
                <button key={k} onClick={() => switchLang(k)} aria-pressed={lang === k}
                  className={`h-8 min-w-9 rounded-sm px-2 text-[13px] font-semibold transition-colors ${lang === k ? 'bg-flux text-flux-foreground' : 'text-inverse-foreground/80 hover:bg-inverse-raised'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[.08em] text-flux rtl:normal-case rtl:tracking-normal">{t.eyebrow}</p>
          <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-tight sm:text-[34px]">{t.title}</h1>
          <p className="mt-2 text-[15px] text-inverse-foreground/80">{t.lede}</p>
          <div className="mt-5 flex items-start gap-3 rounded-md bg-flux px-4 py-3 text-flux-foreground">
            <Gift className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">{t.offer(freeSpots)}</p>
              <p className="text-sm opacity-80">{t.left(spotsLeft)}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-6">
        {done ? <Done t={t} done={done} lang={lang} /> : (
          <form onSubmit={submit} className="space-y-5">
            {error && <div role="alert" className="rounded-md bg-destructive-soft px-4 py-3 text-sm font-medium text-destructive-soft-foreground">{t.errors[error] || t.errors.server}</div>}

            {/* Bots fill every field; people never see this one */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="absolute -start-[9999px] h-0 w-0 opacity-0" aria-hidden />

            <Section icon={Store} title={t.s_shop}>
              <Field label={`${t.shop_name} *`}><input name="shop_name" required maxLength={120} className="input" placeholder={t.shop_ph} /></Field>
              <Field label={`${t.owner_name} *`}><input name="owner_name" required maxLength={120} className="input" autoComplete="name" /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={`${t.phone} *`}><input name="phone" required type="tel" inputMode="tel" dir="ltr" className="input text-start" placeholder="0555 12 34 56" autoComplete="tel" /></Field>
                <Field label={t.email}><input name="email" type="email" dir="ltr" className="input text-start" autoComplete="email" /></Field>
              </div>
            </Section>

            <Section icon={MapPin} title={t.s_place}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={`${t.wilaya} *`}>
                  <select name="wilaya" required className="input" value={wilaya} onChange={(e) => setWilaya(e.target.value)}>
                    <option value="">{t.wilaya_pick}</option>
                    {WILAYAS.map(([code, name, arName]) => (
                      <option key={code} value={code}>{String(code).padStart(2, '0')} · {ar ? arName : name}</option>
                    ))}
                  </select>
                </Field>
                <Field label={`${t.commune} *`}>
                  <select key={wilaya} name="commune" required disabled={!wilaya} className="input disabled:opacity-60" defaultValue="">
                    <option value="">{wilaya ? t.commune_pick : t.commune_first}</option>
                    {communes.map(([name, arName]) => <option key={name} value={name}>{ar ? arName : name}</option>)}
                  </select>
                </Field>
              </div>
              <Field label={t.address}><input name="address" maxLength={200} className="input" placeholder={t.address_ph} /></Field>
            </Section>

            <Section icon={Sparkles} title={t.s_more}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="label">{t.pcs}</span>
                  <div className="flex h-10 items-center rounded-md border border-input bg-card" dir="ltr">
                    <button type="button" className="h-full px-4 text-lg font-semibold text-mute hover:text-ink" onClick={() => setPcs(Math.max(1, pcs - 1))} aria-label="−">−</button>
                    <span className="flex-1 text-center font-semibold tnum">{pcs}</span>
                    <button type="button" className="h-full px-4 text-lg font-semibold text-mute hover:text-ink" onClick={() => setPcs(Math.min(10, pcs + 1))} aria-label="+">+</button>
                  </div>
                </div>
                <Field label={t.tool}>
                  <select name="current_tool" className="input" defaultValue="">
                    <option value="">—</option>
                    {Object.entries(t.tools).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                  </select>
                </Field>
              </div>
              <Field label={t.message}><textarea name="message" rows={3} maxLength={1000} className="input" placeholder={t.message_ph} /></Field>
            </Section>

            <button type="submit" disabled={pending} className="btn btn-flux h-12 w-full text-base">
              {pending ? <><Loader2 className="size-4 animate-spin" /> {t.sending}</> : t.submit}
            </button>
            <p className="text-center text-xs text-faint">{t.required} · {t.privacy}</p>
          </form>
        )}
      </main>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="card space-y-4 p-5">
      <h2 className="flex items-center gap-2 font-semibold"><Icon className="size-4 text-primary" /> {title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

function Done({ t, done, lang }) {
  const wa = `https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(t.wa_text(done.shop || ''))}`;
  return (
    <div className="card overflow-hidden" style={{ animation: 'pop-in .25s ease-out' }}>
      <div className="flex items-center gap-3.5 bg-inverse px-6 py-5 text-inverse-foreground">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-flux text-flux-foreground"><CheckCircle2 className="size-6" /></span>
        <div>
          <h2 className="text-xl font-bold">{done.already ? t.done_already : t.done_title}</h2>
          {done.position > 0 && <p className="text-sm text-inverse-foreground/80">{t.done_pos(done.position)}</p>}
        </div>
      </div>
      <div className="space-y-4 p-6">
        {done.position > 0 && (
          <p className={`rounded-sm border-2 border-dashed px-4 py-3 font-semibold ${done.free ? 'border-flux-soft-foreground bg-flux-soft text-flux-soft-foreground' : 'border-line bg-muted'}`}>
            {done.free ? t.done_free : t.done_paid}
          </p>
        )}
        <p className="text-sm text-mute">{t.done_next}</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a href={wa} target="_blank" rel="noreferrer" className="btn btn-whatsapp"><MessageCircle className="size-4" /> {t.done_wa}</a>
          <a href={`/?lang=${lang}`} className="btn btn-ghost">{t.home}</a>
        </div>
      </div>
    </div>
  );
}
