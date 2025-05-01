import { parseISO, isToday, isYesterday, format } from 'date-fns';

export function useGroupMessages(localMessages: Message[]) {
  const grouped: Record<string, Message[]> = {};
  localMessages.forEach((msg) => {
    const date = msg.timeSent ? parseISO(msg.timeSent) : new Date();
    const label = isToday(date)
      ? 'Today'
      : isYesterday(date)
      ? 'Yesterday'
      : format(date, 'MMMM d, yyyy');
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(msg);
  });
  return grouped;
}
