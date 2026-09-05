import { env } from 'cloudflare:workers';
import { initialContent, validateContent, type SiteContent } from './content';
export function database() {
  return env.DB;
}
export async function readContent(): Promise<SiteContent> {
  const row = await database()
    .prepare('SELECT value FROM site_content WHERE id = ?')
    .bind('main')
    .first<{ value: string }>();
  if (!row) return initialContent;
  const content: unknown = JSON.parse(row.value);
  return validateContent(content) ? content : initialContent;
}
