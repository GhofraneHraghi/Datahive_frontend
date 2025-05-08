import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const MagicTemplate = () => {
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
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
    setDebugInfo(null);
    
    try {
      console.log("Début de la requête pour le lien Looker");
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user) {
        message.error('Session expirée, veuillez vous reconnecter');
        navigate('/login');
        return;
      }
      
      console.log("Envoi de la requête au backend:", `${VITE_BACKEND_BASE_URL}/api/looker-link`);
      
      const response = await axios.get(
        `${VITE_BACKEND_BASE_URL}/api/looker-link`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Réponse reçue:", response.data);
      
      if (!response.data?.url) {
        throw new Error('Configuration Looker introuvable');
      }
      
      // Stockage de l'URL pour débogage
      setDebugInfo(response.data.url);
      
      // Vérification de l'URL
      if (response.data.url.includes('datasources/create')) {
        console.warn("ATTENTION: L'URL utilise toujours l'ancien format!");
        message.warning("L'URL générée utilise l'ancien format. Contactez l'administrateur.");
      }
      
      // Ouvrir l'URL dans un nouvel onglet
      console.log("Ouverture de l'URL Looker:", response.data.url);
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
      
      // Ajout d'informations de débogage
      setDebugInfo(error.response?.data || error.message);
      
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
      
      {/* Section de débogage */}
      {debugInfo && (
        <div style={{ margin: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h4>Informations de débogage:</h4>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {typeof debugInfo === 'string' ? debugInfo : JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default MagicTemplate;