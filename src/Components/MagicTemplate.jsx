import React, { useState } from 'react';
import axios from 'axios';
import { Button, message } from 'antd';

const MagicTemplate = () => {
  const [loading, setLoading] = useState(false);
  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  const fetchLookerLink = async () => {
    setLoading(true);
    try {
      // Récupération cohérente du token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Veuillez vous connecter à nouveau');
      }

      const response = await axios.get(
        `${VITE_BACKEND_BASE_URL}/api/looker-link`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data?.url) {
        throw new Error('Réponse inattendue du serveur');
      }

      window.open(response.data.url, '_blank', 'noopener,noreferrer');
      
    } catch (error) {
      console.error('Erreur:', error);
      message.error(error.response?.data?.message || error.message);
      
      // Redirection si token invalide
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      type="primary" 
      onClick={fetchLookerLink}
      loading={loading}
    >
      Ouvrir Looker Studio
    </Button>
  );
};

export default MagicTemplate;