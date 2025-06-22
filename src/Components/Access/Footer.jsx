import React from 'react';


const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <button className="demo-button">Demander une démo</button>
        <button className="pricing-button">Voir les prix</button>
      </div>
      
      <div className="footer-main">
        <div className="footer-content">
          <div className="footer-section">
            <h3>AppShowcase</h3>
            <p>Des rapports et analyses performants pour les entreprises de toutes tailles. Obtenez des informations, prenez des décisions et développez votre activité.</p>
          </div>
          
          <div className="footer-links-container">
            <div className="footer-links">
              <div className="link-column">
                <h4>Product</h4>
                <ul>
                  <li><a href="/features">Caractéristiques</a></li>
                  <li><a href="/pricing">Tarifs</a></li>
                  <li><a href="/integrations">Intégrations</a></li>
                  <li><a href="/updates">Mises à jour</a></li>
                  <li><a href="/faq">FAQ</a></li>
                </ul>
              </div>
              
              <div className="link-column">
                <h4>Ressources</h4>
                <ul>
                  <li><a href="/blog">Blogue</a></li>
                  <li><a href="/guides">Guides</a></li>
                </ul>
              </div>
              
              <div className="link-column">
                <h4>Entreprise</h4>
                <ul>
                  <li><a href="/about">About Us</a></li>
                  <li><a href="/careers">À propos de nous</a></li>
                  <li><a href="/press">Presse</a></li>
                  <li><a href="/partners">Partenaires</a></li>
                  <li><a href="/contact">Contact</a></li>
                </ul>
              </div>
              
              <div className="link-column">
                <h4>Légal</h4>
                <ul>
                  <li><a href="/privacy">politique de confidentialité</a></li>
                  <li><a href="/terms">Conditions d{"'"}utilisation</a></li>
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