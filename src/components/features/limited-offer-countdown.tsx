'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Countdown, { zeroPad } from 'react-countdown';
import type { CountdownRenderProps } from 'react-countdown';
import styles from './limited-offer-countdown.module.scss';

type LimitedOfferCountdownProps = {
  className?: string;
  label?: string;
  storageKey?: string;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const createNextExpiry = () => new Date(Date.now() + DAY_IN_MS);

export default function LimitedOfferCountdown({
  className = '',
  label = 'Limited-time offer! Sale ends in',
  storageKey = 'limited-offer-expiry',
}: LimitedOfferCountdownProps) {
  const [targetDate, setTargetDate] = useState<Date | null>(null);

  useEffect(() => {
    const storedExpiry = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
    if (storedExpiry) {
      const parsed = new Date(storedExpiry);
      if (!Number.isNaN(parsed.getTime()) && parsed.getTime() > Date.now()) {
        setTargetDate(parsed);
        return;
      }
    }
    const next = createNextExpiry();
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, next.toISOString());
    }
    setTargetDate(next);
  }, [storageKey]);

  const handleComplete = useCallback(() => {
    setTargetDate(() => {
      const next = createNextExpiry();
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, next.toISOString());
      }
      return next;
    });
  }, [storageKey]);

  const countdownRenderer = useCallback(
    ({ days, hours, minutes, seconds }: CountdownRenderProps) => {
      const totalHours = days * 24 + hours;
      const showDays = days > 0;

      return (
        <div className={styles.timer}>
          {showDays && (
            <span className={styles.section}>
              <span className={styles.amount}>{zeroPad(days)}</span>
              <span className={styles.period}>DAYS</span>
            </span>
          )}
          <span className={styles.section}>
            <span className={styles.amount}>{zeroPad(showDays ? hours : totalHours)}</span>
            <span className={styles.period}>HOURS</span>
          </span>
          <span className={styles.section}>
            <span className={styles.amount}>{zeroPad(minutes)}</span>
            <span className={styles.period}>MINUTES</span>
          </span>
          <span className={styles.section}>
            <span className={styles.amount}>{zeroPad(seconds)}</span>
            <span className={styles.period}>SECONDS</span>
          </span>
        </div>
      );
    },
    []
  );

  const wrapperClassName = useMemo(() => [styles.wrapper, className].filter(Boolean).join(' '), [className]);

  const placeholder = (
    <div className={`${styles.timer} ${styles.placeholder}`}>
      <span className={styles.section}>
        <span className={styles.amount}>--</span>
        <span className={styles.period}>HOURS</span>
      </span>
      <span className={styles.section}>
        <span className={styles.amount}>--</span>
        <span className={styles.period}>MINUTES</span>
      </span>
      <span className={styles.section}>
        <span className={styles.amount}>--</span>
        <span className={styles.period}>SECONDS</span>
      </span>
    </div>
  );

  return (
    <div className={wrapperClassName} aria-live="polite">
      <span className={`${styles.label} d-block`}>
        {label}
      </span>
      {targetDate ? (
        <Countdown
          key={targetDate.getTime()}
          date={targetDate}
          renderer={countdownRenderer}
          onComplete={handleComplete}
        />
      ) : (
        placeholder
      )}
    </div>
  );
}
