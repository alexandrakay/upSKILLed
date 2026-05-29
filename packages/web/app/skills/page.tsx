import { SkillsPage } from '@/components/skills/SkillsPage';

export const metadata = {
  title: 'My Skills',
  description: 'Browse and re-download your previously generated Claude skill packages.',
  openGraph: {
    title: 'My Skills — upSKILLed',
    description: 'Browse and re-download your previously generated Claude skill packages.',
    url: 'https://getupskilled.dev/skills',
  },
  twitter: {
    title: 'My Skills — upSKILLed',
    description: 'Browse and re-download your previously generated Claude skill packages.',
  },
};

export default function Page() {
  return <SkillsPage />;
}
