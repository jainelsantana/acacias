import { initialContent } from '../lib/content';

// Only public editorial defaults are exported. No local accounts or inquiries.
export const demoContent = structuredClone(initialContent);
const asset = (url: string) => url.startsWith('/') && !url.startsWith('//') ? '/acacias' + url : url;
for (const section of [demoContent.hero, demoContent.manifesto, demoContent.video, ...demoContent.members]) {
  section.image = asset(section.image);
}
for (const photo of demoContent.gallery) photo.src = asset(photo.src);
for (const release of demoContent.releases) {
  release.cover = asset(release.cover);
  release.previewUrl = asset(release.previewUrl);
}
for (const key of Object.keys(demoContent.press) as (keyof typeof demoContent.press)[]) demoContent.press[key] = asset(demoContent.press[key]);
