import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { PlatformIcon } from '@/components/platform-icon';
import { platformAriaLabel, type Platform } from '@/lib/platforms';

export function SocialPlatformLink({
  platform,
  label,
  url,
  icon,
  ariaLabel,
  variant = 'inline',
  onClick,
}: {
  platform?: Platform;
  label: string;
  url: string;
  icon?: ReactNode;
  ariaLabel?: string;
  variant?: 'inline' | 'listen' | 'social' | 'compact';
  onClick?: () => void;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`platform-link platform-link--${variant}`}
      aria-label={ariaLabel || platformAriaLabel(platform, label)}
      onClick={onClick}
    >
      <span className="platform-link-icon" aria-hidden="true">
        {icon || <PlatformIcon platform={platform} />}
      </span>
      <span
        className={variant === 'compact' ? 'sr-only' : 'platform-link-label'}
      >
        {label}
      </span>
      {variant !== 'compact' && (
        <ArrowUpRight
          className="platform-link-arrow"
          size={18}
          aria-hidden="true"
        />
      )}
    </a>
  );
}
