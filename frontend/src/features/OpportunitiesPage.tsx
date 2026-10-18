import { useEffect, useMemo, useState } from 'react'
import { Search, ExternalLink, X, RefreshCw, GraduationCap, MapPin, CalendarDays, ShieldCheck, BriefcaseBusiness } from 'lucide-react'
import { api, type StudentProfileData, type OpportunityItem, type OpportunityMatchItem } from '../api/client'
import type { Lang } from '../i18n'

type Props = { student: StudentProfileData | null; matched: OpportunityMatchItem[]; lang: Lang; onCompleteProfile: () => void }
const categories = [
  ['all', 'All opportunities'], ['scholarship', 'Scholarships'], ['course', 'Courses'],
  ['internship', 'Internships'], ['apprenticeship', 'Apprenticeships'],
  ['government_scheme', 'Government schemes'], ['competition', 'Competitions'],
]
const label = (lang: Lang, en: string, hi: string) => lang === 'hi' ? hi : en
const validDate = (value?: string | null) => { if (!value) return null; const d = new Date(value); return Number.isNaN(d.getTime()) ? null : d }
const safeUrl = (value?: string) => { try { const u = new URL(value || ''); return ['https:', 'http:'].includes(u.protocol) ? u.toString() : '' } catch { return '' } }

export default function OpportunitiesPage({ student, matched, lang, onCompleteProfile }: Props) {
  const [records, setRecords] = useState<OpportunityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [education, setEducation] = useState('all')
  const [location, setLocation] = useState('all')
  const [deadlineFilter, setDeadlineFilter] = useState('all')
  const [selected, setSelected] = useState<OpportunityItem | null>(null)

  const load = async () => {
    setLoading(true); setError('')
    try { setRecords(await api.listOpportunities()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load opportunities.') }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])

  const locations = useMemo(() => [...new Set(records.flatMap(o => o.domicile_states || []).filter(v => v && v.toLowerCase() !== 'all'))].sort(), [records])
  const filtered = useMemo(() => records.filter(o => {
    const text = `${o.title} ${o.provider} ${o.description} ${o.type}`.toLowerCase()
    if (query.trim() && !text.includes(query.trim().toLowerCase())) return false
    if (category !== 'all' && o.type.toLowerCase() !== category) return false
    if (education !== 'all' && !(o.eligible_education_levels || ['all']).some(v => v.toLowerCase() === 'all' || v.toLowerCase().includes(education))) return false
    if (location !== 'all' && !(o.domicile_states || ['all']).some(v => v.toLowerCase() === 'all' || v.toLowerCase() === location.toLowerCase())) return false
    const d = validDate(o.deadline)
    const now = new Date(); const soon = new Date(); soon.setDate(now.getDate() + 14)
    if (deadlineFilter === 'open' && (!d || d < now)) return false
    if (deadlineFilter === 'soon' && (!d || d < now || d > soon)) return false
    if (deadlineFilter === 'expired' && (!d || d >= now)) return false
    if (deadlineFilter === 'unknown' && d) return false
    return true
  }), [records, query, category, education, location, deadlineFilter])

  const clearFilters = () => { setQuery(''); setCategory('all'); setEducation('all'); setLocation('all'); setDeadlineFilter('all') }
  const matchFor = (id: number) => matched.find(m => m.opportunity.id === id)
  const deadlineLabel = (value?: string) => {
    const d = validDate(value)
    if (!d) return label(lang, 'Deadline not specified', 'अंतिम तिथि उपलब्ध नहीं')
    return d < new Date() ? label(lang, 'Expired', 'समय सीमा समाप्त') : `${label(lang, 'Deadline', 'अंतिम तिथि')}: ${d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }

  return <section className="feature-page">
    <header className="feature-hero opportunities-hero">
      <div className="feature-hero-copy"><span className="feature-eyebrow">{label(lang, 'FIND YOUR NEXT STEP', 'अपना अगला कदम चुनें')}</span>
        <h1>{label(lang, 'Opportunities & Scholarships', 'अवसर और छात्रवृत्तियाँ')}</h1>
        <p>{label(lang, 'Explore scholarships, courses and work opportunities that can help you move forward.', 'छात्रवृत्तियों, कोर्स और काम के अवसरों को खोजें जो आपको आगे बढ़ने में मदद करें।')}</p>
      </div>
      <div className="feature-hero-art" aria-hidden="true">✳</div>
    </header>

    {student && matched.length > 0 && <section className="feature-recommendations">
      <div><span className="feature-kicker">{label(lang, 'PROFILE MATCH', 'आपकी प्रोफ़ाइल से मेल')}</span><h2>{label(lang, 'Recommended for you', 'आपके लिए सुझाव')}</h2></div>
      <p>{label(lang, 'Based on the profile you shared. Eligibility is preliminary; review each requirement.', 'आपकी प्रोफ़ाइल के आधार पर। पात्रता प्रारंभिक है; हर शर्त जाँचें।')}</p>
      <div className="feature-match-list">{matched.slice(0, 3).map(m => <button key={m.opportunity.id} className="feature-match-item" onClick={() => setSelected(m.opportunity)}><strong>{m.opportunity.title}</strong><span>{m.opportunity.provider}</span><em>{m.eligibility_status.replaceAll('_', ' ').toLowerCase()}</em></button>)}</div>
    </section>}

    <div className="feature-search-row"><label className="feature-search"><Search size={19}/><span className="sr-only">{label(lang, 'Search opportunities', 'अवसर खोजें')}</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder={label(lang, 'Search by title, provider or keyword', 'शीर्षक, संस्था या शब्द से खोजें')}/></label>
      <button className="feature-reset" onClick={clearFilters}>{label(lang, 'Reset filters', 'फ़िल्टर हटाएँ')}</button></div>
    <div className="feature-categories" role="group" aria-label="Opportunity category">{categories.map(([value, name]) => <button key={value} className={category === value ? 'selected' : ''} onClick={() => setCategory(value)}>{label(lang, name, ({all:'सभी अवसर', scholarship:'छात्रवृत्तियाँ', course:'कोर्स', internship:'इंटर्नशिप', apprenticeship:'अप्रेंटिसशिप', government_scheme:'सरकारी योजनाएँ', competition:'प्रतियोगिताएँ'} as Record<string,string>)[value])}</button>)}</div>
    <div className="feature-filters">
      <label>{label(lang, 'Education level', 'शिक्षा स्तर')}<select value={education} onChange={e => setEducation(e.target.value)}><option value="all">{label(lang, 'All levels', 'सभी स्तर')}</option><option value="9">{label(lang, 'Class 9–10', 'कक्षा 9–10')}</option><option value="10th">{label(lang, 'Class 10 pass', 'कक्षा 10 उत्तीर्ण')}</option><option value="12th">{label(lang, 'Class 12 pass', 'कक्षा 12 उत्तीर्ण')}</option><option value="undergraduate">{label(lang, 'Undergraduate', 'स्नातक')}</option><option value="postgraduate">{label(lang, 'Postgraduate', 'स्नातकोत्तर')}</option></select></label>
      <label>{label(lang, 'State / region', 'राज्य / क्षेत्र')}<select value={location} onChange={e => setLocation(e.target.value)}><option value="all">{label(lang, 'All regions', 'सभी क्षेत्र')}</option>{locations.map(v => <option key={v}>{v}</option>)}</select></label>
      <label>{label(lang, 'Deadline', 'अंतिम तिथि')}<select value={deadlineFilter} onChange={e => setDeadlineFilter(e.target.value)}><option value="all">{label(lang, 'All deadlines', 'सभी')}</option><option value="open">{label(lang, 'Open, future deadline', 'समय बाकी है')}</option><option value="soon">{label(lang, 'Closing within 14 days', '14 दिनों में बंद')}</option><option value="expired">{label(lang, 'Expired', 'समय सीमा समाप्त')}</option><option value="unknown">{label(lang, 'Not specified', 'उल्लेख नहीं')}</option></select></label>
    </div>
    <div className="feature-results-heading"><div><h2>{label(lang, 'Explore opportunities', 'अवसर खोजें')}</h2><p>{loading ? label(lang, 'Loading opportunities…', 'अवसर लोड हो रहे हैं…') : `${filtered.length} ${label(lang, 'opportunities', 'अवसर')}`}</p></div></div>
    {loading ? <div className="feature-card-grid">{[1,2,3].map(n => <div className="feature-skeleton" key={n}/>)}</div> :
      error ? <div className="feature-state" role="alert"><h3>{label(lang, 'We could not load opportunities', 'अवसर लोड नहीं हो सके')}</h3><p>{error}</p><button className="feature-button" onClick={() => void load()}><RefreshCw size={16}/> {label(lang, 'Try again', 'फिर कोशिश करें')}</button></div> :
      filtered.length === 0 ? <div className="feature-state"><BriefcaseBusiness size={34}/><h3>{records.length ? label(lang, 'No matches for these filters', 'इन फ़िल्टर से कोई अवसर नहीं मिला') : label(lang, 'No opportunities available yet', 'अभी कोई अवसर उपलब्ध नहीं है')}</h3><p>{records.length ? label(lang, 'Try another search or reset your filters.', 'दूसरी खोज करें या फ़िल्टर हटाएँ।') : label(lang, 'Please check again later. No sample opportunities are shown as real.', 'कृपया बाद में फिर देखें। यहाँ नकली अवसर नहीं दिखाए जाते।')}</p><button className="feature-reset" onClick={clearFilters}>{label(lang, 'Clear filters', 'फ़िल्टर हटाएँ')}</button></div> :
      <div className="feature-card-grid">{filtered.map(o => { const m = matchFor(o.id); const url = safeUrl(o.official_portal_url); return <article className="feature-opportunity-card" key={o.id}>
        <div className="feature-card-top"><span className="feature-type">{(categories.find(c => c[0] === o.type.toLowerCase())?.[1]) || o.type.replaceAll('_',' ')}</span>{m && <span className={`feature-eligibility ${m.eligibility_status.toLowerCase()}`}>{m.eligibility_status.replaceAll('_',' ').toLowerCase()}</span>}</div>
        <h3>{o.title}</h3><p className="feature-provider">{o.provider}</p><p className="feature-description">{o.description || label(lang, 'Description not specified.', 'विवरण उपलब्ध नहीं।')}</p>
        <div className="feature-meta"><span><CalendarDays size={16}/>{deadlineLabel(o.deadline)}</span>{o.domicile_states?.length > 0 && <span><MapPin size={16}/>{o.domicile_states.includes('all') ? label(lang, 'All India', 'पूरे भारत में') : o.domicile_states.join(', ')}</span>}</div>
        {m && <div className="feature-eligibility-note"><ShieldCheck size={16}/><span>{m.reasons?.length ? m.reasons.join(' · ') : label(lang, 'Check all eligibility requirements before applying.', 'आवेदन से पहले सभी पात्रता शर्तें जाँचें।')}</span></div>}
        {o.verification_date && <p className="feature-verified">{label(lang, 'Source check date', 'स्रोत जाँच तिथि')}: {o.verification_date}{o.verified_by ? ` · ${o.verified_by}` : ''}</p>}
        <div className="feature-card-actions"><button className="feature-button secondary" onClick={() => setSelected(o)}>{label(lang, 'Details', 'विवरण')}</button>{url && <a className="feature-button" href={url} target="_blank" rel="noopener noreferrer">{label(lang, 'Official portal', 'आधिकारिक पोर्टल')} <ExternalLink size={15}/></a>}</div>
      </article> })}</div>}
    {!student && <div className="feature-profile-prompt"><GraduationCap size={22}/><div><strong>{label(lang, 'Get personalised matches', 'अपने लिए सुझाव पाएँ')}</strong><p>{label(lang, 'Complete your student profile to check opportunities against your details.', 'अपनी जानकारी के अनुसार अवसर देखने के लिए छात्र प्रोफ़ाइल पूरी करें।')}</p></div><button className="feature-button" onClick={onCompleteProfile}>{label(lang, 'Complete profile', 'प्रोफ़ाइल पूरी करें')}</button></div>}
    {selected && <div className="feature-modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null) }}><section className="feature-modal" role="dialog" aria-modal="true" aria-labelledby="opp-detail-title"><button className="feature-modal-close" aria-label={label(lang,'Close details','विवरण बंद करें')} onClick={() => setSelected(null)}><X size={20}/></button><span className="feature-type">{selected.type.replaceAll('_',' ')}</span><h2 id="opp-detail-title">{selected.title}</h2><p className="feature-provider">{selected.provider}</p><p>{selected.description}</p><h3>{label(lang, 'Eligibility and requirements', 'पात्रता और आवश्यकताएँ')}</h3><ul>{selected.min_age != null && <li>Minimum age: {selected.min_age}</li>}{selected.max_age != null && <li>Maximum age: {selected.max_age}</li>}{selected.min_marks_percentage != null && <li>Minimum marks: {selected.min_marks_percentage}%</li>}{selected.income_ceiling != null && <li>Family income ceiling: ₹{selected.income_ceiling.toLocaleString('en-IN')}</li>}{selected.eligible_education_levels?.length > 0 && <li>Education: {selected.eligible_education_levels.join(', ')}</li>}{selected.allowed_categories?.length > 0 && <li>Categories: {selected.allowed_categories.join(', ')}</li>}{selected.required_documents?.length > 0 && <li>Documents: {selected.required_documents.join(', ')}</li>}{!selected.min_age && !selected.max_age && !selected.min_marks_percentage && !selected.income_ceiling && <li>{label(lang, 'Check the official portal for full eligibility criteria.', 'पूरी पात्रता के लिए आधिकारिक पोर्टल देखें।')}</li>}</ul>{selected.actionable_steps && <><h3>{label(lang, 'What to do next', 'अगला कदम')}</h3><p>{selected.actionable_steps}</p></>}{validDate(selected.deadline) && <p>{deadlineLabel(selected.deadline)}</p>}{safeUrl(selected.official_portal_url) && <a className="feature-button" href={safeUrl(selected.official_portal_url)} target="_blank" rel="noopener noreferrer">{label(lang, 'Open official portal', 'आधिकारिक पोर्टल खोलें')} <ExternalLink size={16}/></a>}</section></div>}
  </section>
}
