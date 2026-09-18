import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Package,
  User,
  MapPin,
  Heart,
  LogOut,
  Check,
  ShieldCheck,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { initialOrders, type Order } from '../../data/orders';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuth } from '../../hooks/useAuth';
import { AuthPage } from '../Auth/AuthPage';
import { useLiveProducts } from '../../hooks/useLiveProducts';
import { ProductCard } from '../../components/product/ProductCard';
import { AccountSkeleton } from '../../components/skeleton';
import { formatPrice } from '../../lib/formatters';
import { subscribeToStoreUpdates } from '../../lib/storeSync';
import { fetchMyStorefrontOrders } from '../../lib/ordersApi';
import { getSupabase } from '../../lib/supabaseClient';
import './AccountPage.css';

type AccountTab = 'orders' | 'profile' | 'addresses' | 'wishlist';

interface Address {
  id: string;
  isDefault: boolean;
  name: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

const initialAddresses: Address[] = [
  {
    id: 'addr-1',
    isDefault: true,
    name: 'Ananya Sundaram',
    street: '146, Raju Naidu St, Sivananda Colony, Tatabad',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641012',
    phone: '+91 99948 37459',
  },
  {
    id: 'addr-2',
    isDefault: false,
    name: 'Ananya Sundaram (Office)',
    street: 'Suite 204, Creative Millworks, Avinashi Road',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641004',
    phone: '+91 99948 37459',
  },
];

/**
 * ANVI Customer Account Experience
 *
 * Requirements:
 * - Profile, Orders, Order details, Wishlist, Saved addresses, Logout
 * - Consistent with main ANVI luxury aesthetic (no generic SaaS dashboard)
 * - Order history: order number, date, items, total, status
 * - Useful order details
 * - Mobile-first easy navigation
 */
export const AccountPage: React.FC = () => {
  const productsData = useLiveProducts();
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  const [userTab, setUserTab] = useState<AccountTab | null>(null);

  const activeTab: AccountTab = useMemo(() => {
    if (userTab) return userTab;
    if (location.includes('/account/orders')) return 'orders';
    if (location.includes('/account/wishlist')) return 'wishlist';
    return 'orders';
  }, [userTab, location]);

  const setActiveTab = (tab: AccountTab) => {
    setUserTab(tab);
  };

  // Load orders merged with newly placed orders from localStorage
  const loadOrders = useCallback(() => {
    if (typeof window === 'undefined') return initialOrders;
    try {
      const saved = localStorage.getItem('anvi_customer_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((o: any) => o.id));
          return [...parsed, ...initialOrders.filter((o) => !existingIds.has(o.id))];
        }
      }
    } catch {
      // ignore
    }
    return initialOrders;
  }, []);

  const [orders, setOrders] = useState<Order[]>(loadOrders);
  const [serverOrders, setServerOrders] = useState<Order[]>([]);

  useEffect(() => {
    const unsub = subscribeToStoreUpdates((e) => {
      if (e.type === 'ORDER_UPDATED' || e.type === 'ORDER_PLACED') {
        setOrders(loadOrders());
      }
    });
    return () => unsub();
  }, [loadOrders]);

  // Server orders for the signed-in patron, merged above local boutique orders
  useEffect(() => {
    if (!user) {
      setServerOrders([]);
      return;
    }
    let cancelled = false;
    void fetchMyStorefrontOrders()
      .then((rows) => {
        if (!cancelled) setServerOrders(rows);
      })
      .catch(() => {
        // local orders already rendered
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const allOrders = useMemo(() => {
    const seen = new Set(serverOrders.map((o) => o.id));
    return [...serverOrders, ...orders.filter((o) => !seen.has(o.id))];
  }, [serverOrders, orders]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  // Profile Form State (hydrated from the signed-in patron when available)
  const [profileData, setProfileData] = useState({
    firstName: 'Ananya',
    lastName: 'Sundaram',
    email: 'ananya.sundaram@example.com',
    phone: '+91 99948 37459',
    preferredDrape: 'Traditional Handloom Drape',
  });
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileData((prev) => ({
        ...prev,
        firstName: profile.first_name || prev.firstName,
        lastName: profile.last_name || prev.lastName,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone,
      }));
    } else if (user?.email) {
      setProfileData((prev) => ({ ...prev, email: user.email ?? prev.email }));
    }
  }, [profile, user]);

  // Addresses State (server-persisted for signed-in patrons, local fallback)
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    street: '',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '',
    phone: '',
  });

  // Logout state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Server address book for the signed-in patron
  useEffect(() => {
    if (!user) return;
    const sb = getSupabase();
    if (!sb) return;
    let cancelled = false;
    void sb
      .from('addresses')
      .select('id,is_default,full_name,address_line1,address_line2,city,state,postal_code,phone')
      .order('created_at')
      .then(({ data, error }) => {
        if (cancelled || error || !data || data.length === 0) return;
        setAddresses(
          (data as Array<Record<string, string | boolean | null>>).map((a) => ({
            id: String(a['id']),
            isDefault: Boolean(a['is_default']),
            name: String(a['full_name'] ?? ''),
            street: [a['address_line1'], a['address_line2']].filter(Boolean).join(', '),
            city: String(a['city'] ?? ''),
            state: String(a['state'] ?? ''),
            pincode: String(a['postal_code'] ?? ''),
            phone: String(a['phone'] ?? ''),
          }))
        );
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Wishlist context
  const { wishlistIds } = useWishlist();
  const savedWishlistProducts = productsData.filter((p) =>
    wishlistIds.includes(p.id)
  );

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const sb = getSupabase();
      if (sb) {
        const { error } = await sb
          .from('profiles')
          .update({
            first_name: profileData.firstName,
            last_name: profileData.lastName,
            phone: profileData.phone,
          })
          .eq('id', user.id);
        if (!error) {
          await refreshProfile();
        }
      }
    }
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 2400);
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
    if (user) {
      const sb = getSupabase();
      if (sb) {
        const snapshot = addresses;
        void (async () => {
          for (const addr of snapshot) {
            await sb.from('addresses').update({ is_default: addr.id === id }).eq('id', addr.id);
          }
        })();
      }
    }
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    if (user) {
      const sb = getSupabase();
      if (sb) {
        void sb.from('addresses').delete().eq('id', id).then(() => undefined);
      }
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const base = {
      isDefault: addresses.length === 0,
      name: newAddress.name || `${profileData.firstName} ${profileData.lastName}`,
      street: newAddress.street,
      city: newAddress.city,
      state: newAddress.state,
      pincode: newAddress.pincode,
      phone: newAddress.phone || profileData.phone,
    };
    if (user) {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb
          .from('addresses')
          .insert({
            profile_id: user.id,
            label: 'Home',
            full_name: base.name,
            phone: base.phone,
            address_line1: base.street,
            city: base.city,
            state: base.state,
            postal_code: base.pincode,
            is_default: base.isDefault,
          })
          .select('id')
          .single();
        if (!error && data) {
          setAddresses((prev) => [...prev, { ...base, id: (data as { id: string }).id }]);
          setIsAddingAddress(false);
          setNewAddress({ name: '', street: '', city: 'Coimbatore', state: 'Tamil Nadu', pincode: '', phone: '' });
          return;
        }
      }
    }
    const created: Address = { id: `addr-${Date.now()}`, ...base };
    setAddresses((prev) => [...prev, created]);
    setIsAddingAddress(false);
    setNewAddress({
      name: '',
      street: '',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '',
      phone: '',
    });
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await signOut();
    } catch {
      // local session already cleared
    }
    setLocation('/');
  };

  if (isLoading || authLoading) {
    return <AccountSkeleton />;
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="anvi-account-page">
      <div className="anvi-account-container">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="anvi-account-breadcrumb">
          <Link href="/">Home</Link>
          <span className="anvi-account-breadcrumb-sep">/</span>
          <span className="anvi-account-breadcrumb-current">My Account</span>
        </nav>

        {/* Client Suite Hero Card */}
        <div className="anvi-account-hero">
          <div className="anvi-account-hero-left">
            <div className="anvi-account-avatar" aria-hidden="true">
              {(profileData.firstName[0] || 'A').toUpperCase()}
              {(profileData.lastName[0] || '').toUpperCase()}
            </div>
            <div>
              <h1 className="anvi-account-greeting">
                Welcome back, {profileData.firstName}
              </h1>
              <div className="anvi-account-meta">
                <span>{profileData.email}</span>
                <span>·</span>
                <span className="anvi-account-meta-badge">
                  ✦ ANVI Clothing Patron
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="anvi-account-signout-btn"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="anvi-account-tabs-wrap">
          <ul className="anvi-account-tabs" role="tablist">
            <li role="presentation">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'orders'}
                className={`anvi-account-tab-btn ${
                  activeTab === 'orders' ? 'anvi-account-tab-btn--active' : ''
                }`}
                onClick={() => setActiveTab('orders')}
              >
                <Package size={16} />
                <span>Orders</span>
                <span className="anvi-account-tab-count">{allOrders.length}</span>
              </button>
            </li>

            <li role="presentation">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'profile'}
                className={`anvi-account-tab-btn ${
                  activeTab === 'profile' ? 'anvi-account-tab-btn--active' : ''
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={16} />
                <span>Profile</span>
              </button>
            </li>

            <li role="presentation">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'addresses'}
                className={`anvi-account-tab-btn ${
                  activeTab === 'addresses' ? 'anvi-account-tab-btn--active' : ''
                }`}
                onClick={() => setActiveTab('addresses')}
              >
                <MapPin size={16} />
                <span>Saved Addresses</span>
                <span className="anvi-account-tab-count">{addresses.length}</span>
              </button>
            </li>

            <li role="presentation">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'wishlist'}
                className={`anvi-account-tab-btn ${
                  activeTab === 'wishlist' ? 'anvi-account-tab-btn--active' : ''
                }`}
                onClick={() => setActiveTab('wishlist')}
              >
                <Heart size={16} />
                <span>Wishlist</span>
                <span className="anvi-account-tab-count">
                  {savedWishlistProducts.length}
                </span>
              </button>
            </li>
          </ul>
        </div>

        {/* ===================================================================
            TAB 1: ORDERS & ORDER DETAILS
            =================================================================== */}
        {activeTab === 'orders' && (
          <div className="anvi-orders-list" role="tabpanel" aria-label="Orders">
            {allOrders.map((order) => {
              const isDelivered = order.status === 'Delivered';

              return (
                <div key={order.id} className="anvi-order-card">
                  <div className="anvi-order-card-header">
                    <div className="anvi-order-card-meta">
                      <div>
                        <div className="anvi-order-id-label">Order Number</div>
                        <div className="anvi-order-id-val">#{order.id}</div>
                      </div>
                      <div>
                        <div className="anvi-order-id-label">Date Placed</div>
                        <div className="anvi-order-date-val">{order.date}</div>
                      </div>
                    </div>

                    <span
                      className={`anvi-order-status-pill ${
                        isDelivered
                          ? 'anvi-order-status-pill--delivered'
                          : 'anvi-order-status-pill--prep'
                      }`}
                    >
                      <span>●</span>
                      <span>{order.status}</span>
                    </span>
                  </div>

                  <div className="anvi-order-card-body">
                    <div className="anvi-order-items-preview">
                      {order.items.map((item) => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="anvi-order-item-thumb"
                          />
                          <div className="anvi-order-item-desc">
                            <span className="anvi-order-item-name">
                              {item.name}
                            </span>
                            <span className="anvi-order-item-qty">
                              Qty: {item.quantity} · {item.size || 'Free Size'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="anvi-order-card-right">
                      <div className="anvi-order-total-block">
                        <div className="anvi-order-total-label">Total</div>
                        <div className="anvi-order-total-val">
                          {formatPrice(order.total)}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="anvi-order-detail-btn"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View Order Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===================================================================
            TAB 2: PROFILE
            =================================================================== */}
        {activeTab === 'profile' && (
          <div className="anvi-profile-card" role="tabpanel" aria-label="Profile">
            <h2 className="anvi-profile-title">Personal Information</h2>

            <form onSubmit={handleProfileSubmit}>
              <div className="anvi-profile-grid">
                <div className="anvi-form-group">
                  <label htmlFor="prof-fn" className="anvi-form-label">First Name</label>
                  <input
                    id="prof-fn"
                    type="text"
                    className="anvi-form-input"
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, firstName: e.target.value })
                    }
                  />
                </div>

                <div className="anvi-form-group">
                  <label htmlFor="prof-ln" className="anvi-form-label">Last Name</label>
                  <input
                    id="prof-ln"
                    type="text"
                    className="anvi-form-input"
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, lastName: e.target.value })
                    }
                  />
                </div>

                <div className="anvi-form-group anvi-profile-full">
                  <label htmlFor="prof-em" className="anvi-form-label">Email Address</label>
                  <input
                    id="prof-em"
                    type="email"
                    className="anvi-form-input"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                  />
                </div>

                <div className="anvi-form-group anvi-profile-full">
                  <label htmlFor="prof-ph" className="anvi-form-label">Phone Number</label>
                  <input
                    id="prof-ph"
                    type="tel"
                    className="anvi-form-input"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="anvi-form-group anvi-profile-full">
                  <label htmlFor="prof-dr" className="anvi-form-label">Silhouette &amp; Drape Preference</label>
                  <select
                    id="prof-dr"
                    className="anvi-form-input"
                    value={profileData.preferredDrape}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        preferredDrape: e.target.value,
                      })
                    }
                  >
                    <option value="Traditional Handloom Drape">Traditional Handloom Drape</option>
                    <option value="Contemporary Pre-stitched Saree">Contemporary Pre-stitched Saree</option>
                    <option value="Tailored Anarkali & Salwar Suits">Tailored Anarkali &amp; Salwar Suits</option>
                    <option value="Minimalist Co-ord Sets">Minimalist Co-ord Sets</option>
                  </select>
                </div>
              </div>

              <div>
                <button type="submit" className="anvi-profile-btn">
                  Save Changes
                </button>
                {profileSavedToast && (
                  <span className="anvi-profile-saved-toast">
                    <Check size={16} /> Changes saved to your profile
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ===================================================================
            TAB 3: SAVED ADDRESSES
            =================================================================== */}
        {activeTab === 'addresses' && (
          <div role="tabpanel" aria-label="Saved Addresses">
            <div className="anvi-addresses-grid">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`anvi-address-card ${
                    addr.isDefault ? 'anvi-address-card--default' : ''
                  }`}
                >
                  {addr.isDefault && (
                    <span className="anvi-address-badge">
                      Primary Delivery Address
                    </span>
                  )}
                  <h3 className="anvi-address-name">{addr.name}</h3>
                  <p className="anvi-address-text">
                    {addr.street}
                    <br />
                    {addr.city}, {addr.state} — {addr.pincode}
                    <br />
                    Phone: {addr.phone}
                  </p>

                  <div className="anvi-address-actions">
                    {!addr.isDefault && (
                      <button
                        type="button"
                        className="anvi-address-action-btn"
                        onClick={() => handleSetDefaultAddress(addr.id)}
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      type="button"
                      className="anvi-address-action-btn anvi-address-action-btn--delete"
                      onClick={() => handleDeleteAddress(addr.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New Address Card */}
              {!isAddingAddress ? (
                <button
                  type="button"
                  className="anvi-add-address-card"
                  onClick={() => setIsAddingAddress(true)}
                >
                  <Plus size={24} color="var(--color-maroon)" />
                  <span className="anvi-add-address-title">
                    + Add New Address
                  </span>
                </button>
              ) : (
                <div className="anvi-address-card">
                  <h3 className="anvi-address-name">New Delivery Address</h3>
                  <form onSubmit={handleCreateAddress}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                      <input
                        type="text"
                        required
                        placeholder="Recipient Full Name *"
                        className="anvi-form-input"
                        value={newAddress.name}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, name: e.target.value })
                        }
                      />
                      <input
                        type="text"
                        required
                        placeholder="Street Address, Flat / House No. *"
                        className="anvi-form-input"
                        value={newAddress.street}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, street: e.target.value })
                        }
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <input
                          type="text"
                          required
                          placeholder="City *"
                          className="anvi-form-input"
                          value={newAddress.city}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, city: e.target.value })
                          }
                        />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="PIN Code *"
                          className="anvi-form-input"
                          value={newAddress.pincode}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, pincode: e.target.value })
                          }
                        />
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="Courier Phone Number *"
                        className="anvi-form-input"
                        value={newAddress.phone}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, phone: e.target.value })
                        }
                      />
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button type="submit" className="anvi-profile-btn" style={{ padding: '0.5rem 1.25rem' }}>
                          Save Address
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingAddress(false)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            color: 'rgba(47, 43, 43, 0.6)',
                            textDecoration: 'underline',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 4: WISHLIST (SAVED PIECES PREVIEW)
            =================================================================== */}
        {activeTab === 'wishlist' && (
          <div role="tabpanel" aria-label="Wishlist">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(47, 43, 43, 0.7)' }}>
                You have {savedWishlistProducts.length} saved heirloom {savedWishlistProducts.length === 1 ? 'piece' : 'pieces'} in your boutique wishlist.
              </p>
              <Link
                href="/wishlist"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.8125rem',
                  color: 'var(--color-maroon)',
                  fontWeight: 600,
                  textDecoration: 'underline',
                }}
              >
                <span>View Full Wishlist</span>
                <ExternalLink size={14} />
              </Link>
            </div>

            {savedWishlistProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: '#FFFFFF', borderRadius: 4, border: '1px solid rgba(47, 43, 43, 0.08)' }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-maroon)', margin: '0 0 1rem' }}>
                  No saved pieces in your wishlist.
                </p>
                <Link
                  href="/shop"
                  style={{
                    display: 'inline-block',
                    padding: '0.75rem 2rem',
                    backgroundColor: 'var(--color-maroon)',
                    color: '#FAF7F2',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    borderRadius: 2,
                  }}
                >
                  Explore Collections
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {savedWishlistProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===================================================================
          ORDER DETAILS MODAL
          =================================================================== */}
      {selectedOrder && (
        <div
          className="anvi-order-modal-backdrop"
          onClick={() => setSelectedOrder(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Order Details"
        >
          <div
            className="anvi-order-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="anvi-order-modal-header">
              <div>
                <h2 className="anvi-order-modal-title">
                  Order #{selectedOrder.id}
                </h2>
                <span style={{ fontSize: '0.8125rem', color: 'rgba(47, 43, 43, 0.6)' }}>
                  Placed on {selectedOrder.date}
                </span>
              </div>
              <button
                type="button"
                className="anvi-order-modal-close"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', padding: '0.75rem 0 1.25rem', borderBottom: '1px solid rgba(47, 43, 43, 0.08)', marginBottom: '1.25rem' }}>
              <span className={`anvi-order-status-badge ${selectedOrder.status === 'Delivered' ? 'anvi-order-status-badge--delivered' : 'anvi-order-status-badge--preparing'}`}>
                {selectedOrder.status}
              </span>
              {selectedOrder.trackingNumber && (
                <span style={{ fontSize: '0.75rem', color: 'rgba(47, 43, 43, 0.65)' }}>
                  {selectedOrder.courier || 'BlueDart Express'}: <strong>{selectedOrder.trackingNumber}</strong>
                </span>
              )}
            </div>

            {/* Line Items */}
            <div className="anvi-order-modal-items">
              <h3 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-maroon)', margin: '0 0 1rem' }}>
                Garments in this Order
              </h3>
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="anvi-order-modal-item-row">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="anvi-order-modal-thumb"
                  />
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem', fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--color-charcoal)' }}>
                      {item.name}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(47, 43, 43, 0.6)' }}>
                      Size: {item.size || 'Free Size'} · Qty: {item.quantity}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--color-maroon)' }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Summary & Address Grid */}
            <div className="anvi-order-modal-grid">
              <div className="anvi-order-modal-card">
                <h4 className="anvi-order-modal-card-title">Delivery Address</h4>
                <p className="anvi-order-modal-card-text">
                  <strong>{selectedOrder.shippingAddress.name}</strong>
                  <br />
                  {selectedOrder.shippingAddress.street}
                  <br />
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} — {selectedOrder.shippingAddress.pincode}
                  <br />
                  Phone: {selectedOrder.shippingAddress.phone}
                </p>
              </div>

              <div className="anvi-order-modal-card">
                <h4 className="anvi-order-modal-card-title">Payment &amp; Total</h4>
                <p className="anvi-order-modal-card-text">
                  Payment: {selectedOrder.paymentMethod}
                  <br />
                  Subtotal: {formatPrice(selectedOrder.subtotal)}
                  <br />
                  Shipping: {selectedOrder.shipping === 0 ? 'Complimentary' : formatPrice(selectedOrder.shipping)}
                  <br />
                  <strong style={{ color: 'var(--color-maroon)', fontSize: '0.9375rem' }}>
                    Total Paid: {formatPrice(selectedOrder.total)}
                  </strong>
                </p>
              </div>
            </div>

            {/* Boutique Assistance Note */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(47, 43, 43, 0.65)', borderTop: '1px solid rgba(47, 43, 43, 0.08)', paddingTop: '1rem' }}>
              <ShieldCheck size={16} color="var(--color-gold)" />
              <span>
                7-Day Boutique Exchange active for this order. For doorstep assistance, contact our Coimbatore team.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          LOGOUT CONFIRMATION MODAL
          =================================================================== */}
      {showLogoutConfirm && (
        <div
          className="anvi-order-modal-backdrop"
          onClick={() => setShowLogoutConfirm(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="anvi-order-modal"
            style={{ maxWidth: 420, textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-maroon)', margin: '0 0 0.5rem' }}>
              Sign Out
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'rgba(47, 43, 43, 0.7)', margin: '0 0 1.5rem' }}>
              Are you sure you wish to sign out of your ANVI client suite?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="anvi-profile-btn"
                onClick={handleLogout}
              >
                Confirm Sign Out
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(47, 43, 43, 0.2)',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: 2,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
