import { HowItWorksPage } from '@/components/how-it-works/HowItWorksPage';

export const metadata = {
  title: 'How It Works',
  description: 'Learn how upSKILLed generates Claude skill files — pick a service or tool, generate 3 files, drop them in your project.',
  openGraph: {
    title: 'How It Works — upSKILLed',
    description: 'Learn how upSKILLed generates Claude skill files in seconds.',
    url: 'https://getupskilled.dev/how-it-works',
  },
  twitter: {
    title: 'How It Works — upSKILLed',
    description: 'Learn how upSKILLed generates Claude skill files in seconds.',
  },
};

export default function Page() {
  return <HowItWorksPage />;
}
