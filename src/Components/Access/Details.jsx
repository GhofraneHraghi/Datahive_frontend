import React from 'react';
import image7 from "../../assets/image7.png";
import image6 from "../../assets/image6.jpg";
import image4 from "../../assets/image4.jpeg";
const Details = () => {
  return (
    <section className="details-section">
      <div className="details-wrapper">
        <div className="team-photo-wrapper">
          <img 
            src={image4} 
            alt="Notre équipe"
            className="team-photo"
          />
        </div>
        
        <div className="details-description">
          <h3 className="slogan-text">
            Notre devise : Qualité, Innovation, Excellence
          </h3>
          <div className="core-values">
            <span className="core-value-item">✓ Expertise</span>
            <p>gd     rtetrtrt            drteryery eterer ererg    erzfsf       </p>
            <span className="core-value-item">✓ Créativité</span>
            <span className="core-value-item">✓ Engagement</span>
          </div>
        </div>
      </div>
      <div className="details-wrapper">
      <div className="details-description">
          <h3 className="slogan-text">
            Notre devise : Qualité, Innovation, Excellence
          </h3>
          <div className="core-values">
            <span className="core-value-item">✓ Expertise</span>
            <span className="core-value-item">✓ Créativité</span>
            <span className="core-value-item">✓ Engagement</span>
          </div>
        </div>
        <div className="team-photo-wrapper">
          <img 
            src={image6}
            alt="Notre équipe"
            className="team-photo"
          />
        </div>
      </div>
      <div className="details-wrapper">
        <div className="team-photo-wrapper">
          <img 
            src={image7} 
            alt="Notre équipe"
            className="team-photo"
          />
        </div>
        
        <div className="details-description">
          <h3 className="slogan-text">
            Notre devise : Qualité, Innovation, Excellence
          </h3>
          <div className="core-values">
            <span className="core-value-item">✓ Expertise</span>
            <span className="core-value-item">✓ Créativité</span>
            <span className="core-value-item">✓ Engagement</span>
          </div>
        </div>
      </div>
      
    </section>
  );
};

export default Details;
