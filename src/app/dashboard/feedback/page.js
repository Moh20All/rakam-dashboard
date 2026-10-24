import { getFeedback } from '@/lib/data';
import FeedbackClient from './FeedbackClient';

export const metadata = { title: 'Feedback' };

export default async function FeedbackPage() {
  return <FeedbackClient feedback={await getFeedback()} />;
}
