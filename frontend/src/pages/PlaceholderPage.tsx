import { Construction, ArrowRight } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useI18n, type TranslationKey } from '@/i18n'

interface PlaceholderPageProps {
  titleKey: TranslationKey
  parentKey?: TranslationKey
}

export default function PlaceholderPage({ titleKey, parentKey }: PlaceholderPageProps) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const params = useParams()
  const detailName = params.slug?.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')

  return (
    <div className="mx-auto flex min-h-[calc(100vh-112px)] w-full max-w-[1120px] items-center justify-center">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
          <Construction size={22} />
        </div>
        {parentKey && <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">{t(parentKey)}</p>}
        <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-slate-950">
          {detailName || t(titleKey)}
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-[14px] leading-relaxed text-slate-500">{t('page.placeholder.subtitle')}</p>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm shadow-violet-600/20 transition-colors hover:bg-violet-700"
        >
          {t('nav.executiveOverview')}
          <ArrowRight size={14} />
        </button>
      </section>
    </div>
  )
}
