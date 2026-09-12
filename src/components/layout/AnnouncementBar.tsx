import React, { useState, useEffect } from 'react';
import { announcementConfig, type AnnouncementConfig } from '../../data/announcement';
import { getAnnouncements, subscribeCmsInvalidation } from '../../lib/cmsApi';
import './AnnouncementBar.css';

export interface AnnouncementBarProps {
  config?: AnnouncementConfig;
}

/**
 * ANVI AnnouncementBar
 * Dynamically synchronized with Admin Command CMS
 */
export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  config: propConfig,
}) => {
  const [liveConfig, setLiveConfig] = useState<AnnouncementConfig>(() => propConfig ?? announcementConfig);

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

  if (!config.isActive || !config.message) {
    return null;
  }

  return (
    <aside
      className="anvi-announcement-bar"
      role="region"
      aria-label="Announcement"
    >
      <div className="anvi-announcement-inner">
        <p className="anvi-announcement-text">
          <span className="anvi-announcement-dot" aria-hidden="true" />
          <span>{config.message}</span>
          {config.linkUrl && config.linkText && (
            <>
              <span className="anvi-announcement-dot" aria-hidden="true" />
              <a
                href={config.linkUrl}
                className="anvi-announcement-link"
              >
                {config.linkText}
              </a>
            </>
          )}
        </p>
      </div>
    </aside>
  );
};

export default AnnouncementBar;
