import { useEffect, useRef, useState } from "react";
import "./potions.css";

export default function App() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", date: "", time: "", guests: "", occasion: "" });
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const scrollProgressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Preloader sequence
    const t1 = setTimeout(() => setCurtainsOpen(true), 3500);
    const t2 = setTimeout(() => { setPreloaderDone(true); setHeroVisible(true); }, 4800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    // Custom cursor
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let rafId: number;

    const moveCursor = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = mouseX + "px";
        cursorDotRef.current.style.top = mouseY + "px";
      }
    };

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.09;
      ringY += (mouseY - ringY) * 0.09;
      if (cursorRingRef.current) {
        cursorRingRef.current.style.left = ringX + "px";
        cursorRingRef.current.style.top = ringY + "px";
      }
      rafId = requestAnimationFrame(animateRing);
    };

    const handleHoverIn = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!cursorRingRef.current || !cursorDotRef.current) return;
      if (target.closest("a, button, .nav-link")) {
        cursorRingRef.current.classList.add("cursor-hover-btn");
      } else if (target.closest(".cocktail-card, .menu-img")) {
        cursorRingRef.current.classList.add("cursor-hover-img");
        cursorDotRef.current.classList.add("cursor-dot-hidden");
      }
    };

    const handleHoverOut = () => {
      if (!cursorRingRef.current || !cursorDotRef.current) return;
      cursorRingRef.current.classList.remove("cursor-hover-btn", "cursor-hover-img");
      cursorDotRef.current.classList.remove("cursor-dot-hidden");
    };

    document.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseover", handleHoverIn);
    document.addEventListener("mouseout", handleHoverOut);
    rafId = requestAnimationFrame(animateRing);
    return () => {
      document.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", handleHoverIn);
      document.removeEventListener("mouseout", handleHoverOut);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    // Parallax + scroll effects
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          // Nav
          setNavScrolled(scrollY > 80);
          // Scroll progress
          if (scrollProgressRef.current) {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            scrollProgressRef.current.style.width = (scrollY / total * 100) + "%";
          }
          // Hero parallax
          const heroBg = document.querySelector(".hero-bg") as HTMLElement;
          if (heroBg) heroBg.style.transform = `translateY(${scrollY * 0.45}px)`;
          // Menu card images parallax
          document.querySelectorAll(".cocktail-card-img-wrap img").forEach((el) => {
            const rect = (el as HTMLElement).closest(".cocktail-card")?.getBoundingClientRect();
            if (rect) {
              const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * 0.2;
              (el as HTMLElement).style.transform = `translateY(${offset}px) scale(1.06)`;
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Scroll reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const delay = el.dataset.delay || "0";
          setTimeout(() => {
            el.classList.add("revealed");
          }, parseInt(delay));
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal").forEach((el, i) => {
      if (!(el as HTMLElement).dataset.delay) {
        (el as HTMLElement).dataset.delay = String(i % 4 * 120);
      }
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [preloaderDone]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you! Your reservation request has been received. We will confirm shortly.");
  };

  return (
    <>
      {/* Grain overlay */}
      <svg className="grain-overlay" xmlns="http://www.w3.org/2000/svg">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)"/>
      </svg>

      {/* Scroll progress */}
      <div className="scroll-progress" ref={scrollProgressRef}/>

      {/* Custom cursor */}
      <div className="cursor-dot" ref={cursorDotRef}/>
      <div className="cursor-ring" ref={cursorRingRef}>
        <span className="cursor-explore">EXPLORE</span>
      </div>

      {/* Preloader */}
      {!preloaderDone && (
        <div className="preloader">
          <div className="preloader-curtain-left" style={{ transform: curtainsOpen ? "translateX(-101%)" : "translateX(0)" }}/>
          <div className="preloader-curtain-right" style={{ transform: curtainsOpen ? "translateX(101%)" : "translateX(0)" }}/>
          <div className="preloader-content">
            <div className="preloader-triangle">▲</div>
            <div className="preloader-brand">POTIONS</div>
            <div className="preloader-sub">COCKTAIL THEATRE</div>
            <div className="preloader-line"/>
          </div>
        </div>
      )}

      {/* Fixed floating reserve button */}
      <a href="#reserve" className="floating-reserve">🍹 Reserve a Table</a>

      {/* Navbar */}
      <nav className={`navbar ${navScrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <a href="#hero" className="nav-logo">
            <span className="nav-triangle">▲</span>
            <span className="nav-brand">POTIONS</span>
          </a>
          <div className="nav-links desktop-nav">
            <a href="#cocktails" className="nav-link">Cocktails</a>
            <a href="#food" className="nav-link">Food</a>
            <a href="#vibe" className="nav-link">Vibe</a>
            <a href="#events" className="nav-link">Reserve</a>
          </div>
          <a href="#reserve" className="nav-cta">Reserve Now</a>
          <button className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        <button className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)}>✕</button>
        <a href="#cocktails" onClick={() => setMobileMenuOpen(false)}>Cocktails</a>
        <a href="#food" onClick={() => setMobileMenuOpen(false)}>Food</a>
        <a href="#vibe" onClick={() => setMobileMenuOpen(false)}>Vibe</a>
        <a href="#events" onClick={() => setMobileMenuOpen(false)}>Events</a>
        <a href="#reserve" onClick={() => setMobileMenuOpen(false)}>Reserve</a>
      </div>

      {/* Hero */}
      <section className="hero" id="hero" ref={heroRef}>
        <div className="hero-bg" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1600&q=80)" }}/>
        <div className="hero-overlay"/>
        <div className={`hero-content ${heroVisible ? "visible" : ""}`}>
          <div className="hero-label">[ Ambawatta One · New Delhi · Est. 2024 ]</div>
          <div className="hero-triangle">▲</div>
          <div className="hero-heading">
            <div className="hero-line hero-line-1">Cocktails</div>
            <div className="hero-line hero-line-2">with a</div>
            <div className="hero-line hero-line-3">Story.</div>
          </div>
          <div className="hero-tagline">
            Plates that Sizzle. Qutub Minar in the View. Magic in the Air.
          </div>
          <div className="hero-ctas">
            <a href="#reserve" className="btn-primary pulse-glow">Reserve a Table</a>
            <a href="#cocktails" className="btn-outline">Explore Menu →</a>
          </div>
        </div>
        <div className="hero-marquee-wrap">
          <div className="hero-marquee">
            <span>COCKTAILS WITH A STORY ·· PLATES THAT SIZZLE ·· QUTUB MINAR IN THE VIEW ·· MAGIC IN THE AIR ·· AMBAWATTA ONE DELHI ··&nbsp;&nbsp;&nbsp;</span>
            <span>COCKTAILS WITH A STORY ·· PLATES THAT SIZZLE ·· QUTUB MINAR IN THE VIEW ·· MAGIC IN THE AIR ·· AMBAWATTA ONE DELHI ··&nbsp;&nbsp;&nbsp;</span>
          </div>
        </div>
        <div className="scroll-indicator">
          <span>Scroll</span>
          <div className="scroll-line"/>
        </div>
      </section>

      {/* Ambience Intro */}
      <section className="ambience-section" id="ambience">
        <div className="ambience-inner">
          <div className="ambience-col reveal" data-delay="0">
            <div className="ambience-icon">🍹</div>
            <h3 className="ambience-title">Cocktails with a Story</h3>
            <p className="ambience-text">Every cocktail is a narrative — crafted to transport you somewhere unforgettable.</p>
          </div>
          <div className="ambience-divider"/>
          <div className="ambience-col reveal" data-delay="120">
            <div className="ambience-icon">🍽️</div>
            <h3 className="ambience-title">Plates that Sizzle</h3>
            <p className="ambience-text">A curated menu that complements every pour — food as theatre, flavour as performance.</p>
          </div>
          <div className="ambience-divider"/>
          <div className="ambience-col reveal" data-delay="240">
            <div className="ambience-icon">🌙</div>
            <h3 className="ambience-title">Qutub Minar in the View</h3>
            <p className="ambience-text">Delhi's most iconic backdrop — history and nightlife meeting in perfect harmony.</p>
          </div>
        </div>
      </section>

      {/* Signature Cocktails */}
      <section className="cocktails-section" id="cocktails">
        <div className="section-inner">
          <div className="section-label reveal">[ Our Potions ]</div>
          <h2 className="section-heading reveal">The Art of the Cocktail</h2>
          <p className="section-subtitle reveal">Each potion tells a story. Find yours.</p>
          <div className="cocktails-grid">
            {[
              { img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80", category: "Signature", name: "Imagine Me & You", desc: "A floral romance — elderflower, gin, yuzu, and a whisper of rose.", price: "₹895" },
              { img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80", category: "Classic", name: "Pure Distilled Escapism", desc: "Dark rum, cold brew, cardamom bitters — the great escape in a glass.", price: "₹795" },
              { img: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=80", category: "Premium", name: "Magic in the Air", desc: "Single malt, smoked wood, honey and saffron — pure alchemy.", price: "₹1,195" },
              { img: "https://images.unsplash.com/photo-1498429152472-9a433d9ead31?w=600&q=80", category: "House Special", name: "The Qutub", desc: "Aged tequila, tamarind, chilli, and ancient spice — Delhi in a glass.", price: "₹995" },
            ].map((c, i) => (
              <div className="cocktail-card reveal" key={i} data-delay={String(i * 120)}>
                <div className="cocktail-card-img-wrap menu-img">
                  <img src={c.img} alt={c.name} loading="lazy"/>
                </div>
                <div className="cocktail-card-body">
                  <div className="cocktail-category">{c.category}</div>
                  <div className="cocktail-name">{c.name}</div>
                  <div className="cocktail-desc">{c.desc}</div>
                  <div className="cocktail-price">{c.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Food Menu */}
      <section className="food-section" id="food">
        <div className="section-inner">
          <div className="section-label reveal">[ The Kitchen ]</div>
          <h2 className="section-heading reveal">Plates that Sizzle</h2>
          <div className="food-grid">
            <div className="food-cat reveal" data-delay="0">
              <div className="food-cat-label">Small Plates</div>
              <ul className="food-list">
                <li>Madhuban Paneer Tikka</li>
                <li>Truffle Mushroom Crostini</li>
                <li>Lamb Galouti Sliders</li>
              </ul>
            </div>
            <div className="food-cat reveal" data-delay="120">
              <div className="food-cat-label">Main Course</div>
              <ul className="food-list">
                <li>Dal Makhani Noir</li>
                <li>Butter Chicken Reimagined</li>
                <li>Coastal Fish Curry</li>
              </ul>
            </div>
            <div className="food-cat reveal" data-delay="240">
              <div className="food-cat-label">Desserts</div>
              <ul className="food-list">
                <li>Gulab Jamun Soufflé</li>
                <li>Dark Chocolate Theatre</li>
                <li>Saffron Panna Cotta</li>
              </ul>
            </div>
          </div>
          <div className="food-view-more reveal"><a href="#reserve" className="amber-link">View Full Menu →</a></div>
        </div>
      </section>

      {/* The Experience */}
      <section className="experience-section" id="vibe">
        <div className="section-inner">
          <div className="section-label reveal">[ The Vibe ]</div>
          <h2 className="section-heading reveal">Not Just a Bar.<br/>A Theatre of Senses.</h2>
          <div className="experience-grid">
            <div className="experience-img-large reveal menu-img">
              <img src="https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200&q=80" alt="Potions Atmosphere" loading="lazy"/>
            </div>
            <div className="experience-imgs-stack">
              <div className="experience-img-small reveal menu-img" data-delay="100">
                <img src="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=600&q=80" alt="Bar" loading="lazy"/>
              </div>
              <div className="experience-img-small reveal menu-img" data-delay="200">
                <img src="https://images.unsplash.com/photo-1583394293214-0b3c20cbae25?w=600&q=80" alt="Cocktail" loading="lazy"/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="events-section" id="events">
        <div className="section-inner">
          <div className="section-label reveal">[ Upcoming Events ]</div>
          <h2 className="section-heading reveal">Magic in the Making</h2>
          <div className="events-grid">
            {[
              { title: "Live Jazz & Cocktails", when: "EVERY FRIDAY", desc: "Smooth jazz, handcrafted cocktails and the Qutub Minar at sunset." },
              { title: "Cocktail Masterclass", when: "SATURDAYS", desc: "Learn the art of mixology from our master bartenders." },
              { title: "Private Dining Experience", when: "BY APPOINTMENT", desc: "Exclusive dining with bespoke cocktail pairings and breathtaking views." },
            ].map((ev, i) => (
              <div className="event-card reveal" key={i} data-delay={String(i * 120)}>
                <div className="event-when">{ev.when}</div>
                <div className="event-title">{ev.title}</div>
                <div className="event-desc">{ev.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <a href="#reserve" className="btn-primary pulse-glow">Reserve Your Experience</a>
          </div>
        </div>
      </section>

      {/* About / Story */}
      <section className="about-section" id="about">
        <div className="about-inner">
          <div className="about-img reveal menu-img">
            <img src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&q=80" alt="Potions Story" loading="lazy"/>
          </div>
          <div className="about-content">
            <div className="section-label reveal">[ Our Story ]</div>
            <h2 className="about-heading reveal">Born from a Shared Love<br/>of Storytelling</h2>
            <p className="about-text reveal">Potions Cocktail Theatre was born from a vision — to create a space where every drink has a narrative, every plate tells a story, and every evening becomes a memory.</p>
            <p className="about-text reveal" data-delay="80">Founded by Sunny Leone and Sahil Baweja at the iconic Ambawatta One, Delhi — with Qutub Minar as our timeless backdrop — Potions is not just a bar. It's a theatre.</p>
            <blockquote className="about-quote reveal">
              <div className="quote-bar"/>
              <p>"Every evening is a performance.<br/>You are our honoured guest."</p>
            </blockquote>
            <div className="about-founders reveal">
              <div className="founders-names">Sunny Leone · Sahil Baweja</div>
              <div className="founders-title">Founders, Potions Cocktail Theatre</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section" id="reviews">
        <div className="section-inner">
          <div className="section-label reveal">[ What They Say ]</div>
          <div className="featured-review reveal">
            <div className="review-stars">★★★★★</div>
            <blockquote className="featured-review-text">
              "An evening at Potions is unlike anything else in Delhi. The cocktails are extraordinary, the view is breathtaking and the atmosphere is pure magic."
            </blockquote>
            <div className="review-source">— GOOGLE REVIEW · ★★★★★</div>
          </div>
          <div className="reviews-grid">
            {[
              { stars: "★★★★★", text: "The Qutub cocktail is absolutely stunning. A flavour experience unlike any other bar in the city.", author: "Priya M." },
              { stars: "★★★★★", text: "Butter Chicken Reimagined is extraordinary. The theatrical presentation alone is worth the visit.", author: "Arjun K." },
              { stars: "★★★★★", text: "Best date night in Delhi. The ambiance, the cocktails, the view — perfection in every sense.", author: "Zara S." },
            ].map((r, i) => (
              <div className="review-card reveal" key={i} data-delay={String(i * 120)}>
                <div className="review-stars-sm">{r.stars}</div>
                <p className="review-text">{r.text}</p>
                <div className="review-author">— {r.author}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Visit */}
      <section className="contact-section" id="contact">
        <div className="contact-inner">
          <div className="contact-info">
            <h2 className="contact-heading reveal">
              <span className="cream">Find Us at</span><br/>
              <span className="amber italic">Ambawatta One</span><br/>
              <span className="cream">New Delhi.</span>
            </h2>
            <div className="contact-details reveal">
              <div className="contact-item">📍 Ambawatta One, Qutub Minar Marg,<br/>&nbsp;&nbsp;&nbsp;&nbsp;Mehrauli, New Delhi 110030</div>
              <div className="contact-item">📞 +91 84484 40330</div>
              <div className="contact-item">🕐 Open Daily: 12PM – 1AM</div>
              <div className="contact-item">✉️ reservations@potionsdelhi.com</div>
              <div className="contact-founders reveal">By @sunnyleone & @sahillbaweja02</div>
            </div>
            <a href="#reserve" className="btn-primary pulse-glow reveal" style={{ display: "inline-block", marginTop: "2rem" }}>Reserve Now</a>
          </div>
          <div className="contact-form-wrap" id="reserve">
            <div className="section-label reveal">[ Reserve Your Table ]</div>
            <form className="reservation-form" onSubmit={handleFormSubmit}>
              {[
                { label: "Your Name", name: "name", type: "text", placeholder: "Full Name" },
                { label: "Phone Number", name: "phone", type: "tel", placeholder: "+91 XXXXX XXXXX" },
                { label: "Date", name: "date", type: "date", placeholder: "" },
                { label: "Time", name: "time", type: "time", placeholder: "" },
                { label: "Number of Guests", name: "guests", type: "number", placeholder: "2" },
                { label: "Occasion", name: "occasion", type: "text", placeholder: "Birthday, Anniversary..." },
              ].map((f) => (
                <div className="form-field reveal" key={f.name}>
                  <label className="form-label">{f.label}</label>
                  <input
                    className="form-input"
                    type={f.type}
                    placeholder={f.placeholder}
                    value={formData[f.name as keyof typeof formData]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [f.name]: e.target.value }))}
                  />
                </div>
              ))}
              <button type="submit" className="btn-primary pulse-glow" style={{ width: "100%", marginTop: "1rem" }}>Book My Table</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-amber-line"/>
        <div className="footer-inner">
          <div className="footer-logo">
            <div className="footer-triangle">▲</div>
            <div className="footer-brand">POTIONS</div>
            <div className="footer-sub">COCKTAIL THEATRE</div>
            <div className="footer-tagline">Cocktails with a Story · Plates that Sizzle · Qutub Minar in the View</div>
          </div>
          <div className="footer-links">
            <a href="#cocktails">Cocktails</a>
            <a href="#food">Food</a>
            <a href="#vibe">Vibe</a>
            <a href="#events">Events</a>
            <a href="#reserve">Reserve</a>
          </div>
          <div className="footer-social">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <span>·</span>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
          </div>
          <div className="footer-copy">© 2025 Potions Cocktail Theatre. Ambawatta One, New Delhi.</div>
        </div>
        <div className="footer-marquee-wrap">
          <div className="footer-marquee">
            <span>COCKTAILS WITH A STORY ·· MAGIC IN THE AIR ·· AMBAWATTA ONE DELHI ·· BY SUNNY LEONE & SAHIL BAWEJA ··&nbsp;&nbsp;&nbsp;</span>
            <span>COCKTAILS WITH A STORY ·· MAGIC IN THE AIR ·· AMBAWATTA ONE DELHI ·· BY SUNNY LEONE & SAHIL BAWEJA ··&nbsp;&nbsp;&nbsp;</span>
          </div>
        </div>
      </footer>
    </>
  );
}
