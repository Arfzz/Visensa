import './Footer.css'

const LINKS = {
  Akses: ['Beranda', 'Fitur', 'Tentang Kami', 'FAQ'],
  Support: ['link.supportvisensa'],
}

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer__top container">
        {/* Brand */}
        <div className="footer__brand">
          <div className="footer__logo">
            <svg width="22" height="28" viewBox="0 0 24 30" fill="none">
              <path d="M12 0L24 6V15C24 22.5 18.6 28.5 12 30C5.4 28.5 0 22.5 0 15V6L12 0Z" fill="#00C875"/>
              <path d="M8 15L11 18L16 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>VISENSA</span>
          </div>
          <p className="footer__brand-desc">
            Browser-based mirror therapy for phantom limb pain. Clinically validated, 
            zero hardware required. Start in under 4 minutes.
          </p>
        </div>

        {/* Links */}
        {Object.entries(LINKS).map(([group, items]) => (
          <div key={group} className="footer__col">
            <h4 className="footer__col-heading">{group}</h4>
            <ul className="footer__links">
              {items.map((item) => (
                <li key={item}>
                  <a href="#" className="footer__link" id={`footer-${item.toLowerCase().replace(/\s+/g, '-')}`}>
                    {item.startsWith('>') ? item : `> ${item}`}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Newsletter */}
        <div className="footer__newsletter">
          <h4 className="footer__col-heading">Subscribe to our newsletter</h4>
          <p className="footer__newsletter-desc">
            Latest news from VISENSA, updates, and insights on mirror therapy delivered to your inbox.
          </p>
          <div className="footer__newsletter-form">
            <input
              type="email"
              placeholder="Enter your email"
              className="footer__newsletter-input"
              id="newsletter-email"
              aria-label="Email address"
            />
          </div>
          <button className="footer__newsletter-btn" id="newsletter-subscribe">
            Subscribe
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="footer__bottom-inner container">
          <div className="footer__copyright">
            <svg width="18" height="22" viewBox="0 0 24 30" fill="none">
              <path d="M12 0L24 6V15C24 22.5 18.6 28.5 12 30C5.4 28.5 0 22.5 0 15V6L12 0Z" fill="#00C875"/>
              <path d="M8 15L11 18L16 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>© 2026 VISENSA Health Ltd.</span>
          </div>
          <div className="footer__socials">
            {/* Facebook */}
            <a href="#" className="footer__social-icon" id="footer-facebook" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            {/* Twitter */}
            <a href="#" className="footer__social-icon" id="footer-twitter" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" className="footer__social-icon" id="footer-instagram" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="#" className="footer__social-icon" id="footer-linkedin" aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
            {/* YouTube */}
            <a href="#" className="footer__social-icon" id="footer-youtube" aria-label="YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
