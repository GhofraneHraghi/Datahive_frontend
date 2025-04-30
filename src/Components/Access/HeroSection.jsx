import React from 'react';
import { FaPlayCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import image1 from "../../assets/image1.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleStartNow = () => {
    navigate('/login'); // Redirige vers la route '/login'
  };

  return (
    <div className="hero-section">
      <div className="hero-background">
        <img 
          src={image1} 
          alt="background" 
          className="blurred-image"
        />
      </div>
      <div className="hero-content">
        <h1>Gérez vos rapports simplement</h1>
        <p>Solution tout-en-un pour une analyse de données professionnelle</p>
        <div className="cta-buttons">
          <button className="primary-btn" onClick={handleStartNow}>
            Commencer maintenant
          </button>

        </div>
      </div>
    </div>
  );
};

export default HeroSection;