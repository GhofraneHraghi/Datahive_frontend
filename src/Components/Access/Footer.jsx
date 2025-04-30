import React from 'react';


const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <button className="demo-button">Request a Demo</button>
        <button className="pricing-button">View Pricing</button>
      </div>
      
      <div className="footer-main">
        <div className="footer-content">
          <div className="footer-section">
            <h3>AppShowcase</h3>
            <p>Powerful reporting and analytics for businesses of all sizes. Gain insights, make decisions, and grow your business.</p>
          </div>
          
          <div className="footer-links-container">
            <div className="footer-links">
              <div className="link-column">
                <h4>Product</h4>
                <ul>
                  <li><a href="/features">Features</a></li>
                  <li><a href="/pricing">Pricing</a></li>
                  <li><a href="/integrations">Integrations</a></li>
                  <li><a href="/updates">Updates</a></li>
                  <li><a href="/faq">FAQ</a></li>
                </ul>
              </div>
              
              <div className="link-column">
                <h4>Resources</h4>
                <ul>
                  <li><a href="/blog">Blog</a></li>
                  <li><a href="/guides">Guides</a></li>
                </ul>
              </div>
              
              <div className="link-column">
                <h4>Company</h4>
                <ul>
                  <li><a href="/about">About Us</a></li>
                  <li><a href="/careers">Careers</a></li>
                  <li><a href="/press">Press</a></li>
                  <li><a href="/partners">Partners</a></li>
                  <li><a href="/contact">Contact</a></li>
                </ul>
              </div>
              
              <div className="link-column">
                <h4>Legal</h4>
                <ul>
                  <li><a href="/privacy">Privacy Policy</a></li>
                  <li><a href="/terms">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;