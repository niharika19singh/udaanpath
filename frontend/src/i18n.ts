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
    "Ask about careers, schemes, courses or eligibility. Answers are built from your profile by UdaanPath's matching rules; each answer says whether an AI model was used.",
  advisorBadge: 'Profile-based guidance',
  advisorSourceAi: 'AI-generated (Gemini)',
  advisorSourceRules: 'Rule-based answer · not AI-generated',
  advisorNoProfileTitle: 'Complete your profile first',
  advisorNoProfileText:
    'The advisor answers from your Student Profile. Submit your profile, then ask your question here.',
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

  // Profile (journey form), validation and Career Discovery
  pfSaveChanges: 'Save changes',
  pfDemoNote: 'Demo values are filled in. Replace them with your own details before you submit.',
  pfFormAlertOne: 'Please check the highlighted field below.',
  pfFormAlertMany: 'Please check the highlighted fields below.',
  pfDistrictPlaceholder: 'Enter your city, town or district',
  pfLocationTierHint: 'This helps us show you relevant opportunities in your area.',
  pfInterestsPlaceholder: 'e.g. Technology, Solar Energy, Finance',
  pfAspirationsPlaceholder: 'e.g. Data Analyst, Software Engineer',
  pfWhyAskText: 'Your education level and stream help us identify careers and opportunities that match your eligibility.',
  pfIncomeHighText: 'Cost-effective paths and financial aid are important.',
  pfMattersText: 'This information helps UdaanPath prioritize affordable education, scholarships, schemes and low-barrier career paths.',
  pfDraftNote: 'Your answers stay in this tab as you go.',
  pfInfoText: 'Your profile is the starting point for career, learning and scholarship guidance on UdaanPath.',
  pfInfo1Text: 'Compare real careers and see how each matches your profile.',
  pfInfo2Text: '4-stage roadmaps with free SWAYAM and NPTEL options for a career you pick.',
  pfInfo3Text: 'Schemes, scholarships and apprenticeships checked against your profile.',
  pfJourneyKicker: 'Your journey',
  pfFillDemo: 'Fill demo profile',
  pfStepFilled: '{filled}/{total} filled',
  pfStepAria: 'Step {n}: {title}',
  pfStepDone: ', done',
  pfStepCurrent: ', current step',
  pfStepUpcoming: ', not reached yet',
  pfProgressComplete: 'complete',
  pfProgressDetails: '{filled} of {total} details added',
  pfProgressStepAria: '{title} details',
  dismissMessage: 'Dismiss message',
  vFullName: 'Please enter your full name.',
  vEmailRequired: 'Please enter your email address.',
  vEmailInvalid: 'Please enter a valid email, like name@example.com.',
  vPhone: 'Phone numbers need at least 10 digits.',
  vAgeRequired: 'Please enter your age.',
  vAgeRange: 'Please enter an age between 12 and 60.',
  vChooseOption: 'Please choose an option.',
  vCategory: 'Please choose your category.',
  vState: 'Please enter your state.',
  vDistrict: 'Please enter your district.',
  vEducation: 'Please choose your highest education level.',
  vPercentRequired: 'Please enter your percentage.',
  vPercentRange: 'Marks should be a percentage from 0 to 100.',
  vIncomeRequired: 'Please enter an amount (0 is fine).',
  vIncomeMin: 'Please enter an amount of 0 or more.',
  cdEyebrow: 'Career discovery',
  cdTitleA: 'Find your next ',
  cdTitleB: 'possibility',
  cdLede: 'Explore {n} real careers across three families. Pick interests and filters to see which paths fit, then compare the skills, training and pay for each.',
  cdCountFiltered: '{visible} of {total} careers fit your filters.',
  cdCountAll: '{total} careers across {families} career families.',
  cdViewDetails: 'View {name} details',
  cdInterestsTitle: 'Explore by interest',
  cdInterestsText: 'Select topics that interest you.',
  cdInterestsAria: 'Interests',
  cdFilters: 'Filters',
  cdClearAll: 'Clear all',
  cdYourEducation: 'Your education',
  cdAnyLevel: 'Any level',
  cdStream: 'Stream',
  cdAnyStream: 'Any stream',
  cdIndustry: 'Industry',
  cdAnyIndustry: 'Any industry',
  cdTrainingTime: 'Training time',
  cdAnyLength: 'Any length',
  cdUpToMonths: 'Up to {n} months',
  cdMore: '+{n} more',
  cdPickTopics: 'Pick topics below to see which paths fit.',
  cdBuildProfile: 'Build profile',
  cdOutsideFilters: 'Outside filters',
  cdProfileMatch: '{n}/100 profile match',
  cdProfileMatchSuffix: '/100 profile match',
  cdFitsPicks: 'Fits {n} of your picks',
  cdMonthsShort: '~{n} mo',
  cdCareerDetails: 'Career details',
  cdSave: 'Save {name}',
  cdUnsave: 'Remove {name} from saved',
  cdCatalogueTitle: 'Catalogue title: {title}',
  cdFromQualification: 'From {q}',
  cdOutsideNote: 'This career is outside your current filters.',
  cdYourMatch: 'Your profile match',
  cdRecommenderNote: 'From UdaanPath\'s recommender, using the profile you submitted.',
  cdAtAGlance: 'At a glance',
  cdStartingPay: 'Starting pay',
  cdMidPay: 'Mid-level pay',
  cdPerYear: ' / year',
  cdTraining: 'Training',
  cdMonths: ' months',
  cdCostToStart: 'Cost to start',
  cdSourceOffline: 'Showing the bundled copy of the UdaanPath career catalogue; the server could not be reached.',
  cdSourceLive: 'Source: UdaanPath career catalogue.',
  cdEstimates: 'General estimates, not personalised; actual pay and costs vary by employer, location and institute.',
  cdTabOverview: 'Overview',
  cdTabSkills: 'Skills',
  cdTabPathway: 'Pathway',
  cdTabOpportunities: 'Opportunities',
  cdGrowth: 'Growth outlook',
  cdKeySkills: 'Key skills',
  cdRelatedInterests: 'Related interests',
  cdOpenStreams: 'Open to streams',
  cdStagesTitle: 'Typical stages · roadmap template',
  cdWeeks: '~{n} weeks',
  cdPathwayHasProfile: 'Open your roadmap to see the milestones generated for your profile.',
  cdPathwayNoProfile: 'Your own roadmap is generated from your profile, with free courses highlighted alongside certifications.',
  cdOppsIntroA: 'Scholarships, government schemes and apprenticeships are matched to ',
  cdOppsIntroEm: 'you',
  cdOppsIntroB: ' — your family income, age, category, marks and education — rather than to one career.',
  cdScholarships: 'Scholarships',
  cdScholarshipsEg: 'e.g. NSP Post Matric Scholarship',
  cdSchemes: 'Government schemes',
  cdSchemesEg: 'e.g. PMKVY 4.0 skilling',
  cdApprenticeships: 'Apprenticeships',
  cdApprenticeshipsEg: 'e.g. NAPS and NATS',
  cdOppsNote: 'Example programmes from the UdaanPath opportunities directory. Whether you qualify is checked against your profile.',
  cdViewRoadmap: 'View my learning roadmap',
  cdCompleteProfile: 'Complete your profile',
  cdExplorePathway: 'Explore pathway',
  cdMatchesPicks: 'Matches your picks',
  cdQuickStart: 'Quick to start',
  cdMatchesPicksText: 'From the interests you picked on this page, not your profile.',
  cdQuickStartText: 'Shortest training first. Pick interests to personalise this.',
  cdNoMatches: 'No careers match these interests with your current filters.',
  cdMonthsTraining: '~{n} months training',
  cdCostLow: 'Low',
  cdCostModerate: 'Moderate',
  cdCostHigh: 'High',
  cdYourPicks: 'Your picks',
  cdCareersAria: 'Careers',

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
    'करियर, योजनाओं, कोर्स या पात्रता के बारे में पूछें। जवाब UdaanPath के मिलान-नियमों से आपकी प्रोफ़ाइल के आधार पर बनते हैं; हर जवाब बताता है कि उसमें एआई मॉडल का इस्तेमाल हुआ या नहीं।',
  advisorBadge: 'प्रोफ़ाइल आधारित मार्गदर्शन',
  advisorSourceAi: 'एआई द्वारा तैयार (Gemini)',
  advisorSourceRules: 'नियम-आधारित जवाब · एआई से नहीं बना',
  advisorNoProfileTitle: 'पहले अपनी प्रोफ़ाइल पूरी करें',
  advisorNoProfileText:
    'सलाहकार आपकी छात्र प्रोफ़ाइल के आधार पर जवाब देता है। प्रोफ़ाइल जमा करें, फिर यहाँ अपना सवाल पूछें।',
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

  // Profile (journey form), validation and Career Discovery
  pfSaveChanges: 'बदलाव सहेजें',
  pfDemoNote: 'डेमो जानकारी भर दी गई है। जमा करने से पहले इसे अपनी जानकारी से बदलें।',
  pfFormAlertOne: 'कृपया नीचे हाइलाइट किया गया फ़ील्ड जाँचें।',
  pfFormAlertMany: 'कृपया नीचे हाइलाइट किए गए फ़ील्ड जाँचें।',
  pfDistrictPlaceholder: 'अपना शहर, कस्बा या ज़िला लिखें',
  pfLocationTierHint: 'इससे हम आपके इलाके के उपयुक्त अवसर दिखा पाते हैं।',
  pfInterestsPlaceholder: 'जैसे टेक्नोलॉजी, सोलर एनर्जी, फ़ाइनेंस',
  pfAspirationsPlaceholder: 'जैसे डेटा एनालिस्ट, सॉफ़्टवेयर इंजीनियर',
  pfWhyAskText: 'आपकी शिक्षा का स्तर और स्ट्रीम हमें ऐसे करियर और अवसर पहचानने में मदद करते हैं जिनके लिए आप पात्र हैं।',
  pfIncomeHighText: 'किफ़ायती रास्ते और आर्थिक सहायता ज़रूरी हैं।',
  pfMattersText: 'यह जानकारी UdaanPath को किफ़ायती शिक्षा, छात्रवृत्तियों, योजनाओं और आसानी से शुरू होने वाले करियर को प्राथमिकता देने में मदद करती है।',
  pfDraftNote: 'आपके जवाब इस टैब में सहेजे रहते हैं।',
  pfInfoText: 'आपकी प्रोफ़ाइल UdaanPath पर करियर, पढ़ाई और छात्रवृत्ति से जुड़े मार्गदर्शन की शुरुआत है।',
  pfInfo1Text: 'असली करियर की तुलना करें और देखें कि हर करियर आपकी प्रोफ़ाइल से कितना मेल खाता है।',
  pfInfo2Text: 'आपके चुने हुए करियर के लिए मुफ़्त SWAYAM और NPTEL विकल्पों के साथ 4-चरण रोडमैप।',
  pfInfo3Text: 'आपकी प्रोफ़ाइल के आधार पर जाँची गई योजनाएँ, छात्रवृत्तियाँ और अप्रेंटिसशिप।',
  pfJourneyKicker: 'आपकी यात्रा',
  pfFillDemo: 'डेमो प्रोफ़ाइल भरें',
  pfStepFilled: '{filled}/{total} भरे गए',
  pfStepAria: 'चरण {n}: {title}',
  pfStepDone: ', पूरा हुआ',
  pfStepCurrent: ', मौजूदा चरण',
  pfStepUpcoming: ', अभी बाकी है',
  pfProgressComplete: 'पूरा',
  pfProgressDetails: '{total} में से {filled} जानकारियाँ जोड़ी गईं',
  pfProgressStepAria: '{title} की जानकारी',
  dismissMessage: 'संदेश बंद करें',
  vFullName: 'कृपया अपना पूरा नाम लिखें।',
  vEmailRequired: 'कृपया अपना ईमेल पता लिखें।',
  vEmailInvalid: 'कृपया सही ईमेल लिखें, जैसे name@example.com',
  vPhone: 'फ़ोन नंबर में कम से कम 10 अंक होने चाहिए।',
  vAgeRequired: 'कृपया अपनी आयु लिखें।',
  vAgeRange: 'कृपया 12 से 60 के बीच की आयु लिखें।',
  vChooseOption: 'कृपया एक विकल्प चुनें।',
  vCategory: 'कृपया अपनी श्रेणी चुनें।',
  vState: 'कृपया अपना राज्य लिखें।',
  vDistrict: 'कृपया अपना ज़िला लिखें।',
  vEducation: 'कृपया अपनी सबसे ऊँची शिक्षा चुनें।',
  vPercentRequired: 'कृपया अपना प्रतिशत लिखें।',
  vPercentRange: 'अंक 0 से 100 के बीच प्रतिशत में होने चाहिए।',
  vIncomeRequired: 'कृपया राशि लिखें (0 भी चलेगा)।',
  vIncomeMin: 'कृपया 0 या उससे ज़्यादा राशि लिखें।',
  cdEyebrow: 'करियर खोज',
  cdTitleA: 'खोजिए अपनी अगली ',
  cdTitleB: 'संभावना',
  cdLede: 'तीन परिवारों में बँटे {n} असली करियर देखें। रुचियाँ और फ़िल्टर चुनकर जानें कि कौन-से रास्ते आपके लिए सही हैं, फिर हर करियर के कौशल, प्रशिक्षण और वेतन की तुलना करें।',
  cdCountFiltered: '{total} में से {visible} करियर आपके फ़िल्टर से मेल खाते हैं।',
  cdCountAll: '{families} करियर परिवारों में {total} करियर।',
  cdViewDetails: '{name} का विवरण देखें',
  cdInterestsTitle: 'रुचि के अनुसार खोजें',
  cdInterestsText: 'अपनी पसंद के विषय चुनें।',
  cdInterestsAria: 'रुचियाँ',
  cdFilters: 'फ़िल्टर',
  cdClearAll: 'सब हटाएँ',
  cdYourEducation: 'आपकी शिक्षा',
  cdAnyLevel: 'कोई भी स्तर',
  cdStream: 'स्ट्रीम',
  cdAnyStream: 'कोई भी स्ट्रीम',
  cdIndustry: 'उद्योग',
  cdAnyIndustry: 'कोई भी उद्योग',
  cdTrainingTime: 'प्रशिक्षण अवधि',
  cdAnyLength: 'कोई भी अवधि',
  cdUpToMonths: '{n} महीने तक',
  cdMore: '+{n} और',
  cdPickTopics: 'नीचे विषय चुनें और देखें कि कौन-से रास्ते सही हैं।',
  cdBuildProfile: 'प्रोफ़ाइल बनाएँ',
  cdOutsideFilters: 'फ़िल्टर से बाहर',
  cdProfileMatch: '{n}/100 प्रोफ़ाइल मिलान',
  cdProfileMatchSuffix: '/100 प्रोफ़ाइल मिलान',
  cdFitsPicks: 'आपकी {n} पसंद से मेल',
  cdMonthsShort: '~{n} महीने',
  cdCareerDetails: 'करियर विवरण',
  cdSave: '{name} सहेजें',
  cdUnsave: '{name} को सहेजे गए से हटाएँ',
  cdCatalogueTitle: 'कैटलॉग शीर्षक: {title}',
  cdFromQualification: '{q} के बाद',
  cdOutsideNote: 'यह करियर आपके मौजूदा फ़िल्टर से बाहर है।',
  cdYourMatch: 'आपकी प्रोफ़ाइल से मिलान',
  cdRecommenderNote: 'UdaanPath के सुझाव-इंजन से, आपकी जमा की गई प्रोफ़ाइल के आधार पर।',
  cdAtAGlance: 'एक नज़र में',
  cdStartingPay: 'शुरुआती वेतन',
  cdMidPay: 'मध्य-स्तर वेतन',
  cdPerYear: ' / वर्ष',
  cdTraining: 'प्रशिक्षण',
  cdMonths: ' महीने',
  cdCostToStart: 'शुरुआती लागत',
  cdSourceOffline: 'सर्वर से संपर्क नहीं हो पाया, इसलिए UdaanPath करियर कैटलॉग की साथ आई प्रति दिखाई जा रही है।',
  cdSourceLive: 'स्रोत: UdaanPath करियर कैटलॉग।',
  cdEstimates: 'ये सामान्य अनुमान हैं, व्यक्तिगत नहीं; असली वेतन और लागत नियोक्ता, जगह और संस्थान के अनुसार बदलती है।',
  cdTabOverview: 'सारांश',
  cdTabSkills: 'कौशल',
  cdTabPathway: 'रास्ता',
  cdTabOpportunities: 'अवसर',
  cdGrowth: 'विकास की संभावना',
  cdKeySkills: 'मुख्य कौशल',
  cdRelatedInterests: 'संबंधित रुचियाँ',
  cdOpenStreams: 'इन स्ट्रीम के लिए खुला',
  cdStagesTitle: 'आम चरण · रोडमैप टेम्पलेट',
  cdWeeks: '~{n} सप्ताह',
  cdPathwayHasProfile: 'अपनी प्रोफ़ाइल के लिए बने पड़ाव देखने के लिए अपना रोडमैप खोलें।',
  cdPathwayNoProfile: 'आपका अपना रोडमैप आपकी प्रोफ़ाइल से बनता है, जिसमें सर्टिफ़िकेशन के साथ मुफ़्त कोर्स भी दिखाए जाते हैं।',
  cdOppsIntroA: 'छात्रवृत्तियाँ, सरकारी योजनाएँ और अप्रेंटिसशिप किसी एक करियर से नहीं, बल्कि ',
  cdOppsIntroEm: 'आपसे',
  cdOppsIntroB: ' मिलाई जाती हैं — आपकी पारिवारिक आय, आयु, श्रेणी, अंकों और शिक्षा के आधार पर।',
  cdScholarships: 'छात्रवृत्तियाँ',
  cdScholarshipsEg: 'जैसे NSP पोस्ट मैट्रिक छात्रवृत्ति',
  cdSchemes: 'सरकारी योजनाएँ',
  cdSchemesEg: 'जैसे PMKVY 4.0 कौशल प्रशिक्षण',
  cdApprenticeships: 'अप्रेंटिसशिप',
  cdApprenticeshipsEg: 'जैसे NAPS और NATS',
  cdOppsNote: 'ये UdaanPath अवसर निर्देशिका के उदाहरण कार्यक्रम हैं। आप पात्र हैं या नहीं, यह आपकी प्रोफ़ाइल से जाँचा जाता है।',
  cdViewRoadmap: 'मेरा सीखने का रोडमैप देखें',
  cdCompleteProfile: 'अपनी प्रोफ़ाइल पूरी करें',
  cdExplorePathway: 'रास्ता देखें',
  cdMatchesPicks: 'आपकी पसंद से मेल',
  cdQuickStart: 'जल्दी शुरू होने वाले',
  cdMatchesPicksText: 'इस पेज पर चुनी गई रुचियों के आधार पर, आपकी प्रोफ़ाइल के नहीं।',
  cdQuickStartText: 'सबसे कम प्रशिक्षण वाले पहले। इसे अपने हिसाब से बनाने के लिए रुचियाँ चुनें।',
  cdNoMatches: 'मौजूदा फ़िल्टर के साथ इन रुचियों से कोई करियर मेल नहीं खाता।',
  cdMonthsTraining: '~{n} महीने का प्रशिक्षण',
  cdCostLow: 'कम',
  cdCostModerate: 'मध्यम',
  cdCostHigh: 'अधिक',
  cdYourPicks: 'आपकी पसंद',
  cdCareersAria: 'करियर',

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
  'Prefer not to say': 'बताना नहीं चाहते',
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
  NEEDS_CONFIRMATION: 'पुष्टि ज़रूरी',
}

export const eligibilityLabel = (lang: Lang, status: string): string =>
  lang === 'hi' && status in eligibilityHi
    ? eligibilityHi[status]
    : status.replace(/_/g, ' ')

// Fixed server codes shown as labels (opportunity type, roadmap stage,
// unknown verifier). Anything else falls back to the server text.
const codeHi: Record<string, string> = {
  scholarship: 'छात्रवृत्ति',
  government_scheme: 'सरकारी योजना',
  apprenticeship: 'अप्रेंटिसशिप',
  foundational: 'बुनियादी',
  intermediate: 'मध्यम',
  advanced: 'उन्नत',
  job_ready: 'नौकरी के लिए तैयार',
  unknown: 'अज्ञात',
}

export const codeLabel = (lang: Lang, code: string): string =>
  lang === 'hi' && code in codeHi ? codeHi[code] : code.replace(/_/g, ' ')

// Career Discovery labels defined in the app (families, interest topics,
// streams, qualifications). Career facts from the API stay as received.
const discoveryLabelsHi: Record<string, string> = {
  'Build & Create': 'बनाएँ और रचें',
  'Tech · Design · Making': 'टेक · डिज़ाइन · निर्माण',
  'Help & Heal': 'सेवा और उपचार',
  'Health · Energy · Farming': 'स्वास्थ्य · ऊर्जा · खेती',
  'Lead & Solve': 'नेतृत्व और समाधान',
  'Finance · Public Service': 'वित्त · लोक सेवा',
  Technology: 'प्रौद्योगिकी',
  Healthcare: 'स्वास्थ्य सेवा',
  Environment: 'पर्यावरण',
  Design: 'डिज़ाइन',
  Business: 'व्यवसाय',
  'Public Service': 'लोक सेवा',
  Agriculture: 'कृषि',
  Manufacturing: 'विनिर्माण',
  'Numbers & Data': 'अंक और डेटा',
  Community: 'समुदाय',
  Creativity: 'रचनात्मकता',
  'Hands-on Work': 'हाथ का काम',
  'Science (PCM)': 'विज्ञान (PCM)',
  'Science (PCB)': 'विज्ञान (PCB)',
  Commerce: 'वाणिज्य',
  'Arts & Humanities': 'कला और मानविकी',
  'Vocational / ITI': 'व्यावसायिक / ITI',
  General: 'सामान्य',
  '10th pass': 'दसवीं पास',
  '12th pass': 'बारहवीं पास',
  'Problem Solving': 'समस्या समाधान',
  'Visual Design': 'विज़ुअल डिज़ाइन',
  'Diagnostic Equipment': 'जाँच उपकरण',
  'Safety Standards': 'सुरक्षा मानक',
  'Financial Literacy': 'वित्तीय साक्षरता',
  'General Awareness': 'सामान्य जागरूकता',
}

export const discoveryLabel = (lang: Lang, value: string): string =>
  lang === 'hi' ? (discoveryLabelsHi[value] ?? value) : value
