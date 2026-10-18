import { useState } from 'react'
import { BookOpen, Check, ExternalLink, RefreshCw, Clock3, GraduationCap } from 'lucide-react'
import { api, type StudentProfileData, type CareerItem, type PathwayResponse } from '../api/client'
import type { Lang } from '../i18n'

type Props = { student: StudentProfileData | null; careers: CareerItem[]; pathway: PathwayResponse | null; selectedCareerId: number | null; onPathway: (p: PathwayResponse, careerId: number) => void; onCompleteProfile: () => void; lang: Lang }
const label = (lang: Lang, en: string, hi: string) => lang === 'hi' ? hi : en
const safeUrl = (value?: string) => { try { const u = new URL(value || ''); return ['https:', 'http:'].includes(u.protocol) ? u.toString() : '' } catch { return '' } }
export default function LearningRoadmapPage({ student, careers, pathway, selectedCareerId, onPathway, onCompleteProfile, lang }: Props) {
  const [careerId, setCareerId] = useState(String(selectedCareerId ?? careers[0]?.career_id ?? ''))
  const [generating, setGenerating] = useState(false)
  const [updating, setUpdating] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const activeCareer = careers.find(c => c.career_id === Number(careerId))
  const generate = async () => {
    if (!student?.id || !careerId) return
    setGenerating(true); setError(''); setNotice('')
    try { const result = await api.generatePathway(student.id, Number(careerId)); onPathway(result, Number(careerId)); setNotice(label(lang, 'Your roadmap is ready.', 'आपका रोडमैप तैयार है।')) }
    catch (e) { setError(e instanceof Error ? e.message : label(lang, 'Roadmap generation failed.', 'रोडमैप नहीं बन सका।')) }
    finally { setGenerating(false) }
  }
  const toggle = async (id: number, current: string) => {
    setUpdating(id); setError(''); setNotice('')
    const next = current === 'completed' ? 'in_progress' : 'completed'
    try {
      const result = await api.updateMilestoneStatus(id, next)
      if (pathway) onPathway({ ...pathway, milestones: pathway.milestones.map(m => m.id === id ? { ...m, status: result.status } : m) }, pathway.career_id)
      setNotice(label(lang, 'Milestone progress updated.', 'माइलस्टोन की प्रगति अपडेट हुई।'))
    } catch (e) { setError(e instanceof Error ? e.message : label(lang, 'Could not update progress. Please retry.', 'प्रगति अपडेट नहीं हुई। फिर कोशिश करें।')) }
    finally { setUpdating(null) }
  }
  const milestones = pathway?.milestones || []
  const completed = milestones.filter(m => m.status === 'completed').length
  const progress = milestones.length ? Math.round(completed / milestones.length * 100) : null

  return <section className="feature-page roadmap-page">
    <header className="feature-hero roadmap-hero"><div className="feature-hero-copy"><span className="feature-eyebrow">{label(lang, 'ONE STEP AT A TIME', 'एक-एक कदम आगे')}</span><h1>{label(lang, 'Your Learning Roadmap', 'आपका सीखने का रोडमैप')}</h1><p>{label(lang, 'A clear path from what you know today to the skills your chosen career needs.', 'आज की जानकारी से चुने हुए करियर के ज़रूरी कौशल तक का स्पष्ट रास्ता।')}</p></div><div className="feature-hero-art" aria-hidden="true">↗</div></header>
    {!student ? <div className="feature-state"><GraduationCap size={36}/><h2>{label(lang, 'Start with your student profile', 'छात्र प्रोफ़ाइल से शुरुआत करें')}</h2><p>{label(lang, 'Your roadmap uses your education and interests to make the next steps more relevant.', 'आपकी शिक्षा और रुचियों के आधार पर रोडमैप बनाया जाता है।')}</p><button className="feature-button" onClick={onCompleteProfile}>{label(lang, 'Complete profile', 'प्रोफ़ाइल पूरी करें')}</button></div> :
    careers.length === 0 ? <div className="feature-state"><BookOpen size={36}/><h2>{label(lang, 'Choose a career direction first', 'पहले करियर चुनें')}</h2><p>{label(lang, 'We could not find career recommendations for this profile yet. Review your profile and try again.', 'इस प्रोफ़ाइल के लिए अभी करियर सुझाव नहीं मिले। प्रोफ़ाइल जाँचें और फिर कोशिश करें।')}</p><button className="feature-button" onClick={onCompleteProfile}>{label(lang, 'Review profile', 'प्रोफ़ाइल देखें')}</button></div> :
    <>
      <section className="roadmap-career-picker"><div><span className="feature-kicker">{label(lang, 'YOUR CAREER DIRECTION', 'आपकी करियर दिशा')}</span><h2>{label(lang, 'What are you working towards?', 'आप किस लक्ष्य की ओर बढ़ रहे हैं?')}</h2><p>{label(lang, 'Choose a recommended career. You can generate a fresh roadmap whenever you change direction.', 'सुझाए गए करियर में से चुनें। दिशा बदलने पर नया रोडमैप बना सकते हैं।')}</p></div><div className="roadmap-picker-controls"><label htmlFor="roadmap-career">{label(lang, 'Selected career', 'चुना गया करियर')}</label><select id="roadmap-career" value={careerId} onChange={e => setCareerId(e.target.value)}>{careers.map(c => <option key={c.career_id} value={c.career_id}>{c.title}</option>)}</select><button className="feature-button" onClick={() => void generate()} disabled={!careerId || generating}>{generating ? <><RefreshCw className="feature-spin" size={16}/>{label(lang, 'Building roadmap…', 'रोडमैप बन रहा है…')}</> : <>{pathway && pathway.career_id === Number(careerId) ? label(lang, 'Refresh roadmap', 'रोडमैप फिर बनाएँ') : label(lang, 'Generate roadmap', 'रोडमैप बनाएँ')}</>}</button></div></section>
      {activeCareer && <section className="roadmap-career-note"><div><span>{label(lang, 'WHY THIS CAREER', 'यह करियर क्यों')}</span><p>{activeCareer.rationale || label(lang, 'This career appears in your recommendations.', 'यह करियर आपके सुझावों में है।')}</p></div><div className="roadmap-skills"><span>{label(lang, 'SKILLS TO BUILD', 'सीखने वाले कौशल')}</span><div>{activeCareer.key_skills.map(skill => <span key={skill}>{skill}</span>)}</div></div></section>}
      {error && <div className="feature-inline-error" role="alert"><span>{error}</span></div>}{notice && <p className="feature-notice" role="status">{notice}</p>}
      {!pathway || pathway.career_id !== Number(careerId) ? <div className="feature-state"><BookOpen size={36}/><h2>{label(lang, 'Your roadmap starts here', 'आपका रोडमैप यहाँ शुरू होता है')}</h2><p>{label(lang, 'Generate a roadmap to see the actual learning stages, resources and milestones returned for this career.', 'इस करियर के लिए सीखने के चरण, संसाधन और माइलस्टोन देखने के लिए रोडमैप बनाएँ।')}</p><button className="feature-button" disabled={generating} onClick={() => void generate()}>{label(lang, 'Generate roadmap', 'रोडमैप बनाएँ')}</button></div> :
      <><section className="roadmap-summary"><div><span>{label(lang, 'ESTIMATED DURATION', 'अनुमानित अवधि')}</span><strong>{pathway.total_estimated_duration_months} {label(lang, 'months', 'महीने')}</strong></div><div><span>{label(lang, 'WEEKLY STUDY TIME', 'साप्ताहिक पढ़ाई')}</span><strong>{pathway.weekly_study_hours} {label(lang, 'hours / week', 'घंटे / सप्ताह')}</strong></div><div><span>{label(lang, 'MILESTONES COMPLETED', 'पूरे माइलस्टोन')}</span><strong>{completed} / {milestones.length}</strong></div>{progress !== null && <div className="roadmap-progress"><div><span>{label(lang, 'Overall progress', 'कुल प्रगति')}</span><strong>{progress}%</strong></div><div className="roadmap-progress-track"><span style={{width: `${progress}%`}}/></div></div>}</section>
      {milestones.length === 0 ? <div className="feature-state"><h2>{label(lang, 'No milestones in this roadmap yet', 'इस रोडमैप में अभी माइलस्टोन नहीं हैं')}</h2><p>{label(lang, 'Try generating the roadmap again.', 'रोडमैप फिर से बनाने की कोशिश करें।')}</p><button className="feature-button" onClick={() => void generate()}>{label(lang, 'Try again', 'फिर कोशिश करें')}</button></div> :
      <div className="roadmap-timeline">{milestones.slice().sort((a,b) => a.step_number - b.step_number).map((m, i) => { const url = safeUrl(m.resource_url); return <article key={m.id} className={`roadmap-milestone ${m.status}`}><div className="roadmap-marker">{m.status === 'completed' ? <Check size={19}/> : m.step_number}</div><div className="roadmap-milestone-card"><div className="roadmap-milestone-heading"><div><span className="feature-type">{m.stage.replaceAll('_',' ')}</span><h3>{m.title}</h3></div><span className={`roadmap-status ${m.status}`}>{m.status.replaceAll('_',' ')}</span></div><p>{m.description}</p><div className="roadmap-milestone-meta"><span><Clock3 size={15}/>{m.duration_weeks} {label(lang, 'weeks', 'सप्ताह')}</span>{m.recommended_certification && <span>{label(lang, 'Certification', 'प्रमाणपत्र')}: {m.recommended_certification}</span>}{!m.estimated_cost_is_unknown && <span>₹{m.estimated_cost_inr.toLocaleString('en-IN')}</span>}</div>{m.skills_to_acquire.length > 0 && <div className="roadmap-skills">{m.skills_to_acquire.map(skill => <span key={skill}>{skill}</span>)}</div>}{m.free_alternative_resource && <div className="roadmap-resource"><BookOpen size={18}/><div><strong>{m.free_alternative_resource}</strong><p>{label(lang, 'Learning resource', 'सीखने का संसाधन')}</p></div>{url && <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${label(lang,'Open resource','संसाधन खोलें')}: ${m.free_alternative_resource}`}><ExternalLink size={17}/></a>}</div>}<button className={`feature-button ${m.status === 'completed' ? 'secondary' : ''}`} disabled={updating === m.id} onClick={() => void toggle(m.id,m.status)}>{updating === m.id ? label(lang, 'Saving…', 'सेव हो रहा है…') : m.status === 'completed' ? label(lang, 'Mark in progress', 'जारी चिह्नित करें') : label(lang, 'Mark completed', 'पूरा चिह्नित करें')}</button></div>{i < milestones.length - 1 && <span className="roadmap-connector" aria-hidden="true"/>}</article> })}</div>}</>}
    </>}
  </section>
}
