// Small typed translation layer for the student portal (English / Hindi).
//
// - `en` is the source of truth for the message keys.
// - `hi` is typed as `Messages`, so a missing or extra Hindi key is a
//   TypeScript error at build time.
// - Only static UI text is translated. User-entered data (name, email, skills,
//   ...) and server-provided content (career titles, scheme descriptions, ...)
//   are shown exactly as received.
// - Form values stay in English internally (e.g. "12th pass"); only the label
//   shown in a <select> is translated (see `optionLabel`).

export type Lang = 'en' | 'hi'

export const LANG_STORAGE_KEY = 'udaanpath-language'

export const DEFAULT_LANG: Lang = 'en'

export const isLang = (value: unknown): value is Lang =>
  value === 'en' || value === 'hi'

// localStorage can throw (private mode, blocked storage) - never let that
// break the page.
export const readStoredLang = (): Lang => {
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY)
    return isLang(stored) ? stored : DEFAULT_LANG
  } catch {
    return DEFAULT_LANG
  }
}

export const storeLang = (lang: Lang) => {
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang)
  } catch {
    // Ignore: the language still switches for this session.
  }
}

const en = {
  // Navigation
  navHome: 'Home',
  navExploreCareers: 'Explore Careers',
  navLearningPaths: 'Learning Paths',
  navOpportunities: 'Opportunities',
  navForEducators: 'For Educators',
  sideProfile: 'Student Profile',
  sideCareers: 'Career Discovery',
  sideRoadmap: 'Learning Roadmap',
  sideOpportunities: 'Opportunities',
  sideAdvisor: 'AI Advisor',
  brandTag: 'LEARN · EXPLORE · GROW',
  sideCardLine1: 'Different backgrounds.',
  sideCardLine2: 'Brighter futures.',
  ariaSiteNav: 'Site',
  ariaStudentPortal: 'Student portal',
  ariaLanguage: 'Language',
  ariaEnglish: 'English',
  ariaHindi: 'Hindi',
  ariaProfileProgress: 'Profile progress',
  searchPlaceholder: 'Search careers, skills, scholarships...',
  searchAria: 'Search careers, skills, scholarships',
  removeItem: 'Remove {value}',

  // Hero
  heroEyebrow: 'YOUR STARTING POINT',
  heroTitleA: "Let's build your ",
  heroTitleB: 'path forward.',
  heroText:
    'A few details help us recommend careers, learning resources and opportunities that fit you.',
  activeProfile: 'Active Profile: {name} ({state})',

  // Steps
  step1Title: 'About You',
  step1Subtitle: "Let's start with some basic information.",
  step2Title: 'Education',
  step2Subtitle: 'Help us understand your academic background',
  step3Title: 'Skills & Interests',
  step3Subtitle: 'What are you good at and what interests you?',
  step4Title: 'Financial Background',
  step4Subtitle: 'This helps us find suitable opportunities for you',
  stepCount: 'Step {step} of {total}',

  // Fields
  fullName: 'Full name',
  fullNamePlaceholder: 'Enter your full name',
  email: 'Email address',
  phone: 'Phone number',
  age: 'Age',
  agePlaceholder: 'e.g. 19',
  gender: 'Gender',
  state: 'State',
  statePlaceholder: 'e.g. Uttar Pradesh',
  district: 'District',
  districtPlaceholder: 'Enter your city or district',
  locationTier: 'Location tier',
  locationTierHint: 'Helps prioritize regional opportunities.',
  category: 'Category',
  educationLevel: 'Highest education level',
  stream: 'Stream',
  percentage: 'Percentage / marks',
  percentagePlaceholder: 'e.g. 78.5',
  skills: 'Skills',
  skillsPlaceholder: 'e.g. Python, Excel, Communication',
  interests: 'Interests',
  interestsPlaceholder: 'e.g. Technology, Solar Energy, Healthcare',
  languages: 'Languages',
  languagesPlaceholder: 'e.g. Hindi, English',
  aspirations: 'Career aspirations',
  aspirationsPlaceholder: 'e.g. Technician, Analyst, Public Service',
  addTag: 'Add',
  income: 'Annual family income',
  incomePlaceholder: 'e.g. 180000',
  financialConstraint: 'Financial constraint level',
  selectPrompt: 'Select {label}',

  // Validation messages
  errFullNameRequired: 'Full name is required.',
  errEmailRequired: 'Email address is required.',
  errEmailInvalid: 'Please enter a valid email address.',
  errEducationRequired: 'Highest education level is required.',

  // Info boxes
  whyAskTitle: 'Why do we ask this?',
  whyAskText:
    'Your education level and stream help us identify careers and government scholarships you qualify for.',
  incomeLow: 'LOW',
  incomeLowText: 'Financial support is generally available.',
  incomeMedium: 'MEDIUM',
  incomeMediumText: 'Some financial limitations may affect choices.',
  incomeHigh: 'HIGH',
  incomeHighText: 'Cost-effective paths and financial aid are critical.',
  mattersTitle: 'Your information matters',
  mattersText:
    'UdaanPath prioritizes affordable education, certified scholarships, and high-ROI career tracks.',

  // Buttons
  back: 'Back',
  saveContinue: 'Save & Continue',
  saving: 'Saving...',
  completeProfile: 'Complete profile',

  // Info panel
  infoTitle1: 'Every path',
  infoTitle2Pre: 'starts ',
  infoTitle2Em: 'somewhere',
  infoTitle2Post: '',
  infoText:
    'Your profile helps us suggest careers, skills, learning resources and opportunities that match your background.',
  info1Title: 'Career paths that fit you',
  info1Text:
    'Explore options based on your strengths and interests across tech, trades, government & creative.',
  info2Title: 'Learning plans you can follow',
  info2Text:
    'Get 4-stage milestone roadmaps with free SWAYAM and NPTEL certified resources.',
  info3Title: 'Scholarships worth exploring',
  info3Text:
    'Find verified government schemes, scholarships, and apprenticeships you qualify for.',

  // Career discovery
  careersTitle: 'Personalized Career Recommendations',
  careersSubtitle:
    'Multi-factor matched against your academic background, skills, and financial ROI.',
  careersEmptyTitle: 'No recommendations generated yet',
  careersEmptyText:
    'Complete your student profile to unlock customized career matches.',
  goToProfileSetup: 'Go to Profile Setup',
  matchPercent: '{n}% Match',
  startingSalary: 'Starting Salary',
  midCareer: 'Mid-Career',
  outlook: 'Outlook',
  lpa: 'LPA',
  viewRoadmap: 'View Learning Roadmap',

  // Learning roadmap
  roadmapTitle: 'Learning Roadmap',
  roadmapTitleFor: '{career} Learning Roadmap',
  roadmapSubtitle:
    '4-stage milestone pathway with certified free SWAYAM/NPTEL alternative resources.',
  duration: 'Duration: ~{n} Months',
  hoursPerWeek: '{n} hrs / week',
  roadmapEmptyTitle: 'No roadmap loaded yet',
  roadmapEmptyText:
    'Select a career from Career Discovery to generate a structured 4-stage roadmap.',
  exploreCareersFirst: 'Explore Careers First',
  markInProgress: 'Mark In Progress',
  markComplete: 'Mark Complete',
  weeks: '{n} Weeks',
  cert: 'Cert: {value}',
  estCost: 'Est. Cost: ₹{n}',
  freeAlternative: 'Free Alternative:',
  accessPortal: 'Access Portal',

  // Opportunities
  oppsTitle: 'Verified Opportunities & Scholarships',
  oppsSubtitle:
    'Official government welfare schemes, scholarships, and apprenticeships evaluated with deterministic rules.',
  oppsBadge: '100% Traceable Indian Schemes',
  oppsEmptyTitle: 'No opportunities evaluated yet',
  oppsEmptyText:
    'Complete your student profile to evaluate eligibility across national schemes.',
  completeProfileBtn: 'Complete Profile',
  verifiedBy: 'Verified by: {value}',
  eligibilityEvaluation: 'Eligibility Evaluation:',
  applyOfficial: 'Apply on Official Portal',

  // AI advisor
  advisorTitle: 'AI Career & Education Advisor',
  advisorSubtitle:
    'Powered by Gemini LLM with zero-failure deterministic rule fallback. Ask any questions about careers, schemes, or preparation.',
  advisorBadge: 'Intelligent Guidance',
  advisorAsk: 'Ask your question',
  advisorAskText:
    'Get tailored advice grounded in official Indian schemes and free educational resources.',
  advisorPrompt1: 'What high-paying vocational careers can I start after 12th?',
  advisorPrompt2:
    'How can I get government funding for my skill development?',
  advisorPrompt3:
    'What are the job prospects and salary for Solar PV Technicians in India?',
  advisorPrompt4: 'Suggest free online certifications recognized by employers.',
  advisorPlaceholder:
    'e.g. Which scholarship is best for girls in engineering with low family income?',
  advisorButton: 'Ask Advisor',
  advisorRecommendation: 'Advisor Recommendation:',
  advisorProvider: 'Provider: {value}',
  keyTakeaways: 'Key Takeaways:',
  actionSteps: 'Action Steps:',

  // Educator placeholder
  educatorsTitle: 'Educator Portal',
  educatorsSubtitle:
    'Tools for teachers and mentors to guide students on UdaanPath.',
  comingSoon: 'Coming soon',
  educatorsText:
    'The educator portal is on its way. For now, students can continue with their profile.',
  backToProfile: 'Back to Student Profile',

  // Footer
  footerTagline: 'Personalized pathways for every student',
}

export type MessageKey = keyof typeof en
export type Messages = Record<MessageKey, string>

const hi: Messages = {
  // Navigation
  navHome: 'होम',
  navExploreCareers: 'करियर खोजें',
  navLearningPaths: 'सीखने के रास्ते',
  navOpportunities: 'अवसर',
  navForEducators: 'शिक्षकों के लिए',
  sideProfile: 'छात्र प्रोफ़ाइल',
  sideCareers: 'करियर खोज',
  sideRoadmap: 'सीखने का रोडमैप',
  sideOpportunities: 'अवसर',
  sideAdvisor: 'एआई सलाहकार',
  brandTag: 'सीखें · खोजें · आगे बढ़ें',
  sideCardLine1: 'अलग पृष्ठभूमि।',
  sideCardLine2: 'उज्ज्वल भविष्य।',
  ariaSiteNav: 'साइट',
  ariaStudentPortal: 'छात्र पोर्टल',
  ariaLanguage: 'भाषा',
  ariaEnglish: 'अंग्रेज़ी',
  ariaHindi: 'हिन्दी',
  ariaProfileProgress: 'प्रोफ़ाइल की प्रगति',
  searchPlaceholder: 'करियर, कौशल, छात्रवृत्तियाँ खोजें...',
  searchAria: 'करियर, कौशल, छात्रवृत्तियाँ खोजें',
  removeItem: '{value} हटाएँ',

  // Hero
  heroEyebrow: 'आपकी शुरुआत',
  heroTitleA: 'आइए बनाएँ आपका ',
  heroTitleB: 'आगे का रास्ता।',
  heroText:
    'कुछ जानकारियाँ हमें ऐसे करियर, सीखने के संसाधन और अवसर सुझाने में मदद करती हैं जो आपके लिए सही हों।',
  activeProfile: 'सक्रिय प्रोफ़ाइल: {name} ({state})',

  // Steps
  step1Title: 'आपके बारे में',
  step1Subtitle: 'आइए कुछ बुनियादी जानकारी से शुरू करें।',
  step2Title: 'शिक्षा',
  step2Subtitle: 'अपनी पढ़ाई की पृष्ठभूमि समझाने में हमारी मदद करें',
  step3Title: 'कौशल और रुचियाँ',
  step3Subtitle: 'आप किसमें अच्छे हैं और आपकी रुचि किसमें है?',
  step4Title: 'आर्थिक पृष्ठभूमि',
  step4Subtitle: 'इससे हमें आपके लिए उपयुक्त अवसर खोजने में मदद मिलती है',
  stepCount: 'चरण {step} / {total}',

  // Fields
  fullName: 'पूरा नाम',
  fullNamePlaceholder: 'अपना पूरा नाम लिखें',
  email: 'ईमेल पता',
  phone: 'फ़ोन नंबर',
  age: 'आयु',
  agePlaceholder: 'जैसे 19',
  gender: 'लिंग',
  state: 'राज्य',
  statePlaceholder: 'जैसे उत्तर प्रदेश',
  district: 'ज़िला',
  districtPlaceholder: 'अपना शहर या ज़िला लिखें',
  locationTier: 'स्थान की श्रेणी',
  locationTierHint: 'क्षेत्रीय अवसरों को प्राथमिकता देने में मदद करता है।',
  category: 'वर्ग',
  educationLevel: 'उच्चतम शिक्षा स्तर',
  stream: 'संकाय',
  percentage: 'प्रतिशत / अंक',
  percentagePlaceholder: 'जैसे 78.5',
  skills: 'कौशल',
  skillsPlaceholder: 'जैसे पायथन, एक्सेल, संवाद',
  interests: 'रुचियाँ',
  interestsPlaceholder: 'जैसे तकनीक, सौर ऊर्जा, स्वास्थ्य सेवा',
  languages: 'भाषाएँ',
  languagesPlaceholder: 'जैसे हिन्दी, अंग्रेज़ी',
  aspirations: 'करियर की आकांक्षाएँ',
  aspirationsPlaceholder: 'जैसे तकनीशियन, विश्लेषक, जनसेवा',
  addTag: 'जोड़ें',
  income: 'पारिवारिक वार्षिक आय',
  incomePlaceholder: 'जैसे 180000',
  financialConstraint: 'आर्थिक बाधा का स्तर',
  selectPrompt: '{label} चुनें',

  // Validation messages
  errFullNameRequired: 'पूरा नाम आवश्यक है।',
  errEmailRequired: 'ईमेल पता आवश्यक है।',
  errEmailInvalid: 'कृपया मान्य ईमेल पता दर्ज करें।',
  errEducationRequired: 'उच्चतम शिक्षा स्तर आवश्यक है।',

  // Info boxes
  whyAskTitle: 'हम यह क्यों पूछ रहे हैं?',
  whyAskText:
    'आपका शिक्षा स्तर और संकाय हमें उन करियर और सरकारी छात्रवृत्तियों की पहचान करने में मदद करते हैं जिनके लिए आप पात्र हैं।',
  incomeLow: 'कम',
  incomeLowText: 'आमतौर पर आर्थिक सहायता उपलब्ध रहती है।',
  incomeMedium: 'मध्यम',
  incomeMediumText: 'कुछ आर्थिक सीमाएँ आपके चुनाव को प्रभावित कर सकती हैं।',
  incomeHigh: 'अधिक',
  incomeHighText: 'किफ़ायती रास्ते और आर्थिक सहायता बहुत ज़रूरी हैं।',
  mattersTitle: 'आपकी जानकारी महत्वपूर्ण है',
  mattersText:
    'UdaanPath किफ़ायती शिक्षा, प्रमाणित छात्रवृत्तियों और अच्छे प्रतिफल वाले करियर मार्गों को प्राथमिकता देता है।',

  // Buttons
  back: 'वापस',
  saveContinue: 'सहेजें और आगे बढ़ें',
  saving: 'सहेजा जा रहा है...',
  completeProfile: 'प्रोफ़ाइल पूरी करें',

  // Info panel
  infoTitle1: 'हर रास्ता',
  infoTitle2Pre: 'किसी न किसी ',
  infoTitle2Em: 'जगह से',
  infoTitle2Post: ' शुरू होता है',
  infoText:
    'आपकी प्रोफ़ाइल हमें ऐसे करियर, कौशल, सीखने के संसाधन और अवसर सुझाने में मदद करती है जो आपकी पृष्ठभूमि से मेल खाते हों।',
  info1Title: 'आपके लिए उपयुक्त करियर रास्ते',
  info1Text:
    'तकनीक, व्यवसाय, सरकारी और रचनात्मक क्षेत्रों में अपनी ताकत और रुचियों के आधार पर विकल्प खोजें।',
  info2Title: 'सीखने की योजनाएँ जिन्हें आप अपना सकें',
  info2Text:
    'SWAYAM और NPTEL के निःशुल्क प्रमाणित संसाधनों के साथ 4 चरणों वाले रोडमैप पाएँ।',
  info3Title: 'छात्रवृत्तियाँ जो खोजने लायक हैं',
  info3Text:
    'सत्यापित सरकारी योजनाएँ, छात्रवृत्तियाँ और अप्रेंटिसशिप खोजें जिनके लिए आप पात्र हैं।',

  // Career discovery
  careersTitle: 'आपके लिए करियर सुझाव',
  careersSubtitle:
    'आपकी शैक्षिक पृष्ठभूमि, कौशल और आर्थिक लाभ के कई कारकों के आधार पर मिलान किए गए विकल्प।',
  careersEmptyTitle: 'अभी तक कोई सुझाव तैयार नहीं हुआ',
  careersEmptyText:
    'अपने अनुसार करियर सुझाव पाने के लिए अपनी छात्र प्रोफ़ाइल पूरी करें।',
  goToProfileSetup: 'प्रोफ़ाइल सेटअप पर जाएँ',
  matchPercent: '{n}% मेल',
  startingSalary: 'शुरुआती वेतन',
  midCareer: 'करियर के मध्य में',
  outlook: 'भविष्य की संभावना',
  lpa: 'लाख प्रति वर्ष',
  viewRoadmap: 'सीखने का रोडमैप देखें',

  // Learning roadmap
  roadmapTitle: 'सीखने का रोडमैप',
  roadmapTitleFor: '{career} — सीखने का रोडमैप',
  roadmapSubtitle:
    'SWAYAM/NPTEL के प्रमाणित निःशुल्क विकल्पों के साथ 4 चरणों वाला मील-पत्थर पथ।',
  duration: 'अवधि: लगभग {n} महीने',
  hoursPerWeek: '{n} घंटे / सप्ताह',
  roadmapEmptyTitle: 'अभी तक कोई रोडमैप लोड नहीं हुआ',
  roadmapEmptyText:
    '4 चरणों वाला व्यवस्थित रोडमैप बनाने के लिए करियर खोज में से कोई करियर चुनें।',
  exploreCareersFirst: 'पहले करियर खोजें',
  markInProgress: 'जारी के रूप में चिह्नित करें',
  markComplete: 'पूर्ण चिह्नित करें',
  weeks: '{n} सप्ताह',
  cert: 'प्रमाणपत्र: {value}',
  estCost: 'अनुमानित खर्च: ₹{n}',
  freeAlternative: 'निःशुल्क विकल्प:',
  accessPortal: 'पोर्टल खोलें',

  // Opportunities
  oppsTitle: 'सत्यापित अवसर और छात्रवृत्तियाँ',
  oppsSubtitle:
    'आधिकारिक सरकारी कल्याण योजनाएँ, छात्रवृत्तियाँ और अप्रेंटिसशिप, जिनकी पात्रता निश्चित नियमों से जाँची गई है।',
  oppsBadge: '100% पता लगाने योग्य भारतीय योजनाएँ',
  oppsEmptyTitle: 'अभी तक कोई अवसर जाँचा नहीं गया',
  oppsEmptyText:
    'राष्ट्रीय योजनाओं में अपनी पात्रता जाँचने के लिए अपनी छात्र प्रोफ़ाइल पूरी करें।',
  completeProfileBtn: 'प्रोफ़ाइल पूरी करें',
  verifiedBy: 'सत्यापित करने वाला: {value}',
  eligibilityEvaluation: 'पात्रता का मूल्यांकन:',
  applyOfficial: 'आधिकारिक पोर्टल पर आवेदन करें',

  // AI advisor
  advisorTitle: 'एआई करियर और शिक्षा सलाहकार',
  advisorSubtitle:
    'Gemini LLM द्वारा संचालित, निश्चित नियमों के बैकअप के साथ। करियर, योजनाओं या तैयारी के बारे में कोई भी सवाल पूछें।',
  advisorBadge: 'बुद्धिमान मार्गदर्शन',
  advisorAsk: 'अपना सवाल पूछें',
  advisorAskText:
    'आधिकारिक भारतीय योजनाओं और निःशुल्क शैक्षिक संसाधनों पर आधारित, आपके अनुकूल सलाह पाएँ।',
  advisorPrompt1: 'बारहवीं के बाद मैं कौन से अच्छी कमाई वाले व्यावसायिक करियर शुरू कर सकता/सकती हूँ?',
  advisorPrompt2:
    'अपने कौशल विकास के लिए मुझे सरकारी आर्थिक सहायता कैसे मिल सकती है?',
  advisorPrompt3:
    'भारत में सोलर पीवी तकनीशियनों के लिए नौकरी की संभावनाएँ और वेतन क्या हैं?',
  advisorPrompt4:
    'नियोक्ताओं द्वारा मान्य निःशुल्क ऑनलाइन प्रमाणपत्र सुझाएँ।',
  advisorPlaceholder:
    'जैसे कम पारिवारिक आय वाली इंजीनियरिंग की छात्राओं के लिए कौन सी छात्रवृत्ति सबसे अच्छी है?',
  advisorButton: 'सलाहकार से पूछें',
  advisorRecommendation: 'सलाहकार की सिफ़ारिश:',
  advisorProvider: 'प्रदाता: {value}',
  keyTakeaways: 'मुख्य बातें:',
  actionSteps: 'करने योग्य कदम:',

  // Educator placeholder
  educatorsTitle: 'शिक्षक पोर्टल',
  educatorsSubtitle:
    'शिक्षकों और मार्गदर्शकों के लिए UdaanPath पर छात्रों का मार्गदर्शन करने के साधन।',
  comingSoon: 'जल्द आ रहा है',
  educatorsText:
    'शिक्षक पोर्टल जल्द ही उपलब्ध होगा। तब तक छात्र अपनी प्रोफ़ाइल जारी रख सकते हैं।',
  backToProfile: 'छात्र प्रोफ़ाइल पर वापस जाएँ',

  // Footer
  footerTagline: 'हर छात्र के लिए अनुकूल रास्ते',
}

export const messages: Record<Lang, Messages> = { en, hi }

export type Vars = Record<string, string | number>

// t(lang, 'stepCount', { step: 1, total: 4 }) -> "Step 1 of 4"
export const t = (lang: Lang, key: MessageKey, vars?: Vars): string => {
  const template = messages[lang][key]
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  )
}

// Same as t(), but returns the text split around each {placeholder} so JSX
// renders the pieces as separate text nodes - exactly like the original
// hand-written markup ("Step ", 1, " of ", 4). Used where pixel parity with
// the old markup matters (browsers lay out one text run slightly differently
// from several).
export const tParts = (lang: Lang, key: MessageKey, vars: Vars): string[] =>
  messages[lang][key]
    .split(/(\{\w+\})/)
    .map((part) => {
      const match = /^\{(\w+)\}$/.exec(part)
      return match && match[1] in vars ? String(vars[match[1]]) : part
    })
    .filter((part) => part !== '')

// Internal (English) option values used by the form and sent to the API.
// Only the label is translated; the value never changes.
const optionLabelsHi = {
  Student: 'छात्र',
  'Uttar Pradesh': 'उत्तर प्रदेश',
  Varanasi: 'वाराणसी',
  Male: 'पुरुष',
  Female: 'महिला',
  Other: 'अन्य',
  'Tier 1': 'श्रेणी 1',
  'Tier 2': 'श्रेणी 2',
  'Tier 3': 'श्रेणी 3',
  General: 'सामान्य',
  OBC: 'अन्य पिछड़ा वर्ग (OBC)',
  SC: 'अनुसूचित जाति (SC)',
  ST: 'अनुसूचित जनजाति (ST)',
  EWS: 'आर्थिक रूप से कमज़ोर वर्ग (EWS)',
  '10th pass': 'दसवीं पास',
  '12th pass': 'बारहवीं पास',
  Diploma: 'डिप्लोमा',
  Undergraduate: 'स्नातक',
  Postgraduate: 'स्नातकोत्तर',
  'Science PCM': 'विज्ञान (PCM)',
  'Science PCB': 'विज्ञान (PCB)',
  Commerce: 'वाणिज्य',
  'Arts / Humanities': 'कला / मानविकी',
  'Computer Science': 'कंप्यूटर विज्ञान',
  Vocational: 'व्यावसायिक',
  Low: 'कम',
  Medium: 'मध्यम',
  High: 'अधिक',
  'Basic Computers': 'कंप्यूटर का बुनियादी ज्ञान',
  Troubleshooting: 'समस्या-समाधान',
  Communication: 'संचार',
  Technology: 'प्रौद्योगिकी',
  Electronics: 'इलेक्ट्रॉनिक्स',
  'Public Service': 'लोक सेवा',
  Hindi: 'हिंदी',
  English: 'अंग्रेज़ी',
  'Technical Specialist': 'तकनीकी विशेषज्ञ',
  Analyst: 'विश्लेषक',
  science_pcm: 'विज्ञान (PCM)',
  science_pcb: 'विज्ञान (PCB)',
  arts_humanities: 'कला / मानविकी',
  iti_diploma: 'आईटीआई / डिप्लोमा',
  undergraduate: 'स्नातक',
  postgraduate: 'स्नातकोत्तर',
} as const

export type OptionValue = keyof typeof optionLabelsHi

export const optionLabel = (lang: Lang, value: string): string =>
  lang === 'hi' && value in optionLabelsHi
    ? optionLabelsHi[value as OptionValue]
    : value

// Values stored in the form and API payload remain English. This reverses a
// known display label only when a localized editable field is changed.
export const optionValue = (lang: Lang, value: string): string => {
  if (lang !== 'hi') return value

  const match = Object.entries(optionLabelsHi).find(
    ([, label]) => label === value,
  )
  return match ? match[0] : value
}

// Server-provided eligibility statuses (shown as a badge). Unknown statuses
// fall back to the server text.
const eligibilityHi: Record<string, string> = {
  ELIGIBLE: 'पात्र',
  PARTIALLY_ELIGIBLE: 'आंशिक रूप से पात्र',
  INELIGIBLE: 'अपात्र',
}

export const eligibilityLabel = (lang: Lang, status: string): string =>
  lang === 'hi' && status in eligibilityHi
    ? eligibilityHi[status]
    : status.replace(/_/g, ' ')
