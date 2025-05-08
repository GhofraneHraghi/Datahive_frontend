import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const MagicTemplate = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  
  useEffect(() => {
    // Vérification initiale du token
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);
  
  const fetchLookerLink = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user) {
        message.error('Session expirée, veuillez vous reconnecter');
        navigate('/login');
        return;
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
        throw new Error('Configuration Looker introuvable');
      }
      
      // Ouvrir l'URL dans un nouvel onglet
      window.open(response.data.url, '_blank', 'noopener,noreferrer');
      message.success('Looker Studio s\'ouvre dans un nouvel onglet');
      
    } catch (error) {
      console.error('Erreur:', error);
      
      // Message d'erreur plus précis
      if (error.response?.data?.error) {
        message.error(`Erreur: ${error.response.data.error}`);
      } else if (error.response?.data?.message) {
        message.error(`Erreur: ${error.response.data.message}`);
      } else {
        message.error(error.message || 'Erreur de connexion à Looker Studio');
      }
      
      // Nettoyage et redirection si erreur 401
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="looker-container">
      <Button 
        type="primary"
        size="large"
        onClick={fetchLookerLink}
        loading={loading}
        style={{ margin: '20px' }}
      >
        Ouvrir Looker Studio
      </Button>
    </div>
  );
};

export default MagicTemplate;