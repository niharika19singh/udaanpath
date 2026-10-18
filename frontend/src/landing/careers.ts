import {
  ChartColumnIncreasing,
  Cog,
  Hospital,
  Laptop,
  Palette,
  Sprout,
  type LucideIcon,
} from 'lucide-react'

export type Career = {
  id: string
  title: string
  short: string
  example: string
  blurb: string
  roles: string[]
  icon: LucideIcon
  accent: string
  /** Branch traced over the artwork, in its 1672×940 pixel space. */
  branch: string
  /** Short connector from the branch node into the glass panel. */
  twig: string
  node: [number, number]
  /** Centre of the empty area on the drawn glass panel, and its tilt. */
  label: [number, number]
  /** Centre of the whole drawn glass panel (its destination card). */
  panel: [number, number]
  tilt: number
}

export const ART_W = 1672
export const ART_H = 940

// Branch geometry was sampled from the artwork's own neon strokes so the live
// SVG sits on top of the drawn branches. Example roles come from
// backend/data/careers.json.
export const careers: Career[] = [
  {
    id: 'technology',
    title: 'Technology',
    short: 'Technology',
    example: 'Data analytics & IT',
    blurb:
      'Turn curiosity about computers and data into skills employers in every sector need.',
    roles: ['Junior Data Analyst', 'Business Intelligence Associate'],
    icon: Laptop,
    accent: '#3fb4ff',
    branch:
      'M 910 660 C 909 650, 906 622, 905 603 C 904 584, 906 564, 905 545 C 905 526, 905 506, 901 487 C 897 468, 891 449, 882 432 C 872 416, 860 400, 847 387 C 833 373, 817 363, 801 354 C 786 344, 768 338, 751 330 C 734 321, 709 307, 700 303',
    twig: 'M 700 303 C 694 296, 688 285, 684 276',
    node: [700, 303],
    label: [585, 228],
    panel: [562, 221],
    tilt: 14,
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    short: 'Healthcare',
    example: 'Medical lab tech',
    blurb:
      'Care for people and communities through allied health and diagnostics careers.',
    roles: ['Medical Laboratory Technician (DMLT)'],
    icon: Hospital,
    accent: '#ff5d84',
    branch:
      'M 890 660 C 888 654, 881 636, 875 624 C 869 613, 862 603, 854 594 C 846 584, 836 575, 828 566 C 819 556, 812 545, 803 536 C 793 528, 781 522, 770 517 C 758 511, 746 506, 734 502 C 721 498, 700 488, 660 481',
    twig: 'M 660 481 C 632 476, 608 466, 588 456',
    node: [660, 481],
    label: [450, 401],
    panel: [428, 397],
    tilt: 11,
  },
  {
    id: 'agriculture',
    title: 'Agriculture',
    short: 'Agriculture',
    example: 'Smart agri & drone tech',
    blurb:
      'Bring new tools to the land, from precision farming to agri-drones and rural innovation.',
    roles: ['Smart Agriculture & Drone Technician'],
    icon: Sprout,
    accent: '#45ff86',
    branch:
      'M 905 660 C 885 630, 860 602, 822 590 C 792 580, 762 574, 738 586 C 724 594, 714 603, 708 608',
    twig: 'M 708 608 C 694 606, 682 603, 670 600',
    node: [708, 608],
    label: [535, 562],
    panel: [511, 559],
    tilt: 6.5,
  },
  {
    id: 'engineering',
    title: 'Engineering & Technical Trades',
    short: 'Engineering',
    example: 'Solar PV & CNC',
    blurb:
      'Build, install and maintain the machines and energy systems that power India.',
    roles: [
      'Solar PV Installation & Maintenance Technician',
      'CNC Machine Operator & Precision Machinist',
    ],
    icon: Cog,
    accent: '#ffd23f',
    branch:
      'M 960 660 C 960 652, 962 629, 962 614 C 962 599, 962 584, 963 568 C 963 553, 965 538, 966 523 C 967 507, 967 492, 970 477 C 972 461, 974 446, 979 431 C 985 416, 992 401, 1001 389 C 1011 376, 1023 366, 1035 356 C 1047 346, 1065 332, 1071 327',
    twig: 'M 1071 327 C 1088 314, 1104 303, 1119 293',
    node: [1071, 327],
    label: [1260, 200],
    panel: [1241, 204],
    tilt: -13.9,
  },
  {
    id: 'creative',
    title: 'Creative Arts',
    short: 'Creative Arts',
    example: 'UI/UX & digital design',
    blurb:
      'Shape how people see and use the world through design, media and digital products.',
    roles: ['UI/UX & Digital Product Designer'],
    icon: Palette,
    accent: '#bd72ff',
    branch:
      'M 974 660 C 976 652, 981 628, 985 613 C 990 597, 992 579, 1000 565 C 1007 550, 1018 536, 1031 526 C 1043 516, 1060 509, 1075 504 C 1091 500, 1108 500, 1123 499 C 1139 497, 1155 499, 1170 496 C 1185 492, 1200 485, 1215 478 C 1230 472, 1253 459, 1261 455',
    twig: 'M 1261 455 C 1278 450, 1294 446, 1308 442',
    node: [1261, 455],
    label: [1470, 385],
    panel: [1458, 386],
    tilt: -8.3,
  },
  {
    id: 'business',
    title: 'Business',
    short: 'Business',
    example: 'Banking & finance',
    blurb:
      'Understand money, trade and services, and help businesses and families grow.',
    roles: ['Banking & Financial Services Assistant (BFSI)'],
    icon: ChartColumnIncreasing,
    accent: '#34ecdc',
    branch:
      'M 987 660 C 988 657, 992 646, 995 639 C 999 633, 1002 625, 1007 620 C 1012 614, 1018 609, 1025 605 C 1031 601, 1037 597, 1044 595 C 1051 592, 1059 591, 1066 591 C 1074 590, 1081 589, 1088 589 C 1095 590, 1103 592, 1110 593 C 1117 593, 1127 592, 1130 592',
    twig: 'M 1130 592 C 1156 594, 1182 596, 1206 598',
    node: [1130, 592],
    label: [1370, 588],
    panel: [1356, 587],
    tilt: 3,
  },
]

/** The central stem rising to the lightbulb: the "core" of the tree. */
export const trunk = 'M 929 662 C 929 560, 929 460, 929 372'

export const SPROUT: [number, number] = [930, 690]
