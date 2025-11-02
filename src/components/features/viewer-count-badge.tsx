'use client';

import React, { useEffect, useMemo, useState } from 'react';
import styles from './viewer-count-badge.module.scss';

type ViewerCountBadgeProps = {
  baseViewers?: number;
  variance?: number;
  intervalMs?: number;
  className?: string;
  prefixText?: string;
  suffixText?: string;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function ViewerCountBadge({
  baseViewers = 21,
  variance = 5,
  intervalMs = 5000,
  className = '',
  prefixText = 'Other people want this.',
  suffixText = 'people viewing this product right now.',
}: ViewerCountBadgeProps) {
  const [viewers, setViewers] = useState(baseViewers);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setViewers((current) => {
        const offset = getRandomInt(-variance, variance);
        return clamp(current + offset, Math.max(1, baseViewers - variance), baseViewers + variance);
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [baseViewers, intervalMs, variance]);

  const containerClassName = useMemo(
    () => [styles.badge, className].filter(Boolean).join(' '),
    [className]
  );

  return (
    <div className={containerClassName} role="status" aria-live="polite">
      <span className={styles.icon}>
        <i className="d-icon-users"></i>
      </span>
      <span className={styles.text}>
        {prefixText}&nbsp;There are <strong>{viewers}</strong>&nbsp;{suffixText}
      </span>
    </div>
  );
}
