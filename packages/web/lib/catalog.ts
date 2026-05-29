import {
  siGithub, siNotion, siLinear, siStripe,
  siJira, siGmail, siAsana, siVercel, siFigma,
} from 'simple-icons';

export type ServiceEntry = {
  id: string;
  label: string;
  icon: { hex: string; path: string };
};

// simple-icons v16 dropped siSlack; inline the path from Slack brand assets
const siSlack = {
  hex: '4A154B',
  path: 'M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z',
};

export type ToolEntry = {
  id: string;
  label: string;
  section: 'security' | 'devops';
};

export const SERVICES: ServiceEntry[] = [
  { id: 'github',  label: 'GitHub',  icon: siGithub  },
  { id: 'notion',  label: 'Notion',  icon: siNotion  },
  { id: 'slack',   label: 'Slack',   icon: siSlack   },
  { id: 'linear',  label: 'Linear',  icon: siLinear  },
  { id: 'stripe',  label: 'Stripe',  icon: siStripe  },
  { id: 'jira',    label: 'Jira',    icon: siJira    },
  { id: 'gmail',   label: 'Gmail',   icon: siGmail   },
  { id: 'asana',   label: 'Asana',   icon: siAsana   },
  { id: 'vercel',  label: 'Vercel',  icon: siVercel  },
  { id: 'figma',   label: 'Figma',   icon: siFigma   },
];

export const TOOLS: ToolEntry[] = [
  { id: 'ffuf',      label: 'ffuf',        section: 'security' },
  { id: 'nmap',      label: 'nmap',        section: 'security' },
  { id: 'gobuster',  label: 'gobuster',    section: 'security' },
  { id: 'sqlmap',    label: 'sqlmap',      section: 'security' },
  { id: 'burpsuite', label: 'Burp Suite',  section: 'security' },
  { id: 'httpx',     label: 'httpx',       section: 'security' },
  { id: 'nuclei',    label: 'nuclei',      section: 'security' },
  { id: 'gh',        label: 'gh',          section: 'devops'   },
  { id: 'vercel',    label: 'vercel cli',  section: 'devops'   },
  { id: 'stripe',    label: 'stripe cli',  section: 'devops'   },
  { id: 'curl',      label: 'curl',        section: 'devops'   },
  { id: 'jq',        label: 'jq',          section: 'devops'   },
  { id: 'docker',    label: 'Docker',      section: 'devops'   },
  { id: 'kubectl',   label: 'kubectl',     section: 'devops'   },
  { id: 'aws',       label: 'AWS CLI',     section: 'devops'   },
];
