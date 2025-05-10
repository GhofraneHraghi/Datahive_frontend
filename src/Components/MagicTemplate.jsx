import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, message, Layout, Card, Steps, Typography, Divider, Alert, Collapse } from 'antd';
import { useNavigate } from 'react-router-dom';
import Navbar from './Dashboard/Navbar';

const { Content } = Layout;
const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const MagicTemplate = () => {
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const fetchLookerLink = async () => {
    setLoading(true);
    setDebugInfo(null);
    setCurrentStep(1); // Passer à l'étape suivante après le clic
    
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
      
      setDebugInfo(response.data.url);
      
      if (response.data.url.includes('datasources/create')) {
        console.warn("ATTENTION: L'URL utilise toujours l'ancien format!");
        message.warning("L'URL générée utilise l'ancien format. Contactez l'administrateur.");
      }
      
      window.open(response.data.url, '_blank', 'noopener,noreferrer');
      message.success('Looker Studio s\'ouvre dans un nouvel onglet');
      
    } catch (error) {
      console.error('Erreur:', error);
      
      if (error.response?.data?.error) {
        message.error(`Erreur: ${error.response.data.error}`);
      } else if (error.response?.data?.message) {
        message.error(`Erreur: ${error.response.data.message}`);
      } else {
        message.error(error.message || 'Erreur de connexion à Looker Studio');
      }
      
      setDebugInfo(error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Lancer Looker Studio',
      content: (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <Button 
            type="primary"
            size="large"
            onClick={fetchLookerLink}
            loading={loading}
          >
            Ouvrir Looker Studio
          </Button>
          <Paragraph style={{ marginTop: 20 }}>
            Cliquez sur le bouton ci-dessus pour ouvrir Looker Studio dans un nouvel onglet.
          </Paragraph>
        </div>
      ),
    },
    {
      title: 'Configurer la source de données',
      content: (
        <Card style={{ marginTop: 20 }}>
          <Title level={4}>Étapes de configuration :</Title>
          <ol>
            <li>Dans Looker Studio, sélectionnez <Text strong>"Créer une source de données"</Text></li>
            <li>Choisissez le connecteur MySQL</li>
            <li>Remplissez les champs avec les informations suivantes :</li>
          </ol>
          
          <Divider orientation="left">Paramètres de connexion</Divider>
          
          <Alert
            message="Informations sensibles"
            description="Ces identifiants sont personnels et confidentiels"
            type="warning"
            showIcon
            style={{ marginBottom: 20 }}
          />
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #d9d9d9', width: '120px' }}><Text strong>IP :</Text></td>
                <td style={{ padding: '8px', border: '1px solid #d9d9d9' }}>51.38.187.245</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #d9d9d9' }}><Text strong>Port :</Text></td>
                <td style={{ padding: '8px', border: '1px solid #d9d9d9' }}>3306</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #d9d9d9' }}><Text strong>Database :</Text></td>
                <td style={{ padding: '8px', border: '1px solid #d9d9d9' }}>
                  Votre nom de base de données (visible dans lURL Looker après ouverture)
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #d9d9d9' }}><Text strong>User :</Text></td>
                <td style={{ padding: '8px', border: '1px solid #d9d9d9' }}>looker_user</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #d9d9d9' }}><Text strong>Password :</Text></td>
                <td style={{ padding: '8px', border: '1px solid #d9d9d9' }}>lokaszsh98@Datahive_looker</td>
              </tr>
            </tbody>
          </table>
          
          <Paragraph style={{ marginTop: 20 }}>
            Après avoir rempli ces champs, cliquez sur <Text strong>"Authentifier"</Text> pour valider la connexion.
          </Paragraph>
        </Card>
      ),
    },
    {
      title: 'Créer et enregistrer le rapport',
      content: (
        <Card style={{ marginTop: 20 }}>
          <Title level={4}>Finalisation du rapport</Title>
          <ol>
            <li>Une fois la source de données configurée, sélectionnez les tables et champs nécessaires</li>
            <li>Créez vos visualisations (tableaux, graphiques, etc.)</li>
            <li>Cliquez sur <Text strong>"Enregistrer"</Text> dans le menu supérieur</li>
            <li>Donnez un nom clair à votre rapport</li>
            <li>Choisissez un dossier de destination si nécessaire</li>
            <li>Cliquez sur <Text strong>"Enregistrer"</Text> pour finaliser</li>
          </ol>
          
          <Alert
            message="Astuce"
            description="Vous pouvez partager votre rapport en cliquant sur 'Partager' dans le menu supérieur"
            type="info"
            showIcon
            style={{ marginTop: 20 }}
          />
        </Card>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar onCollapse={(collapsed) => setCollapsed(collapsed)} />
      <Layout 
        className="site-layout" 
        style={{ 
          marginLeft: collapsed ? 80 : 250,
          transition: 'margin-left 0.2s'
        }}
      >
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 'calc(100vh - 112px)' }}>
            <Title level={2}>Guide de création de rapport Looker Studio</Title>
            <Paragraph>
              Suivez ces étapes pour connecter votre base de données et créer votre premier rapport.
            </Paragraph>
            
            <Steps current={currentStep} style={{ margin: '40px 0' }}>
              {steps.map((item) => (
                <Step key={item.title} title={item.title} />
              ))}
            </Steps>
            
            <div className="steps-content">{steps[currentStep].content}</div>
            
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              {currentStep > 0 && (
                <Button style={{ marginRight: 8 }} onClick={() => setCurrentStep(currentStep - 1)}>
                  Précédent
                </Button>
              )}
              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                  Suivant
                </Button>
              )}
            </div>
            
            <Collapse style={{ marginTop: 40 }}>
              <Panel header="Informations techniques (pour support)" key="1">
                {debugInfo && (
                  <div>
                    <h4>URL générée :</h4>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {typeof debugInfo === 'string' ? debugInfo : JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </div>
                )}
                <Paragraph>
                  En cas de problème, fournissez ces informations à léquipe technique.
                </Paragraph>
              </Panel>
            </Collapse>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MagicTemplate;