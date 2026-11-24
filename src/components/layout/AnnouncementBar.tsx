import React, { useState, useEffect } from 'react';
import {
  announcementConfig,
  type AnnouncementConfig,
  type AnnouncementItemConfig,
} from '../../data/announcement';
import { getAnnouncements, subscribeCmsInvalidation } from '../../lib/cmsApi';
import './AnnouncementBar.css';

export interface AnnouncementBarProps {
  config?: AnnouncementConfig;
}

/**
 * ANVI AnnouncementBar
 * Luxury running marquee ticker synchronized dynamically with Admin Command CMS
 */
export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  config: propConfig,
}) => {
  const [liveConfig, setLiveConfig] = useState<AnnouncementConfig>(() => propConfig ?? announcementConfig);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (propConfig) return;
    let cancelled = false;
    const refresh = (): void => {
      void getAnnouncements()
        .then((c) => {
          if (!cancelled) setLiveConfig(c);
        })
        .catch(() => {
          // static fallback already rendered
        });
    };
    refresh();
    const unsubscribe = subscribeCmsInvalidation(refresh);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [propConfig]);

  const config = propConfig || liveConfig;

  if (!config.isActive) {
    return null;
  }

  const rawItems: AnnouncementItemConfig[] =
    config.items && config.items.length > 0
      ? config.items.filter((it) => Boolean(it.message))
      : config.message
        ? [{ message: config.message, linkText: config.linkText, linkUrl: config.linkUrl }]
        : [];

  if (rawItems.length === 0) {
    return null;
  }

  // Ensure enough items in a group so that it seamlessly spans ultra-wide viewports (at least 4 items)
  const repeatMultiplier = Math.max(1, Math.ceil(4 / rawItems.length));
  const groupItems: AnnouncementItemConfig[] = Array.from(
    { length: repeatMultiplier },
    () => rawItems
  ).flat();

  // Speed calculation: duration scales comfortably with item count (min 28s, max 60s)
  const duration = config.speed ?? Math.max(28, Math.min(60, groupItems.length * 8));

  const renderGroup = (isAriaHidden = false) => (
    <div
      className="anvi-announcement-group"
      aria-hidden={isAriaHidden ? 'true' : undefined}
    >
      {groupItems.map((item, idx) => (
        <span key={`${item.id || 'item'}-${idx}`} className="anvi-announcement-item">
          <span className="anvi-announcement-dot" aria-hidden="true" />
          <span className="anvi-announcement-message">{item.message}</span>
          {item.linkUrl && item.linkText && (
            <a
              href={item.linkUrl}
              className="anvi-announcement-link"
              tabIndex={isAriaHidden ? -1 : 0}
            >
              {item.linkText}
            </a>
          )}
        </span>
      ))}
    </div>
  );

  return (
    <aside
      className="anvi-announcement-bar"
      role="region"
      aria-label="Store Announcements"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="anvi-announcement-viewport">
        <div
          className={`anvi-announcement-track ${isPaused ? 'anvi-announcement-track--paused' : ''}`}
          style={{ animationDuration: `${duration}s` }}
        >
          {renderGroup(false)}
          {renderGroup(true)}
        </div>
      </div>
    </aside>
  );
};

export default AnnouncementBar;
