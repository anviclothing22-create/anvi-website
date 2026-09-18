import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Check,
  Send,
  Navigation,
  Sparkles,
  Calendar,
  Compass,
  Train,
  Plane,
} from 'lucide-react';
import { submitLead } from '../../lib/leadsApi';
import './ContactPage.css';

type ContactChannel = 'whatsapp' | 'call' | 'email';
type InquiryType =
  | 'appointment'
  | 'custom-styling'
  | 'sizing'
  | 'order-status'
  | 'press'
  | 'general';

interface FormState {
  name: string;
  email: string;
  phone: string;
  inquiryType: InquiryType;
  preferredChannel: ContactChannel;
  appointmentDate: string;
  orderNumber: string;
  message: string;
}

const INITIAL_FORM: FormState = {
  name: '',
  email: '',
  phone: '',
  inquiryType: 'appointment',
  preferredChannel: 'whatsapp',
  appointmentDate: '',
  orderNumber: '',
  message: '',
};

/**
 * Flagship ANVI Contact & Studio Visit Page
 * Editorial layout featuring the Coimbatore flagship boutique, store details,
 * immediate mobile WhatsApp/call actions, interactive arrival guide, and stationery-styled concierge form.
 */
export const ContactPage: React.FC = () => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setSubmitError('Please share your name, email and phone so our concierge can reply.');
      return;
    }
    setIsSubmitting(true);

    // Persist concierge inquiry as a lead (Supabase-first, offline-tolerant).
    const source =
      form.inquiryType === 'appointment' || form.inquiryType === 'custom-styling'
        ? 'fitting_booking'
        : form.preferredChannel === 'whatsapp'
          ? 'whatsapp'
          : 'website';
    void submitLead({
      fullName: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      source,
    })
      .catch(() => {
        // Offline — still confirm locally; lead syncs on next popup/checkout.
      })
      .finally(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
      });
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setIsSubmitted(false);
    setSubmitError(null);
  };

  return (
    <div className="anvi-contact-page">
      {/* Mobile Sticky Quick-Action Bar */}
      <aside className="anvi-contact-mobile-actionbar" aria-label="Quick contact actions">
        <a
          href="https://wa.me/919994837459?text=Hello%20ANVI%20Clothing,%20I%20would%20like%20to%20connect%20with%20a%20concierge."
          target="_blank"
          rel="noopener noreferrer"
          className="anvi-mobile-btn anvi-mobile-btn--whatsapp"
        >
          <MessageCircle size={18} />
          <span>WhatsApp Concierge</span>
        </a>
        <a href="tel:+919994837459" className="anvi-mobile-btn anvi-mobile-btn--call">
          <Phone size={18} />
          <span>Call</span>
        </a>
        <a
          href="https://www.google.com/maps/search/?api=1&query=146+Raju+Naidu+St+Sivananda+Colony+Tatabad+Coimbatore+Tamil+Nadu+641012"
          target="_blank"
          rel="noopener noreferrer"
          className="anvi-mobile-btn anvi-mobile-btn--directions"
        >
          <Navigation size={18} />
          <span>Directions</span>
        </a>
      </aside>

      {/* Breadcrumb navigation */}
      <div className="anvi-contact-breadcrumbs-wrap">
        <div className="anvi-contact-container">
          <nav aria-label="Breadcrumb" className="anvi-contact-breadcrumbs">
            <a href="/">Home</a>
            <span aria-hidden="true">/</span>
            <span>ANVI Clothing</span>
            <span aria-hidden="true">/</span>
            <span className="current">Contact & Visit</span>
          </nav>
        </div>
      </div>

      {/* Editorial Hero Header */}
      <header className="anvi-contact-hero">
        <div className="anvi-contact-container">
          <div className="anvi-hero-badge">
            <Sparkles size={13} />
            <span>ANVI Clothing · Tatabad, Coimbatore</span>
          </div>
          <h1 className="anvi-contact-title">Visit ANVI Clothing. Converse with Our Concierge.</h1>
          <p className="anvi-contact-subtitle">
            A sanctuary for tactile handlooms, bespoke tailoring, and unhurried design conversations.
            Walk through our Coimbatore doors or speak directly with our team from anywhere in the world.
          </p>
        </div>
      </header>

      {/* Storefront Visual Spread */}
      <section className="anvi-contact-storefront-section" aria-label="Studio storefront">
        <div className="anvi-contact-container">
          <div className="anvi-storefront-card">
            <img
              src="/images/brand/store_front.webp"
              alt="The ANVI flagship boutique in Tatabad, Coimbatore"
              className="anvi-storefront-image"
            />
            <div className="anvi-storefront-overlay">
              <div className="anvi-storefront-meta">
                <span className="anvi-storefront-tag">Flagship Boutique</span>
                <h3 className="anvi-storefront-name">146, Raju Naidu St, Tatabad, Coimbatore</h3>
                <p className="anvi-storefront-caption">
                  Open Monday through Saturday, 10:00 AM – 7:30 PM IST · Sunday by prior appointment
                </p>
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=146+Raju+Naidu+St+Sivananda+Colony+Tatabad+Coimbatore+Tamil+Nadu+641012"
                target="_blank"
                rel="noopener noreferrer"
                className="anvi-storefront-map-btn"
              >
                <Navigation size={15} />
                <span>Open in Google Maps</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout: 2 Editorial Columns */}
      <div className="anvi-contact-main">
        <div className="anvi-contact-container">
          <div className="anvi-contact-grid-wrapper">
            {/* Left Column: Store Details & Channels */}
            <div className="anvi-contact-info-column">
              {/* Location Details */}
              <div className="anvi-info-block">
                <div className="anvi-info-icon-title">
                  <div className="anvi-info-icon-badge">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="anvi-info-heading">Store Location</h3>
                    <p className="anvi-info-subtext">Sivananda Colony, Tatabad</p>
                  </div>
                </div>
                <div className="anvi-info-body">
                  <p className="anvi-address-text">
                    <strong>ANVI Clothing Flagship Store</strong><br />
                    146, Raju Naidu St, Sivananda Colony,<br />
                    Tatabad, Coimbatore, Tamil Nadu 641012, India
                  </p>
                </div>
              </div>

              {/* Hours & Availability */}
              <div className="anvi-info-block">
                <div className="anvi-info-icon-title">
                  <div className="anvi-info-icon-badge">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="anvi-info-heading">Store Timings</h3>
                    <p className="anvi-info-subtext">Monday to Saturday</p>
                  </div>
                </div>
                <div className="anvi-info-body">
                  <div className="anvi-hours-row">
                    <span className="day">Monday – Saturday</span>
                    <span className="time">10:00 AM – 7:30 PM IST</span>
                  </div>
                </div>
              </div>

              {/* Direct Concierge Channels */}
              <div className="anvi-info-block">
                <div className="anvi-info-icon-title">
                  <div className="anvi-info-icon-badge">
                    <Phone size={18} />
                  </div>
                  <div>
                    <h3 className="anvi-info-heading">Direct Concierge Channels</h3>
                    <p className="anvi-info-subtext">Immediate assistance from our master stylists</p>
                  </div>
                </div>
                <div className="anvi-channels-list">
                  <a
                    href="https://wa.me/919994837459?text=Hello%20ANVI%20Clothing,%20I%20would%20like%20to%20inquire%20about%20a%20garment/appointment."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="anvi-channel-row anvi-channel-row--whatsapp"
                  >
                    <div className="anvi-channel-detail">
                      <span className="channel-label">WhatsApp Concierge</span>
                      <span className="channel-value">+91 99948 37459</span>
                      <span className="channel-hint">Average response within 15 minutes</span>
                    </div>
                    <span className="channel-action">Chat Now ↗</span>
                  </a>

                  <a href="tel:+919994837459" className="anvi-channel-row">
                    <div className="anvi-channel-detail">
                      <span className="channel-label">Store Direct Line</span>
                      <span className="channel-value">+91 99948 37459</span>
                    </div>
                    <span className="channel-action">Call ↗</span>
                  </a>

                  <div className="anvi-channel-row anvi-channel-row--static">
                    <div className="anvi-channel-detail">
                      <span className="channel-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Mail size={13} color="var(--color-primary-maroon)" />
                        <span>Direct Email Address</span>
                      </span>
                      <div className="email-links">
                        <a href="mailto:anviclothing22@gmail.com">anviclothing22@gmail.com</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Editorial Concierge Form */}
            <div className="anvi-contact-form-column">
              <div className="anvi-stationery-card">
                {isSubmitted ? (
                  <div className="anvi-success-editorial">
                    <div className="anvi-success-seal">
                      <Check size={32} />
                    </div>
                    <span className="anvi-success-eyebrow">Inquiry Confirmed</span>
                    <h2 className="anvi-success-title">Thank You, {form.name}</h2>
                    <p className="anvi-success-body">
                      Your note has been received by our senior concierge at ANVI Clothing, Coimbatore.
                      We will connect with you via <strong>{form.preferredChannel.toUpperCase()}</strong> ({form.phone || form.email}) within 3 to 4 business hours.
                    </p>
                    {form.inquiryType === 'appointment' && form.appointmentDate && (
                      <div className="anvi-appointment-receipt">
                        <Calendar size={18} color="var(--color-primary-maroon)" />
                        <span>Requested Appointment Date: <strong>{form.appointmentDate}</strong></span>
                      </div>
                    )}
                    <button
                      type="button"
                      className="anvi-btn-send-another"
                      onClick={handleReset}
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="anvi-stationery-header">
                      <span className="anvi-stationery-eyebrow">Direct Correspondence</span>
                      <h2 className="anvi-stationery-title">Send a Note to Our Concierge</h2>
                      <p className="anvi-stationery-subtitle">
                        Whether requesting a fitting, bespoke sizing, or order support,
                        every inquiry is answered with personal care.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="anvi-editorial-form">
                      {submitError && (
                        <div role="alert" className="anvi-form-error" style={{ color: '#8a1c1c', marginBottom: 12 }}>
                          {submitError}
                        </div>
                      )}
                      {/* Inquiry Type Selector */}
                      <div className="anvi-field-group">
                        <label htmlFor="contact-inquiry-type" className="anvi-field-label">
                          Nature of Inquiry <span className="req">*</span>
                        </label>
                        <select
                          id="contact-inquiry-type"
                          value={form.inquiryType}
                          onChange={(e) =>
                            setForm({ ...form, inquiryType: e.target.value as InquiryType })
                          }
                          className="anvi-field-select"
                        >
                          <option value="appointment">Book a Store Visit / Fitting (Coimbatore)</option>
                          <option value="custom-styling">Bespoke Styling & Wardrobe Consultation</option>
                          <option value="sizing">Garment Sizing, Draping & Custom Alterations</option>
                          <option value="order-status">Order Status, Dispatch & Tracking</option>
                          <option value="press">Press, Collaborations & Wholesale</option>
                          <option value="general">General Inquiry</option>
                        </select>
                      </div>

                      {/* Name & Email */}
                      <div className="anvi-field-row">
                        <div className="anvi-field-group">
                          <label htmlFor="contact-full-name" className="anvi-field-label">
                            Full Name <span className="req">*</span>
                          </label>
                          <input
                            id="contact-full-name"
                            type="text"
                            required
                            placeholder="Ananya Sundaram"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="anvi-field-input"
                          />
                        </div>

                        <div className="anvi-field-group">
                          <label htmlFor="contact-email-addr" className="anvi-field-label">
                            Email Address <span className="req">*</span>
                          </label>
                          <input
                            id="contact-email-addr"
                            type="email"
                            required
                            placeholder="ananya@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="anvi-field-input"
                          />
                        </div>
                      </div>

                      {/* Phone & Preferred Contact Channel */}
                      <div className="anvi-field-row">
                        <div className="anvi-field-group">
                          <label htmlFor="contact-phone-num" className="anvi-field-label">
                            Phone / WhatsApp Number <span className="req">*</span>
                          </label>
                          <input
                            id="contact-phone-num"
                            type="tel"
                            required
                            placeholder="+91 98765 43210"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="anvi-field-input"
                          />
                        </div>

                        <div className="anvi-field-group">
                          <label className="anvi-field-label" id="contact-preferred-channel-label">
                            Preferred Channel <span className="req">*</span>
                          </label>
                          <div className="anvi-channel-pills" role="radiogroup" aria-labelledby="contact-preferred-channel-label">
                            <button
                              type="button"
                              className={`anvi-channel-pill ${
                                form.preferredChannel === 'whatsapp' ? 'active' : ''
                              }`}
                              onClick={() => setForm({ ...form, preferredChannel: 'whatsapp' })}
                            >
                              WhatsApp
                            </button>
                            <button
                              type="button"
                              className={`anvi-channel-pill ${
                                form.preferredChannel === 'call' ? 'active' : ''
                              }`}
                              onClick={() => setForm({ ...form, preferredChannel: 'call' })}
                            >
                              Call
                            </button>
                            <button
                              type="button"
                              className={`anvi-channel-pill ${
                                form.preferredChannel === 'email' ? 'active' : ''
                              }`}
                              onClick={() => setForm({ ...form, preferredChannel: 'email' })}
                            >
                              Email
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Conditional Date for Appointments */}
                      {(form.inquiryType === 'appointment' || form.inquiryType === 'custom-styling') && (
                        <div className="anvi-field-group">
                          <label htmlFor="contact-visit-date" className="anvi-field-label">
                            Preferred Visit Date (Optional)
                          </label>
                          <input
                            id="contact-visit-date"
                            type="date"
                            value={form.appointmentDate}
                            onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
                            className="anvi-field-input"
                          />
                        </div>
                      )}

                      {/* Conditional Order Number */}
                      {form.inquiryType === 'order-status' && (
                        <div className="anvi-field-group">
                          <label htmlFor="contact-order-num" className="anvi-field-label">
                            Order Number
                          </label>
                          <input
                            id="contact-order-num"
                            type="text"
                            placeholder="#ANVI-849201"
                            value={form.orderNumber}
                            onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                            className="anvi-field-input"
                          />
                        </div>
                      )}

                      {/* Message */}
                      <div className="anvi-field-group">
                        <label htmlFor="contact-msg-body" className="anvi-field-label">
                          Your Message / Specific Notes <span className="req">*</span>
                        </label>
                        <textarea
                          id="contact-msg-body"
                          required
                          rows={4}
                          placeholder="Please let us know how we can assist you, your preferred silhouette or drape requirements..."
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          className="anvi-field-textarea"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="anvi-btn-submit-editorial"
                      >
                        {isSubmitting ? (
                          <span>Connecting with Concierge...</span>
                        ) : (
                          <>
                            <Send size={16} />
                            <span>Send Message to Concierge</span>
                          </>
                        )}
                      </button>

                      <p className="anvi-form-reassurance">
                        ✦ We respect your privacy. Your contact information is never shared with third parties.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map & Arrival Guide Section */}
      <section className="anvi-contact-map-section" aria-label="Store Map and Arrival Guide">
        <div className="anvi-contact-container">
          <div className="anvi-arrival-header">
            <span className="anvi-arrival-eyebrow">Reaching the Boutique</span>
            <h2 className="anvi-arrival-title">How to Arrive at ANVI Clothing</h2>
            <p className="anvi-arrival-subtitle">
              Located at 146, Raju Naidu St, Sivananda Colony, Tatabad, Coimbatore.
            </p>
          </div>

          <div className="anvi-arrival-grid">
            {/* Embedded Google Map */}
            <div className="anvi-map-container">
              <iframe
                title="ANVI Clothing Location in Tatabad, Coimbatore"
                src="https://maps.google.com/maps?q=146+Raju+Naidu+St+Sivananda+Colony+Tatabad+Coimbatore+Tamil+Nadu+641012&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="380"
                style={{ border: 0, borderRadius: 4 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="anvi-map-footer">
                <div className="anvi-map-pin-detail">
                  <Compass size={16} color="var(--color-primary-maroon)" />
                  <span>GPS: 11.0250° N, 76.9600° E · Coimbatore, Tamil Nadu</span>
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=146+Raju+Naidu+St+Sivananda+Colony+Tatabad+Coimbatore+Tamil+Nadu+641012"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="anvi-map-direct-link"
                >
                  <Navigation size={14} />
                  <span>Get Live Directions</span>
                </a>
              </div>
            </div>

            {/* Transit Transit Times & Airport / Train Notes */}
            <div className="anvi-transit-guide">
              <h3 className="anvi-transit-title">Transit & Distance Guide</h3>

              <div className="anvi-transit-item">
                <div className="anvi-transit-icon">
                  <Plane size={18} />
                </div>
                <div>
                  <h4 className="transit-heading">From Coimbatore International Airport (CJB)</h4>
                  <p className="transit-body">
                    Approx. 9.5 km · 20 minutes drive via Avinashi Road. Taxis and airport cabs available 24/7.
                  </p>
                </div>
              </div>

              <div className="anvi-transit-item">
                <div className="anvi-transit-icon">
                  <Train size={18} />
                </div>
                <div>
                  <h4 className="transit-heading">From Coimbatore Junction Railway Station (CBE)</h4>
                  <p className="transit-body">
                    Approx. 3.2 km · 10 minutes drive via State Bank Road. Direct auto-rickshaw and cab access.
                  </p>
                </div>
              </div>

              <div className="anvi-transit-item">
                <div className="anvi-transit-icon">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="transit-heading">Landmark & Location</h4>
                  <p className="transit-body">
                    Located in Sivananda Colony, Tatabad. Conveniently accessible via Dr. Rajendra Prasad Road and Sathyamangalam Road.
                  </p>
                </div>
              </div>

              <div className="anvi-transit-callout">
                <p>
                  Visiting from Bengaluru, Chennai, or Kochi for curated handloom shopping? Let our concierge know in advance and we can arrange custom fabric swatches ready upon your arrival.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
