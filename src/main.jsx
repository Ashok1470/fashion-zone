import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search, ShoppingBag, UserRound, Menu, X, Heart, LogOut, Plus,
  Trash2, Pencil, Package, Users, IndianRupee, MessageCircle,
  Instagram, ChevronRight, Minus, ArrowLeft, ShieldCheck, Truck,
  CheckCircle2, LayoutDashboard, MapPin, Phone, Star, Eye
} from "lucide-react";
import "./styles.css";
import fashionZoneLogo from "./assets/fashion-zone-logo.png";

const BUSINESS = {
  name: "FASHION ZONE",
  tagline: "The Multi Brand Store",
  instagram: "itfashionzone",
  whatsapp: "918919321569",
  displayWhatsapp: "8919321569",
  address: "Near Parvathanamma Temple, Gantapalem, ONGOLE - 523 001"
};

const DEFAULT_SITE_SETTINGS = {
  logo: "",
  whatsapp: BUSINESS.displayWhatsapp,
  whatsappMessage: "Hello Fashion Zone, I need help regarding your products/order."
};

const CATEGORIES = [
  "All", "Branded Shirts", "Jeans Pants", "Formal Trousers", "T-Shirts",
  "Track Pants", "Shorts", "Belts", "Wallets", "Inner Wears", "Combo Pants", "Combo Shirts"
];

const CATEGORY_SHORT = {
  "Branded Shirts":"SH", "Jeans Pants":"JN", "Formal Trousers":"TR",
  "T-Shirts":"TS", "Track Pants":"TP", "Shorts":"SO", "Belts":"BE",
  "Wallets":"WA", "Inner Wears":"IW", "Combo Pants":"CP", "Combo Shirts":"CS"
};

const money = n => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const read = (key, fallback) => {
  try { const x = JSON.parse(localStorage.getItem(key)); return x ?? fallback; }
  catch { return fallback; }
};
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const PRODUCTS_STORAGE_KEY = "fz_products_v2";
const CATEGORIES_STORAGE_KEY = "fz_categories_v1";
const NOTIFICATIONS_STORAGE_KEY = "fz_admin_notifications_v1";

function App() {
  const [users, setUsers] = useState(() => read("fz_users", []));
  const [products, setProducts] = useState(() => {
    const stored = read(PRODUCTS_STORAGE_KEY, []);
    // Only products created by the admin are shown. Remove legacy demo/seed
    // products from older versions while preserving real admin-added products.
    return Array.isArray(stored)
      ? stored.filter(product => !String(product?.id || "").startsWith("seed_"))
      : [];
  });
  const [categories, setCategories] = useState(() => read(CATEGORIES_STORAGE_KEY, CATEGORIES.filter(c => c !== "All")));
  const [notifications, setNotifications] = useState(() => read(NOTIFICATIONS_STORAGE_KEY, []));
  const [orders, setOrders] = useState(() => read("fz_orders", []));
  const [siteSettings, setSiteSettings] = useState(() => read("fz_site_settings_v1", DEFAULT_SITE_SETTINGS));
  const [session, setSession] = useState(() => read("fz_session", null));
  const [cart, setCart] = useState(() => read("fz_cart", []));
  const [page, setPage] = useState(() => session ? "home" : "login");
  const [authMode, setAuthMode] = useState("login");
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("popular");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => save("fz_users", users), [users]);
  useEffect(() => save(PRODUCTS_STORAGE_KEY, products), [products]);
  useEffect(() => save(CATEGORIES_STORAGE_KEY, categories), [categories]);
  useEffect(() => save(NOTIFICATIONS_STORAGE_KEY, notifications), [notifications]);
  useEffect(() => save("fz_orders", orders), [orders]);
  useEffect(() => save("fz_site_settings_v1", siteSettings), [siteSettings]);
  useEffect(() => save("fz_cart", cart), [cart]);
  useEffect(() => save("fz_session", session), [session]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const isAdmin = session?.role === "admin";
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const go = (next, data = null) => {
    setPage(next);
    setSelected(data);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const logout = () => {
    setSession(null);
    setCart([]);
    setPage("login");
    setToast("Logged out successfully.");
  };

  if (!session) {
    return (
      <Auth
        mode={authMode}
        setMode={setAuthMode}
        users={users}
        setUsers={setUsers}
        setSession={setSession}
        onLogin={() => setPage("home")}
        logoSrc={siteSettings.logo || fashionZoneLogo}
      />
    );
  }

  return (
    <div className="app">
      <Header
        session={session}
        cartCount={cartCount}
        query={query}
        setQuery={setQuery}
        page={page}
        go={go}
        logout={logout}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        isAdmin={isAdmin}
        logoSrc={siteSettings.logo || fashionZoneLogo}
      />

      <main>
        {page === "home" && (
          <Home
            products={products}
            categories={categories}
            query={query}
            category={category}
            setCategory={setCategory}
            sort={sort}
            setSort={setSort}
            go={go}
            setToast={setToast}
            cart={cart}
            setCart={setCart}
          />
        )}
        {page === "product" && selected && (
          <ProductPage
            product={selected}
            go={go}
            cart={cart}
            setCart={setCart}
            setToast={setToast}
          />
        )}
        {page === "cart" && (
          <Cart
            cart={cart}
            setCart={setCart}
            go={go}
          />
        )}
        {page === "checkout" && (
          <Checkout
            session={session}
            cart={cart}
            setCart={setCart}
            setOrders={setOrders}
            setNotifications={setNotifications}
            go={go}
            setToast={setToast}
          />
        )}
        {page === "orders" && (
          <Orders orders={orders.filter(o => o.userId === session.id)} />
        )}
        {page === "profile" && (
          <Profile
            session={session}
            users={users}
            setUsers={setUsers}
            setSession={setSession}
            setToast={setToast}
          />
        )}
        {page === "admin" && isAdmin && (
          <Admin
            products={products}
            setProducts={setProducts}
            categories={categories}
            setCategories={setCategories}
            orders={orders}
            setOrders={setOrders}
            users={users}
            notifications={notifications}
            setNotifications={setNotifications}
            siteSettings={siteSettings}
            setSiteSettings={setSiteSettings}
            setToast={setToast}
          />
        )}
      </main>

      {page !== "admin" && <Footer logoSrc={siteSettings.logo || fashionZoneLogo} />}

      <a
        className="whatsapp"
        href={`https://wa.me/91${String(siteSettings.whatsapp || BUSINESS.displayWhatsapp).replace(/\D/g, "").replace(/^91/, "")}?text=${encodeURIComponent(siteSettings.whatsappMessage || DEFAULT_SITE_SETTINGS.whatsappMessage)}`}
        target="_blank"
        rel="noreferrer"
      >
        <MessageCircle size={22} />
        <span>WhatsApp Support</span>
      </a>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function Auth({ mode, setMode, users, setUsers, setSession, onLogin, logoSrc }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [forgot, setForgot] = useState(false);
  const [resetMobile, setResetMobile] = useState("");
  const [resetPassword, setResetPassword] = useState("");

  const submit = e => {
    e.preventDefault();
    setError("");
    if (forgot) {
      if (!/^[6-9]\d{9}$/.test(resetMobile)) return setError("Enter a valid 10-digit Indian mobile number.");
      if (resetPassword.length < 6) return setError("New password must be at least 6 characters.");
      const idx = users.findIndex(u => u.mobile === resetMobile);
      if (idx < 0) return setError("No customer account found with this mobile number.");
      const updated = users.map(u => u.mobile === resetMobile ? { ...u, password: resetPassword } : u);
      setUsers(updated);
      setForgot(false); setMobile(resetMobile); setPassword(""); setResetMobile(""); setResetPassword("");
      setError("Password reset successfully. Please login.");
      return;
    }

    if (mobile === "8919321569" && password === "8919321569" && mode === "login") {
      setSession({ id: "admin", name: "Fashion Zone Admin", mobile: "8919321569", role: "admin" });
      onLogin();
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (mode === "register") {
      if (!name.trim()) return setError("Please enter your name.");
      if (users.some(u => u.mobile === mobile)) {
        setError("This mobile number is already registered.");
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }
      const newUser = {
        id: "u_" + Date.now(),
        name: name.trim(),
        mobile,
        password,
        role: "customer",
        address: {}
      };
      setUsers(prev => [...prev, newUser]);
      setMode("login");
      setMobile(mobile);
      setPassword("");
      setConfirm("");
      alert("Registration successful. Please login.");
    } else {
      const user = users.find(u => u.mobile === mobile);
      if (!user) {
        setError("Wrong mobile number.");
        return;
      }
      if (user.password !== password) {
        setError("Wrong password.");
        return;
      }
      setSession({ id: user.id, name: user.name, mobile: user.mobile, role: user.role });
      onLogin();
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-orbit orbit-a"></div>
        <div className="auth-orbit orbit-b"></div>
        <img className="auth-logo" src={logoSrc} alt="Fashion Zone - The Multi Brand Store" />
        <span className="eyebrow light">MEN'S FASHION • ONGole</span>
        <h1>FASHION<br /><em>ZONE</em></h1>
        <p>{BUSINESS.tagline}</p>
        <div className="auth-chips">
          <span>Mens Wear</span><span>Sports Wear</span><span>Accessories</span>
        </div>
      </div>

      <div className="auth-box">
        <div className="auth-tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>Login</button>
          <button className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(""); }}>Register</button>
        </div>

        <div className="auth-heading">
          <span className="eyebrow">WELCOME TO FASHION ZONE</span>
          <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p>{mode === "login" ? "Login to continue shopping." : "Register once with your mobile number."}</p>
        </div>

        <form onSubmit={submit} className="auth-form">
          {mode === "register" && (
            <label>Full Name
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" />
            </label>
          )}
          <label>Mobile Number
            <input
              inputMode="numeric"
              maxLength="10"
              value={mobile}
              onChange={e => setMobile(e.target.value.replace(/\D/g, ""))}
              placeholder="10-digit mobile number"
            />
          </label>
          <label>Password
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 6 characters" />
          </label>
          {mode === "register" && (
            <label>Confirm Password
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" />
            </label>
          )}

          {error && <div className="error">{error}</div>}
          <button className="primary full" type="submit">
            {mode === "login" ? "Login to Fashion Zone" : "Create Account"}
          </button>
        </form>

        {mode === "login" && !forgot && (
          <button type="button" className="forgot-link" onClick={()=>{setForgot(true);setError("")}}>Forgot password?</button>
        )}

        {forgot && (
          <div className="forgot-box">
            <div className="eyebrow">PASSWORD RESET</div>
            <p>Reset your customer account password using your registered mobile number.</p>
            <label>Registered Mobile<input inputMode="numeric" maxLength="10" value={resetMobile} onChange={e=>setResetMobile(e.target.value.replace(/\D/g, ""))} placeholder="10-digit mobile number" /></label>
            <label>New Password<input type="password" value={resetPassword} onChange={e=>setResetPassword(e.target.value)} placeholder="Minimum 6 characters" /></label>
            <button type="button" className="primary full" onClick={submit}>Reset Password</button>
            <button type="button" className="secondary full" onClick={()=>{setForgot(false);setError("")}}>Back to Login</button>
          </div>
        )}

        <div className="auth-security"><ShieldCheck size={17} /> One mobile number = one account</div>
      </div>
    </div>
  );
}

function Header({ session, cartCount, query, setQuery, page, go, logout, menuOpen, setMenuOpen, isAdmin, logoSrc }) {
  return (
    <header className="header">
      <div className="nav container">
        <button className="mobile-menu" onClick={() => setMenuOpen(v => !v)}>{menuOpen ? <X /> : <Menu />}</button>

        <button className="brand" onClick={() => go("home")}>
          <img className="brand-logo" src={logoSrc} alt="Fashion Zone - The Multi Brand Store" />
        </button>

        <div className="search">
          <Search size={18} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search shirts, jeans, accessories..." />
        </div>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          <button className={page === "home" ? "nav-active" : ""} onClick={() => go("home")}>Home</button>
          <button onClick={() => go("orders")}>Orders</button>
          <button onClick={() => go("profile")}><UserRound size={16} /> {session.name.split(" ")[0]}</button>
          {isAdmin && <button className="admin-nav" onClick={() => go("admin")}><LayoutDashboard size={16} /> Admin</button>}
          <button onClick={logout}><LogOut size={16} /> Logout</button>
        </nav>

        <button className="cart-button" onClick={() => go("cart")}>
          <ShoppingBag size={21} />
          {cartCount > 0 && <span>{cartCount}</span>}
        </button>
      </div>
    </header>
  );
}

function Home({ products, categories, query, category, setCategory, sort, setSort, go, setToast, cart, setCart }) {
  const filtered = useMemo(() => {
    let list = products.filter(p =>
      (category === "All" || p.category === category) &&
      `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(query.toLowerCase())
    );
    if (sort === "priceLow") list.sort((a,b) => a.price - b.price);
    if (sort === "priceHigh") list.sort((a,b) => b.price - a.price);
    if (sort === "rating") list.sort((a,b) => b.rating - a.rating);
    return list;
  }, [products, query, category, sort]);

  const addToCart = product => {
    setCart(current => {
      const existing = current.find(x => x.id === product.id);
      if (existing) {
        return current.map(x => x.id === product.id ? { ...x, qty: Math.min(x.qty + 1, product.stock) } : x);
      }
      return [...current, { ...product, qty: 1 }];
    });
    setToast("Product added to cart.");
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-copy">
            <span className="eyebrow light">NEW SEASON • MEN'S COLLECTION</span>
            <h1>Style that speaks <em>for you.</em></h1>
            <p>Discover branded shirts, denim, sportswear and accessories at Fashion Zone — your multi brand store in Ongole.</p>
            <button className="primary hero-btn" onClick={() => document.getElementById("shop").scrollIntoView({ behavior: "smooth" })}>
              Shop Collection <ChevronRight size={18} />
            </button>
          </div>
          <div className="hero-art">
            <div className="hero-glow"></div>
            <div className="hero-product-card">
              <span>FZ</span>
              <b>FASHION<br />ZONE</b>
              <small>MEN'S COLLECTION</small>
            </div>
            <div className="floating-tag">NEW<br /><strong>DROP</strong></div>
          </div>
        </div>
      </section>

      <section className="container trust">
        <div><Truck /><span><b>Local Delivery</b><small>Convenient ordering in Ongole</small></span></div>
        <div><ShieldCheck /><span><b>Quality Fashion</b><small>Curated men's styles</small></span></div>
        <div><MessageCircle /><span><b>Customer Support</b><small>WhatsApp support available</small></span></div>
      </section>

      <section className="container section" id="shop">
        <div className="section-heading">
          <div><span className="eyebrow">SHOP BY STYLE</span><h2>Explore categories</h2></div>
        </div>
        <div className="category-row">
          {categories.map(categoryName => (
            <button
              className={`category-card ${category === categoryName ? "selected" : ""}`}
              key={categoryName}
              onClick={() => setCategory(categoryName)}
            >
              <span>{CATEGORY_SHORT[categoryName]}</span>
              {categoryName}
            </button>
          ))}
        </div>
      </section>

      <section className="container section products-section">
        <div className="section-heading">
          <div><span className="eyebrow">OUR COLLECTION</span><h2>{query ? `Results for "${query}"` : "Trending now"}</h2></div>
          <select value={sort} onChange={e => setSort(e.target.value)}>
            <option value="popular">Popular</option>
            <option value="rating">Top Rated</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
          </select>
        </div>

        {filtered.length ? (
          <div className="products-grid">
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onView={() => go("product", product)}
                onAdd={() => addToCart(product)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Package size={42} />
            <h3>No products available yet</h3>
            <p>Products will appear here after the admin adds them.</p>
            <button className="secondary" onClick={() => setCategory("All")}>Clear filters</button>
          </div>
        )}
      </section>
    </>
  );
}

function ProductCard({ product:p, onView, onAdd }) {
  const discount = p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  return (
    <article className="product-card">
      <div className="product-photo" onClick={onView}>
        <img src={p.image} alt={p.name} />
        {discount > 0 && <span className="discount-badge">{discount}% OFF</span>}
        <button className="heart" onClick={e => e.stopPropagation()} aria-label="Wishlist"><Heart size={17} /></button>
      </div>
      <div className="product-details">
        <small>{p.category}</small>
        <h3 onClick={onView}>{p.name}</h3>
        <div className="rating"><Star size={12} fill="currentColor" /> {p.rating}</div>
        <div className="price-line"><b>{money(p.price)}</b>{p.oldPrice > p.price && <del>{money(p.oldPrice)}</del>}</div>
        <button className="add-cart" onClick={onAdd}>Add to Cart</button>
      </div>
    </article>
  );
}

function ProductPage({ product:p, go, cart, setCart, setToast }) {
  const [size, setSize] = useState(p.sizes[0]);
  const [qty, setQty] = useState(1);

  const add = () => {
    setCart(current => {
      const existing = current.find(x => x.id === p.id);
      if (existing) return current.map(x => x.id === p.id ? { ...x, qty: Math.min(x.qty + qty, p.stock), size } : x);
      return [...current, { ...p, qty, size }];
    });
    setToast("Product added to cart.");
  };

  return (
    <section className="container section product-page">
      <button className="back-button" onClick={() => go("home")}><ArrowLeft size={17} /> Back to shopping</button>
      <div className="product-detail">
        <div className="detail-photo"><img src={p.image} alt={p.name} /></div>
        <div className="detail-info">
          <span className="eyebrow">{p.category}</span>
          <h1>{p.name}</h1>
          <p className="muted">{p.brand}</p>
          <div className="detail-rating"><Star size={15} fill="currentColor" /> {p.rating} <span>• In stock: {p.stock}</span></div>
          <div className="detail-price">{money(p.price)} {p.oldPrice > p.price && <del>{money(p.oldPrice)}</del>}</div>
          <p className="description">A versatile men's fashion essential from Fashion Zone. Comfortable, stylish and suitable for everyday wear.</p>

          <label className="option-label">Select size</label>
          <div className="options">{p.sizes.map(s => <button className={size === s ? "selected" : ""} key={s} onClick={() => setSize(s)}>{s}</button>)}</div>

          <label className="option-label">Quantity</label>
          <div className="quantity">
            <button onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={15} /></button>
            <b>{qty}</b>
            <button onClick={() => setQty(Math.min(p.stock, qty + 1))}><Plus size={15} /></button>
          </div>

          <div className="detail-actions">
            <button className="secondary" onClick={add}>Add to Cart</button>
            <button className="primary" onClick={() => { add(); go("cart"); }}>Buy Now</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Cart({ cart, setCart, go }) {
  const subtotal = cart.reduce((sum, p) => sum + p.price * p.qty, 0);
  const delivery = subtotal ? 50 : 0;
  const total = subtotal + delivery;

  const changeQty = (id, delta) => setCart(current => current.map(p => p.id === id ? { ...p, qty: Math.max(1, Math.min(p.stock, p.qty + delta)) } : p));
  const remove = id => setCart(current => current.filter(p => p.id !== id));

  return (
    <section className="container section">
      <div className="section-heading"><div><span className="eyebrow">YOUR BAG</span><h2>Shopping cart</h2></div></div>
      {cart.length ? (
        <div className="cart-layout">
          <div className="cart-list">
            {cart.map(p => (
              <div className="cart-item" key={p.id}>
                <img src={p.image} alt={p.name} />
                <div className="cart-main">
                  <small>{p.category}</small>
                  <h3>{p.name}</h3>
                  <b>{money(p.price)}</b>
                  {p.size && <small className="selected-size">Size: {p.size}</small>}
                  <div className="quantity">
                    <button onClick={() => changeQty(p.id, -1)}><Minus size={14} /></button>
                    <b>{p.qty}</b>
                    <button onClick={() => changeQty(p.id, 1)}><Plus size={14} /></button>
                  </div>
                </div>
                <button className="remove-btn" onClick={() => remove(p.id)}><Trash2 size={19} /></button>
              </div>
            ))}
          </div>
          <aside className="summary">
            <h3>Price details</h3>
            <div><span>Subtotal</span><b>{money(subtotal)}</b></div>
            <div><span>Delivery</span><b>{money(delivery)}</b></div>
            <hr />
            <div className="summary-total"><span>Total</span><b>{money(total)}</b></div>
            <button className="primary full" onClick={() => go("checkout")}>Proceed to Checkout</button>
            <button className="secondary full" onClick={() => go("home")}>Continue Shopping</button>
          </aside>
        </div>
      ) : (
        <div className="empty-state"><ShoppingBag size={45} /><h3>Your cart is empty</h3><p>Add something you love from Fashion Zone.</p><button className="primary" onClick={() => go("home")}>Start Shopping</button></div>
      )}
    </section>
  );
}

function Checkout({ session, cart, setCart, setOrders, setNotifications, go, setToast }) {
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [form, setForm] = useState({
    name: session.name, mobile: session.mobile, house:"", street:"",
    city:"Ongole", district:"Prakasam", state:"Andhra Pradesh", pin:"", instructions:""
  });

  const subtotal = cart.reduce((sum,p) => sum + p.price*p.qty, 0);
  const total = subtotal + (cart.length ? 50 : 0);

  const setField = key => e => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const submit = e => {
    e.preventDefault();
    if (!form.name || !/^[6-9]\d{9}$/.test(form.mobile) || !form.house || !form.street || !form.city || !/^\d{6}$/.test(form.pin)) {
      setToast("Please complete all required delivery details.");
      return;
    }

    const id = "FZ" + Date.now().toString().slice(-8);
    const order = {
      id, userId: session.id, items: cart, total,
      status:"Order Placed",
      date:new Date().toLocaleString("en-IN"),
      customer:form
    };
    setOrders(prev => [order, ...prev]);
    setNotifications?.(prev => [{ id: "n_" + Date.now(), orderId: id, message: `New order ${id} from ${form.name}`, date: new Date().toLocaleString("en-IN"), read: false }, ...prev]);
    setCart([]);
    setOrderId(id);
    setDone(true);
  };

  if (done) return (
    <section className="container section success">
      <div className="success-icon"><CheckCircle2 size={55} /></div>
      <span className="eyebrow">ORDER CONFIRMED</span>
      <h1>Order placed successfully!</h1>
      <p>Your Fashion Zone order <b>{orderId}</b> has been created.</p>
      <div className="success-actions">
        <button className="primary" onClick={() => go("orders")}>View My Orders</button>
        <button className="secondary" onClick={() => go("home")}>Continue Shopping</button>
      </div>
    </section>
  );

  return (
    <section className="container section">
      <button className="back-button" onClick={() => go("cart")}><ArrowLeft size={17} /> Back to cart</button>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={submit}>
          <span className="eyebrow">DELIVERY DETAILS</span>
          <h2>Where should we deliver?</h2>
          <div className="form-grid">
            <label>Customer Name*<input value={form.name} onChange={setField("name")} /></label>
            <label>Mobile Number*<input value={form.mobile} onChange={setField("mobile")} maxLength="10" /></label>
            <label>House / Flat Number*<input value={form.house} onChange={setField("house")} placeholder="House no." /></label>
            <label>Street / Area*<input value={form.street} onChange={setField("street")} placeholder="Street / locality" /></label>
            <label>City*<input value={form.city} onChange={setField("city")} /></label>
            <label>District*<input value={form.district} onChange={setField("district")} /></label>
            <label>State*<input value={form.state} onChange={setField("state")} /></label>
            <label>PIN Code*<input value={form.pin} onChange={setField("pin")} maxLength="6" /></label>
            <label className="wide">Delivery Instructions<input value={form.instructions} onChange={setField("instructions")} placeholder="Optional" /></label>
          </div>
          <h3>Payment</h3>
          <div className="cod"><input type="radio" checked readOnly /> Cash on Delivery <span>Available</span></div>
          <button className="primary full" type="submit">Place Order • {money(total)}</button>
        </form>

        <aside className="summary">
          <h3>Order summary</h3>
          {cart.map(p => (
            <div className="mini-product" key={p.id}>
              <img src={p.image} alt="" />
              <span>{p.name} × {p.qty}</span>
              <b>{money(p.price*p.qty)}</b>
            </div>
          ))}
          <hr />
          <div><span>Subtotal</span><b>{money(subtotal)}</b></div>
          <div><span>Delivery</span><b>₹50</b></div>
          <div className="summary-total"><span>Total</span><b>{money(total)}</b></div>
        </aside>
      </div>
    </section>
  );
}

function Orders({ orders }) {
  return (
    <section className="container section">
      <div className="section-heading"><div><span className="eyebrow">ACCOUNT</span><h2>My orders</h2></div></div>
      {orders.length ? (
        <div className="orders-list">
          {orders.map(o => (
            <article className="order-card" key={o.id}>
              <div className="order-head">
                <div><b>{o.id}</b><small>{o.date}</small></div>
                <span className="status">{o.status}</span>
              </div>
              <div className="order-products">
                {o.items.map(p => <div key={p.id}><img src={p.image} alt="" /><span>{p.name} × {p.qty}</span></div>)}
              </div>
              <div className="order-foot"><span><MapPin size={14} /> {o.customer.city}, {o.customer.pin}</span><b>{money(o.total)}</b></div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state"><Package size={44} /><h3>No orders yet</h3><p>Your placed orders will appear here.</p></div>
      )}
    </section>
  );
}

function Profile({ session, users, setUsers, setSession, setToast }) {
  const user = users.find(u => u.id === session.id);
  const [name,setName] = useState(user?.name || "");
  const [street,setStreet] = useState(user?.address?.street || "");
  const [city,setCity] = useState(user?.address?.city || "Ongole");
  const [pin,setPin] = useState(user?.address?.pin || "");

  const saveProfile = e => {
    e.preventDefault();
    setUsers(current => current.map(u => u.id === session.id ? { ...u, name, address:{...u.address,street,city,pin} } : u));
    setSession(prev => ({ ...prev, name }));
    setToast("Profile updated.");
  };

  return (
    <section className="container section">
      <div className="profile-wrap">
        <div className="profile-top">
          <div className="avatar">{(name || "F").slice(0,1).toUpperCase()}</div>
          <div><span className="eyebrow">MY ACCOUNT</span><h2>{name}</h2><p>+91 {session.mobile}</p></div>
        </div>
        <form className="profile-form" onSubmit={saveProfile}>
          <label>Name<input value={name} onChange={e=>setName(e.target.value)} /></label>
          <label>Mobile Number<input value={session.mobile} readOnly /></label>
          <label>Street / Area<input value={street} onChange={e=>setStreet(e.target.value)} /></label>
          <label>City<input value={city} onChange={e=>setCity(e.target.value)} /></label>
          <label>PIN Code<input value={pin} onChange={e=>setPin(e.target.value)} maxLength="6" /></label>
          <button className="primary">Save Changes</button>
        </form>
      </div>
    </section>
  );
}

function Admin({ products, setProducts, categories, setCategories, orders, setOrders, users, notifications, setNotifications, siteSettings, setSiteSettings, setToast }) {
  const [tab,setTab] = useState("dashboard");
  const [newCategory, setNewCategory] = useState("");
  const [modal,setModal] = useState(null);
  const [selectedOrder,setSelectedOrder] = useState(null);
  const [form,setForm] = useState({
    name:"", category:categories[0] || "Branded Shirts", price:"", oldPrice:"", stock:"10",
    image:""
  });

  const sales = orders.reduce((sum,o)=>sum+o.total,0);

  const openModal = product => {
    setModal(product || "new");
    setForm(product ? {...product} : {
      name:"", category:categories[0] || "Branded Shirts", price:"", oldPrice:"", stock:"10",
      image:""
    });
  };

  const handleProductImage = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setToast("Please choose an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setToast("Product image must be 5 MB or smaller."); return; }
    const reader = new FileReader();
    reader.onload = () => setForm(prev => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const saveProduct = e => {
    e.preventDefault();
    if (!form.name || !form.price || !form.image) { setToast("Please add a product image."); return; }
    const product = {
      id: modal !== "new" ? modal.id : "p_" + Date.now(),
      name:form.name, category:form.category, price:Number(form.price),
      oldPrice:Number(form.oldPrice)||Number(form.price), stock:Number(form.stock)||0,
      image:form.image, brand:"Fashion Zone",
      rating:modal !== "new" ? modal.rating : 4.3,
      sizes:modal !== "new" ? modal.sizes : ["M","L","XL"],
      colors:modal !== "new" ? modal.colors : ["Black"]
    };
    setProducts(current => modal !== "new" ? current.map(p=>p.id===product.id?product:p) : [product,...current]);
    setModal(null);
    setToast(modal !== "new" ? "Product updated." : "Product added.");
  };

  const deleteProduct = id => {
    if (!confirm("Delete this product?")) return;
    setProducts(current => current.filter(p=>p.id!==id));
    setToast("Product deleted successfully.");
  };

  return (
    <section className="container section admin-page">
      <div className="admin-title">
        <div><span className="eyebrow">OWNER DASHBOARD</span><h1>Fashion Zone Admin</h1><p>Manage products, orders and customers.</p></div>
        <button className="primary" onClick={()=>openModal()}><Plus size={17}/> Add Product</button>
      </div>

      <div className="admin-tabs">
        {["dashboard","products","orders","customers","categories","settings"].map(t=><button className={tab===t?"active":""} onClick={()=>{setTab(t); if(t==="orders") setNotifications(n=>n.map(x=>({...x,read:true})))}} key={t}>{t === "settings" ? "Site Settings" : t}{t === "orders" && notifications.filter(n=>!n.read).length > 0 ? ` (${notifications.filter(n=>!n.read).length})` : ""}</button>)}
      </div>

      {tab==="dashboard" && (
        <>
        <div className="stats-grid">
          <Stat icon={<Package/>} value={products.length} label="Total Products" />
          <Stat icon={<ShoppingBag/>} value={orders.length} label="Total Orders" />
          <Stat icon={<Users/>} value={users.filter(u=>u.role!=="admin").length} label="Customers" />
          <Stat icon={<IndianRupee/>} value={money(sales)} label="Total Sales" />
        </div>
        {notifications.filter(n=>!n.read).length > 0 && <div className="notification-panel"><div><b>New order notifications</b><span>{notifications.filter(n=>!n.read).length} unread</span></div>{notifications.slice(0,5).map(n=><div className="notification-item" key={n.id}><Package size={16}/><span><b>{n.message}</b><small>{n.date}</small></span></div>)}</div>}
        </>
      )}

      {tab==="products" && (
        <div className="admin-table">
          <div className="table-head"><h2>Products</h2><span>{products.length} items</span></div>
          {products.map(p=>(
            <div className="admin-row" key={p.id}>
              <img src={p.image} alt="" />
              <div><b>{p.name}</b><small>{p.category}</small></div>
              <span>{money(p.price)}</span>
              <span>Stock: {p.stock}</span>
              <button onClick={()=>openModal(p)}><Pencil size={17}/></button>
              <button className="danger" onClick={()=>deleteProduct(p.id)}><Trash2 size={17}/></button>
            </div>
          ))}
        </div>
      )}

      {tab==="orders" && (
        <div className="admin-table">
          <div className="table-head"><h2>Orders</h2><span>{orders.length} total {notifications.filter(n=>!n.read).length ? `• ${notifications.filter(n=>!n.read).length} new` : ""}</span></div>
          {orders.length ? orders.map(o=>(
            <div className="admin-row order-row" key={o.id}>
              <div><b>{o.id}</b><small>{o.customer.name} • {o.customer.mobile}</small></div>
              <span>{money(o.total)}</span>
              <select value={o.status} onChange={e=>setOrders(current=>current.map(x=>x.id===o.id?{...x,status:e.target.value}:x))}>
                {["Order Placed","Confirmed","Preparing","Out for Delivery","Delivered","Cancelled"].map(s=><option key={s}>{s}</option>)}
              </select>
              <span>{o.customer.city}, {o.customer.pin}</span>
              <button className="secondary small-action" onClick={()=>setSelectedOrder(o)}><Eye size={16}/> Details</button>
            </div>
          )) : <div className="empty-inline">No orders yet.</div>}
        </div>
      )}

      {tab==="categories" && (
        <div className="admin-table">
          <div className="table-head"><div><h2>Categories</h2><span>{categories.length} categories</span></div></div>
          <form className="category-manager" onSubmit={e=>{e.preventDefault(); const name=newCategory.trim(); if(!name) return; if(categories.some(c=>c.toLowerCase()===name.toLowerCase())) { setToast("Category already exists."); return; } setCategories(prev=>[...prev,name]); setNewCategory(""); setToast("Category created."); }}>
            <input value={newCategory} onChange={e=>setNewCategory(e.target.value)} placeholder="New category name" />
            <button className="primary" type="submit"><Plus size={16}/> Create Category</button>
          </form>
          <div className="category-admin-list">
            {categories.map(c=><div className="category-admin-row" key={c}><b>{c}</b><button className="danger" onClick={()=>{ if(products.some(p=>p.category===c)){setToast("Move or delete products in this category first.");return;} if(categories.length<=1){setToast("Keep at least one category.");return;} if(confirm(`Delete ${c}?`)) {setCategories(prev=>prev.filter(x=>x!==c)); setToast("Category deleted.");} }}><Trash2 size={16}/></button></div>)}
          </div>
          <p className="settings-note">Combo Pants and Combo Shirts are already available. You can also create your own categories here.</p>
        </div>
      )}

      {tab==="customers" && (
        <div className="admin-table">
          <div className="table-head"><h2>Customers</h2><span>{users.filter(u=>u.role!=="admin").length} registered</span></div>
          {users.filter(u=>u.role!=="admin").map(u=>{
            const customerOrders = orders.filter(o=>o.userId===u.id);
            return (
              <div className="admin-row" key={u.id}>
                <div className="avatar small">{u.name.slice(0,1).toUpperCase()}</div>
                <div><b>{u.name}</b><small>+91 {u.mobile}</small></div>
                <span>{customerOrders.length} order{customerOrders.length===1?"":"s"}</span>
                <button className="secondary small-action" onClick={()=>setSelectedOrder(customerOrders[0] || {id:"",userId:u.id,items:[],total:0,status:"No orders",date:"",customer:{name:u.name,mobile:u.mobile,...(u.address||{})}})}><Eye size={16}/> Details</button>
              </div>
            );
          })}
        </div>
      )}

      {tab==="settings" && (
        <AdminSettings siteSettings={siteSettings} setSiteSettings={setSiteSettings} setToast={setToast} />
      )}

      {selectedOrder && (
        <div className="modal-overlay" onMouseDown={e=>e.target===e.currentTarget&&setSelectedOrder(null)}>
          <div className="modal-card order-details-modal">
            <button className="modal-x" onClick={()=>setSelectedOrder(null)}><X/></button>
            <span className="eyebrow">CUSTOMER / ORDER DETAILS</span>
            <h2>{selectedOrder.id ? `Order ${selectedOrder.id}` : "Customer Details"}</h2>
            <div className="customer-detail-grid">
              <div><small>Name</small><b>{selectedOrder.customer?.name || "-"}</b></div>
              <div><small>Mobile</small><b>{selectedOrder.customer?.mobile || "-"}</b></div>
              <div><small>House / Flat</small><b>{selectedOrder.customer?.house || "-"}</b></div>
              <div><small>Street / Area</small><b>{selectedOrder.customer?.street || "-"}</b></div>
              <div><small>City</small><b>{selectedOrder.customer?.city || "-"}</b></div>
              <div><small>District</small><b>{selectedOrder.customer?.district || "-"}</b></div>
              <div><small>State</small><b>{selectedOrder.customer?.state || "-"}</b></div>
              <div><small>PIN</small><b>{selectedOrder.customer?.pin || "-"}</b></div>
              <div><small>Order Date</small><b>{selectedOrder.date || "-"}</b></div>
              <div><small>Status</small><b>{selectedOrder.status || "-"}</b></div>
              <div className="detail-wide"><small>Delivery Instructions</small><b>{selectedOrder.customer?.instructions || "None"}</b></div>
            </div>
            {selectedOrder.items?.length > 0 && <div className="order-items-detail"><h3>Products Ordered</h3>{selectedOrder.items.map((item,i)=><div className="order-detail-item" key={item.id || i}><img src={item.image} alt=""/><span><b>{item.name}</b><small>{item.category} • Qty {item.qty}</small></span><strong>{money(item.price*item.qty)}</strong></div>)}<div className="order-total-detail"><span>Total</span><b>{money(selectedOrder.total)}</b></div></div>}
            <button className="secondary full" onClick={()=>setSelectedOrder(null)}>Close</button>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onMouseDown={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal-card">
            <button className="modal-x" onClick={()=>setModal(null)}><X/></button>
            <span className="eyebrow">{modal==="new"?"NEW PRODUCT":"EDIT PRODUCT"}</span>
            <h2>{modal==="new"?"Add product":"Edit product"}</h2>
            <form onSubmit={saveProduct}>
              <label>Product Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
              <label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
              <div className="form-grid three">
                <label>Price<input required type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label>
                <label>Old Price<input type="number" value={form.oldPrice} onChange={e=>setForm({...form,oldPrice:e.target.value})}/></label>
                <label>Stock<input type="number" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/></label>
              </div>
              <div className="product-image-upload">
                <label>Product Image</label>
                <label className="primary file-button upload-product-image">
                  {form.image ? "Change Product Image" : "Upload Product Image"}
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleProductImage} />
                </label>
                {form.image ? (
                  <div className="product-image-preview">
                    <img src={form.image} alt="Product preview" />
                    <button type="button" className="secondary" onClick={()=>setForm(prev=>({...prev,image:""}))}>Remove Image</button>
                  </div>
                ) : (
                  <p className="settings-note">PNG, JPG or WEBP • maximum 5 MB</p>
                )}
              </div>
              <button className="primary full">Save Product</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function AdminSettings({ siteSettings, setSiteSettings, setToast }) {
  const [whatsapp, setWhatsapp] = useState(siteSettings.whatsapp || BUSINESS.displayWhatsapp);
  const [message, setMessage] = useState(siteSettings.whatsappMessage || DEFAULT_SITE_SETTINGS.whatsappMessage);

  const saveSupport = e => {
    e.preventDefault();
    const digits = whatsapp.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(digits)) {
      setToast("Enter a valid 10-digit WhatsApp number.");
      return;
    }
    setSiteSettings(prev => ({ ...prev, whatsapp: digits, whatsappMessage: message.trim() || DEFAULT_SITE_SETTINGS.whatsappMessage }));
    setToast("WhatsApp support settings updated.");
  };

  const handleLogo = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setToast("Please choose an image file."); return; }
    if (file.size > 3 * 1024 * 1024) { setToast("Logo must be 3 MB or smaller."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setSiteSettings(prev => ({ ...prev, logo: reader.result }));
      setToast("Logo updated for the website.");
    };
    reader.readAsDataURL(file);
  };

  const resetLogo = () => {
    setSiteSettings(prev => ({ ...prev, logo: "" }));
    setToast("Default Fashion Zone logo restored.");
  };

  return (
    <div className="settings-grid">
      <div className="settings-card">
        <div className="table-head settings-head"><div><span className="eyebrow">ADMIN ONLY</span><h2>Website Logo</h2></div></div>
        <p className="settings-help">Only the logged-in admin can replace the logo shown in the header, login screen and footer.</p>
        <div className="logo-preview-box"><img src={siteSettings.logo || fashionZoneLogo} alt="Current Fashion Zone logo" /></div>
        <div className="settings-actions">
          <label className="primary file-button">Change Logo<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogo} /></label>
          {siteSettings.logo && <button type="button" className="secondary" onClick={resetLogo}>Restore Default</button>}
        </div>
        <small className="settings-note">PNG, JPG, WEBP or SVG • maximum 3 MB</small>
      </div>

      <div className="settings-card">
        <div className="table-head settings-head"><div><span className="eyebrow">CUSTOMER SUPPORT</span><h2>WhatsApp Support</h2></div></div>
        <p className="settings-help">Change the number and welcome message used by the WhatsApp support button for customers.</p>
        <form className="settings-form" onSubmit={saveSupport}>
          <label>WhatsApp Number<input value={whatsapp} inputMode="numeric" maxLength="10" onChange={e=>setWhatsapp(e.target.value.replace(/\D/g, "").slice(0,10))} placeholder="8919321569" /></label>
          <label>Customer Message<textarea rows="4" value={message} onChange={e=>setMessage(e.target.value)} placeholder="Hello Fashion Zone, I need help..." /></label>
          <button className="primary full" type="submit"><MessageCircle size={17}/> Save WhatsApp Settings</button>
        </form>
      </div>

      <div className="settings-card settings-full">
        <div className="table-head settings-head"><div><span className="eyebrow">IMPORTANT</span><h2>Product Catalog Storage</h2></div></div>
        <p className="settings-help">This version shows only products added by the admin. There are no starter or demo products. Products are currently stored in this browser's localStorage, so products added on one device do not automatically appear on other phones or computers. For a real multi-device store, connect the admin catalog to a shared database/backend.</p>
      </div>

      <div className="settings-card settings-full">
        <div className="table-head settings-head"><div><span className="eyebrow">ADMIN ACCESS</span><h2>Admin Controls</h2></div></div>
        <div className="access-list">
          <div><CheckCircle2/><span><b>Products</b><small>Add, edit, delete products and manage stock.</small></span></div>
          <div><CheckCircle2/><span><b>Orders</b><small>View orders and update order status.</small></span></div>
          <div><CheckCircle2/><span><b>Customers</b><small>View registered customer accounts.</small></span></div>
          <div><CheckCircle2/><span><b>Website settings</b><small>Change logo and WhatsApp customer support details.</small></span></div>
        </div>
      </div>
    </div>
  );
}

function Stat({icon,value,label}) {
  return <div className="stat-card"><span>{icon}</span><b>{value}</b><small>{label}</small></div>;
}

function Footer({ logoSrc }) {
  return (
    <footer>
      <div className="container footer-grid">
        <div>
          <img className="footer-logo" src={logoSrc} alt="Fashion Zone - The Multi Brand Store" />
          <p>{BUSINESS.tagline}</p>
          <p className="address"><MapPin size={15}/> {BUSINESS.address}</p>
        </div>
        <div><h4>Shop</h4><p>Mens Wear</p><p>Sports Wear</p><p>Accessories</p></div>
        <div><h4>Contact</h4><p><Phone size={15}/> {BUSINESS.displayWhatsapp}</p><a href={`https://instagram.com/${BUSINESS.instagram}`} target="_blank" rel="noreferrer"><Instagram size={15}/> @{BUSINESS.instagram}</a></div>
      </div>
      <div className="copyright">© 2026 Fashion Zone. All Rights Reserved.</div>
    </footer>
  );
}

createRoot(document.getElementById("root")).render(<App />);
