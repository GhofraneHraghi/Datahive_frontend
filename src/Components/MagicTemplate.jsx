import React, { useState } from 'react';
import axios from 'axios';

const MagicTemplate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLookerLink = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Aucun token trouvé - veuillez vous connecter');
      }

      console.log('Envoi de la requête avec token:', token); // Debug
      const res = await axios.get('http://votre-backend/api/looker-link', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.data?.url) {
        throw new Error('Réponse inattendue du serveur');
      }

      window.open(res.data.url, '_blank', 'noopener,noreferrer');
      
    } catch (err) {
      console.error('Erreur complète:', err);
      setError(err.message);
      alert(`Erreur: ${err.message}\n${err.response?.data?.details || ''}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={fetchLookerLink} 
        disabled={isLoading}
        style={{ padding: '10px 20px' }}
      >
        {isLoading ? 'Chargement...' : 'Ouvrir Looker Studio'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default MagicTemplate;