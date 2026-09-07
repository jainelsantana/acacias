'use client';
import { useState } from 'react';
import type { SiteContent } from '@/lib/content';

// A key at the call site resets fallbacks whenever the editor changes the source.
export function VideoThumbnail({ video }: { video: SiteContent['video'] }) {
  const sources = [
    ...(video.image ? [video.image] : []),
    ...(video.youtubeId
      ? [
          `https://i.ytimg.com/vi/${video.youtubeId}/maxresdefault.jpg`,
          `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`,
        ]
      : []),
  ];
  const [index, setIndex] = useState(0);
  const src = sources[index];
  const advance = () =>
    setIndex((current) => (current === index ? current + 1 : current));
  return src ? (
    // Native image keeps YouTube fallbacks compatible with the static Pages build.
    // oxlint-disable-next-line next/no-img-element
    <img
      key={src}
      src={src}
      alt=""
      width={1600}
      height={900}
      loading="lazy"
      decoding="async"
      onError={advance}
      onLoad={(event) => {
        // YouTube can return a 120px placeholder with HTTP 200 for missing maxres.
        if (
          src.endsWith('/maxresdefault.jpg') &&
          event.currentTarget.naturalWidth <= 120
        )
          advance();
      }}
    />
  ) : (
    <span className="video-placeholder" aria-hidden="true">
      <span className="eyebrow">ACÁCIAS / VÍDEO OFICIAL</span>
      <span className="video-placeholder-word">
        SOM
        <br />
        <em>& imagem.</em>
      </span>
    </span>
  );
}
