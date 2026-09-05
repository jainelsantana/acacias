import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
export async function isEditor() {
  const user = await getChatGPTUser();
  const emails = (env.EDITOR_EMAILS || '')
    .toLowerCase()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return !!user && emails.includes(user.email.toLowerCase());
}
