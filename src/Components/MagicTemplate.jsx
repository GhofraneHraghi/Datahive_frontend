import React, { useState } from 'react';
import axios from 'axios';
import { Button, message, Steps } from 'antd';

const { Step } = Steps;

export const MagicTemplate = () => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Veuillez vous reconnecter');

      const response = await axios.get('/api/looker-config', {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });

      // Téléchargement automatique
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'config-looker.json');
      document.body.appendChild(link);
      link.click();
      
      message.success('Configuration téléchargée !');
    } catch (error) {
      message.error(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Steps current={0} style={{ marginBottom: 30 }}>
        <Step title="Télécharger" description="Obtenir la configuration" />
        <Step title="Importer" description="Dans Looker Studio" />
        <Step title="Créer" description="Vos rapports personnalisés" />
      </Steps>

      <Button 
        type="primary" 
        size="large"
        onClick={handleDownload}
        loading={loading}
      >
        Télécharger la configuration
      </Button>

      <div style={{ marginTop: 20 }}>
        <a 
          href="https://lookerstudio.google.com" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Ouvrir Looker Studio dans un nouvel onglet
        </a>
      </div>
    </div>
  );
};