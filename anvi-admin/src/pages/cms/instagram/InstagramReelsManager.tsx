import React, { useState } from 'react';
import { Play, CheckCircle2, ExternalLink, Sparkles, HelpCircle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/config/constants';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface InstagramReelsManagerProps {
  widgetId: string;
  instagramHandle: string;
  onUpdate: (widgetId: string, handle?: string) => void;
}

export const InstagramReelsManager: React.FC<InstagramReelsManagerProps> = ({
  widgetId,
  instagramHandle,
  onUpdate,
}) => {
  const [currentId, setCurrentId] = useState(widgetId || '');
  const [handle, setHandle] = useState(instagramHandle || 'anviclothing_coimbatore');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedSample, setCopiedSample] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(currentId.trim(), handle.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const isConnected = Boolean(currentId.trim());

  const sampleDemoId = 'c0326ebc-e1fb-449e-b997-76b6bca501b8';

  const copySample = () => {
    setCurrentId(sampleDemoId);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview & Status Banner */}
      <div className="p-6 bg-white rounded-2xl border border-anvi-sand/60 shadow-luxury-subtle">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-anvi-sand/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <InstagramIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-anvi-charcoal">
                Instagram Reels &amp; Visual Feed
              </h2>
              <p className="text-xs text-anvi-muted">
                Connect your Elfsight Instagram Widget to stream reels directly from{' '}
                <strong className="text-anvi-maroon">@{handle.replace(/^@/, '')}</strong> to the storefront.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {isConnected ? 'Elfsight Live Connected' : 'Curated Fallback Active'}
            </span>

            <a
              href={`https://instagram.com/${handle.replace(/^@/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-anvi-charcoal bg-anvi-linen hover:bg-anvi-sand/50 transition-colors"
            >
              <span>View Profile</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSave} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Widget ID Input */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-anvi-charcoal">
                Elfsight Widget ID <span className="text-anvi-maroon">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. c0326ebc-e1fb-449e-b997-76b6bca501b8"
                  value={currentId}
                  onChange={(e) => setCurrentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-anvi-cream/40 border border-anvi-sand/70 rounded-xl focus:outline-none focus:ring-1 focus:ring-anvi-maroon focus:border-anvi-maroon"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-anvi-muted">
                <span>The unique 36-character ID provided in your Elfsight dashboard.</span>
                <button
                  type="button"
                  onClick={copySample}
                  className="text-anvi-maroon hover:underline flex items-center gap-1"
                >
                  {copiedSample ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSample ? 'Inserted!' : 'Insert Demo ID'}</span>
                </button>
              </div>
            </div>

            {/* Instagram Handle */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-anvi-charcoal">
                Instagram Account Handle
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-anvi-muted">
                  @
                </span>
                <input
                  type="text"
                  value={handle.replace(/^@/, '')}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 text-xs bg-anvi-cream/40 border border-anvi-sand/70 rounded-xl focus:outline-none focus:ring-1 focus:ring-anvi-maroon focus:border-anvi-maroon"
                />
              </div>
              <p className="text-[11px] text-anvi-muted">
                Used for header links and fallback branding on the storefront reels section.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-anvi-sand/30">
            <div className="flex items-center gap-2">
              {isSaved && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Live sync pushed to storefront (:5173)!
                </span>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="px-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Save &amp; Broadcast to Storefront</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Guide: How Elfsight Works with ANVI */}
      <div className="p-6 bg-anvi-cream/60 rounded-2xl border border-anvi-sand/60">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-anvi-sand/40 text-anvi-maroon shrink-0 mt-0.5">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-semibold text-anvi-charcoal">
              How Elfsight Instagram Reels Works on ANVI
            </h3>
            <ol className="list-decimal list-inside text-xs text-anvi-charcoal/80 space-y-1.5 leading-relaxed">
              <li>
                Visit{' '}
                <a
                  href="https://elfsight.com/instagram-feed-widget/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-anvi-maroon font-semibold underline inline-flex items-center gap-0.5"
                >
                  Elfsight Instagram Feed Widget
                  <ExternalLink className="w-3 h-3 inline" />
                </a>{' '}
                and create a new widget connected to <span className="font-medium">@{handle.replace(/^@/, '')}</span>.
              </li>
              <li>Select your preferred layout (e.g. &ldquo;Reels Carousel&rdquo; or &ldquo;Instagram Grid&rdquo;).</li>
              <li>Click &ldquo;Publish&rdquo; or &ldquo;Add to Website&rdquo; and copy the Widget ID from the embed snippet.</li>
              <li>Paste the ID above and click &ldquo;Save &amp; Broadcast to Storefront&rdquo;.</li>
              <li>
                The storefront at <code className="px-1.5 py-0.5 bg-white border border-anvi-sand/60 rounded text-[11px] font-mono">{APP_CONFIG.liveStoreUrl}</code> will dynamically inject the Elfsight script and render the live video feed.
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Storefront Visual Preview */}
      <div className="p-6 bg-white rounded-2xl border border-anvi-sand/60 shadow-luxury-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-sm font-semibold text-anvi-charcoal">
            Storefront Preview Appearance
          </h3>
          <span className="text-[11px] text-anvi-muted">
            Homepage &gt; Visual Stories Section
          </span>
        </div>

        <div className="p-4 bg-anvi-linen/30 rounded-xl border border-anvi-sand/40 space-y-4">
          <div className="text-center max-w-sm mx-auto space-y-1">
            <div className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest text-anvi-maroon font-medium">
              <InstagramIcon className="w-3 h-3" />
              <span>@{handle.replace(/^@/, '')}</span>
            </div>
            <h4 className="font-serif text-base text-anvi-charcoal font-semibold">
              Woven Moments &amp; Draped Grace
            </h4>
            <p className="text-[11px] text-anvi-muted">
              {isConnected
                ? `Streaming live via Elfsight App ID: ${currentId}`
                : 'Showing interactive studio reels preview (ready to connect)'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                title: 'Ajrakh Chanderi Silk Drape',
                views: '14.2k',
                img: '/images/products/saree_ajrakh_1.jpg',
              },
              {
                title: 'Handloom Modal Cotton Flow',
                views: '9.8k',
                img: '/images/products/salwar_bagru_1.jpg',
              },
              {
                title: 'Bespoke Co-ord Sets',
                views: '18.5k',
                img: '/images/products/coord_indigo_1.jpg',
              },
              {
                title: 'Coimbatore Boutique BTS',
                views: '22.1k',
                img: '/images/products/set_ivory_1.jpg',
              },
            ].map((reel, idx) => (
              <div
                key={idx}
                className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-anvi-sand/30 shadow-sm"
              >
                <img
                  src={reel.img}
                  alt={reel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white">
                  <Play className="w-3 h-3 fill-white" />
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <p className="text-[10px] font-medium line-clamp-1">{reel.title}</p>
                  <p className="text-[9px] text-white/80">{reel.views} plays</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default InstagramReelsManager;
