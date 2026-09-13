import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { CMSTabs, CMSTabId } from './components/CMSTabs';
import { SaveChangesBar } from './components/SaveChangesBar';
import { AnnouncementManager } from './announcement/AnnouncementManager';
import { HeroBannerManager } from './hero/HeroBannerManager';
import { PopupManager } from './popup/PopupManager';
import { BlogManager } from './blog/BlogManager';
import { StoreAmbienceManager } from './ambience/StoreAmbienceManager';
import { InstagramReelsManager } from './instagram/InstagramReelsManager';
import { ReviewManager } from './reviews/ReviewManager';
import { useCMS } from '@/hooks/useCMS';
import { Button } from '@/components/ui/Button';
import { ExternalLink } from 'lucide-react';
import { APP_CONFIG } from '@/config/constants';

export const CMSPage: React.FC = () => {
  const {
    announcements,
    heroBanners,
    promoPopup,
    blogPosts,
    storeAmbience,
    elfsightWidgetId,
    instagramHandle,
    reviews,
    hasUnsavedChanges,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    addHeroBanner,
    updateHeroBanner,
    deleteHeroBanner,
    updatePopup,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    updateAmbience,
    updateElfsightConfig,
    addReview,
    updateReview,
    deleteReview,
    toggleReviewApproval,
    saveChanges,
    discardChanges,
  } = useCMS();

  const [activeTab, setActiveTab] = useState<CMSTabId>('announcements');
  const [saveLoading, setSaveLoading] = useState(false);

  const handleSave = () => {
    setSaveLoading(true);
    setTimeout(() => {
      saveChanges();
      setSaveLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <PageHeader
        title="Storefront Content Studio"
        subtitle="Curate editorial storytelling, hero campaigns, announcements, and showroom photography."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(APP_CONFIG.liveStoreUrl, '_blank')}
            className="text-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Customer Store</span>
          </Button>
        }
      />

      <CMSTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'announcements' && (
        <AnnouncementManager
          announcements={announcements}
          onAdd={addAnnouncement}
          onUpdate={updateAnnouncement}
          onDelete={deleteAnnouncement}
        />
      )}

      {activeTab === 'hero' && (
        <HeroBannerManager
          banners={heroBanners}
          onAdd={addHeroBanner}
          onUpdate={updateHeroBanner}
          onDelete={deleteHeroBanner}
        />
      )}

      {activeTab === 'reviews' && (
        <ReviewManager
          reviews={reviews}
          onAdd={addReview}
          onUpdate={updateReview}
          onDelete={deleteReview}
          onToggleApproval={toggleReviewApproval}
        />
      )}

      {activeTab === 'popup' && (
        <PopupManager
          popup={promoPopup}
          onUpdate={updatePopup}
        />
      )}

      {activeTab === 'blog' && (
        <BlogManager
          posts={blogPosts}
          onAdd={addBlogPost}
          onUpdate={updateBlogPost}
          onDelete={deleteBlogPost}
        />
      )}

      {activeTab === 'ambience' && (
        <StoreAmbienceManager
          ambience={storeAmbience}
          onUpdate={updateAmbience}
        />
      )}

      {activeTab === 'instagram' && (
        <InstagramReelsManager
          widgetId={elfsightWidgetId}
          instagramHandle={instagramHandle}
          onUpdate={updateElfsightConfig}
        />
      )}

      <SaveChangesBar
        hasChanges={hasUnsavedChanges}
        onSave={handleSave}
        onReset={discardChanges}
        loading={saveLoading}
      />
    </div>
  );
};
export default CMSPage;
