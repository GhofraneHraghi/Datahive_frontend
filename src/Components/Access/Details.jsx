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
            Des courbes dynamiques pour suivre vos performances.
          </h3>
        </div>
      </div>
      <div className="details-wrapper">
      <div className="details-description">
          <h3 className="slogan-text">
            Visualisez vos données en un coup d’œil.
          </h3>
         
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
            Analysez vos résultats avec des graphiques clairs et précis.
          </h3>
      
        </div>
      </div>
      
    </section>
  );
};

export default Details;
