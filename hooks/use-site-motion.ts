'use client';

import { useEffect, useRef, useState } from 'react';

const preferenceKey = 'acacias-motion-paused';
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function useSiteMotion() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const enabled = !paused && !reducedMotion;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(media.matches);
    sync();
    try {
      setPaused(localStorage.getItem(preferenceKey) === 'true');
    } catch {
      // Motion controls still work when browser storage is unavailable.
    }
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const hero = root.querySelector<HTMLElement>('.hero');
    const scenes = root.querySelectorAll<HTMLElement>(
      'main > section, .ticker, .footer',
    );
    const reveals = root.querySelectorAll<HTMLElement>('.reveal, .section-top');
    const parallax = root.querySelectorAll<HTMLElement>(
      '.manifesto-side figure, .featured-art, .gallery-item, .footer-wordmark',
    );
    const activeParallax = new Set<HTMLElement>();
    let frame = 0;
    let pointerFrame = 0;
    let activeCover: HTMLElement | null = null;
    let pointerX = 0;
    let pointerY = 0;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    const update = () => {
      frame = 0;
      if (document.hidden) return;
      const y = window.scrollY;
      const viewport = window.innerHeight;
      const scrollable = document.documentElement.scrollHeight - viewport;
      const heroHeight = hero?.offsetHeight || viewport;
      const mobile = window.innerWidth < 700;
      // Read visible geometry first; writes below only update transforms.
      const positions = enabled
        ? [...activeParallax].map((element) => {
            const rect = element.getBoundingClientRect();
            const progress = clamp(
              (viewport * 0.5 - rect.top - rect.height * 0.5) / viewport,
              -1,
              1,
            );
            return { element, offset: progress * (mobile ? 16 : 42) };
          })
        : [];
      setScrolled(y > 70);
      root.style.setProperty(
        '--reading-progress',
        String(scrollable > 0 ? clamp(y / scrollable, 0, 1) : 0),
      );
      hero?.style.setProperty(
        '--hero-travel',
        enabled
          ? `${clamp(y / heroHeight, 0, 1) * (mobile ? 30 : 95)}px`
          : '0px',
      );
      for (const { element, offset } of positions) {
        element.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`);
      }
    };
    const schedule = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(update);
    };

    // CSS remains readable before hydration, when paused and without JS.
    let revealObserver: IntersectionObserver | undefined;
    let sceneObserver: IntersectionObserver | undefined;
    let parallaxObserver: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const element = entry.target as HTMLElement;
            element.dataset.reveal = 'visible';
            revealObserver?.unobserve(element);
          }
        },
        { threshold: 0.06, rootMargin: '0px 0px -6% 0px' },
      );
      reveals.forEach((element) => {
        if (element.dataset.reveal === 'visible') return;
        if (!enabled) {
          return;
        }
        element.dataset.reveal = 'waiting';
        const siblings = [...(element.parentElement?.children || [])];
        element.style.setProperty(
          '--reveal-delay',
          `${Math.min(siblings.indexOf(element), 2) * 90}ms`,
        );
        revealObserver?.observe(element);
      });
      sceneObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          (entry.target as HTMLElement).dataset.inView = String(
            entry.isIntersecting,
          );
        });
      });
      scenes.forEach((element) => sceneObserver?.observe(element));
      if (enabled) {
        parallaxObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const element = entry.target as HTMLElement;
              if (entry.isIntersecting) activeParallax.add(element);
              else activeParallax.delete(element);
            });
            schedule();
          },
          { rootMargin: '80px' },
        );
        parallax.forEach((element) => parallaxObserver?.observe(element));
      }
    } else {
      reveals.forEach((element) => {
        element.dataset.reveal = 'visible';
      });
      scenes.forEach((element) => {
        element.dataset.inView = 'true';
      });
    }

    const resetCover = () => {
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      activeCover?.style.removeProperty('--tilt-x');
      activeCover?.style.removeProperty('--tilt-y');
      activeCover = null;
    };
    const pointerMove = (event: PointerEvent) => {
      if (!enabled || !finePointer.matches || event.pointerType !== 'mouse')
        return;
      const cover =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>('.release-cover-button')
          : null;
      if (!cover || !root.contains(cover)) {
        resetCover();
        return;
      }
      if (activeCover !== cover) {
        resetCover();
        activeCover = cover;
      }
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        if (!activeCover) return;
        const rect = activeCover.getBoundingClientRect();
        const x = clamp((pointerX - rect.left) / rect.width - 0.5, -0.5, 0.5);
        const y = clamp((pointerY - rect.top) / rect.height - 0.5, -0.5, 0.5);
        activeCover.style.setProperty('--tilt-x', `${(-y * 6).toFixed(2)}deg`);
        activeCover.style.setProperty('--tilt-y', `${(x * 8).toFixed(2)}deg`);
      });
    };
    const visibility = () => {
      root.dataset.pageVisible = String(!document.hidden);
      if (document.hidden) {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        resetCover();
      } else schedule();
    };
    visibility();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    document.addEventListener('visibilitychange', visibility);
    if (enabled) {
      root.addEventListener('pointermove', pointerMove, { passive: true });
      root.addEventListener('pointerleave', resetCover);
      window.addEventListener('blur', resetCover);
    }
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resetCover();
      revealObserver?.disconnect();
      sceneObserver?.disconnect();
      parallaxObserver?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', visibility);
      root.removeEventListener('pointermove', pointerMove);
      root.removeEventListener('pointerleave', resetCover);
      window.removeEventListener('blur', resetCover);
      parallax.forEach((element) =>
        element.style.removeProperty('--parallax-y'),
      );
      hero?.style.removeProperty('--hero-travel');
    };
  }, [enabled]);

  function toggleMotion() {
    const next = !paused;
    setPaused(next);
    try {
      localStorage.setItem(preferenceKey, String(next));
    } catch {
      /* optional preference */
    }
  }

  return { rootRef, enabled, reducedMotion, scrolled, toggleMotion };
}
