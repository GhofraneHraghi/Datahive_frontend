import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, message, Layout, Card, Steps, Typography, Divider, Alert, Collapse, Select, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import Navbar from './Dashboard/Navbar';

const { Content } = Layout;
const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

const MagicTemplate = () => {
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const navigate = useNavigate();
  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchTemplates();
    }
  }, [navigate]);

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${VITE_BACKEND_BASE_URL}/api/looker-templates`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data?.templates && response.data.templates.length > 0) {
        setTemplates(response.data.templates);
        setSelectedTemplate(response.data.templates[0].id); // Select first template by default
      }
    } catch (error) {
      console.error('Erreur de chargement des templates:', error);
      message.error('Impossible de charger les templates de rapport');
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchLookerLink = async () => {
    setLoading(true);
    setDebugInfo(null);
    setCurrentStep(1); // Move to next step after click
    
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
          params: {
            templateId: selectedTemplate
          },
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
      
      window.open(response.data.url, '_blank', 'noopener,noreferrer');
      message.success('Votre rapport Looker Studio s\'ouvre dans un nouvel onglet');
      
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
      title: 'Choisir un template',
      content: (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <Card style={{ marginBottom: 20 }}>
            <Title level={4}>Sélectionnez un modèle de rapport</Title>
            <Paragraph>
              Choisissez parmi nos templates préconçus pour démarrer rapidement avec un rapport adapté à vos besoins.
            </Paragraph>
            
            {loadingTemplates ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin tip="Chargement des templates..." />
              </div>
            ) : (
              <Select
                style={{ width: '100%', marginTop: 16, marginBottom: 24, maxWidth: 500 }}
                placeholder="Sélectionnez un template"
                value={selectedTemplate}
                onChange={(value) => setSelectedTemplate(value)}
                disabled={templates.length === 0}
                size="large"
              >
                {templates.map(template => (
                  <Option key={template.id} value={template.id}>
                    {template.name} - {template.description}
                  </Option>
                ))}
              </Select>
            )}
            
            {templates.length === 0 && !loadingTemplates && (
              <Alert
                message="Aucun template disponible"
                description="Contactez votre administrateur pour créer des templates de rapport."
                type="info"
                showIcon
                style={{ marginTop: 20 }}
              />
            )}
            
            <Button 
              type="primary"
              size="large"
              onClick={fetchLookerLink}
              loading={loading}
              disabled={templates.length === 0 || !selectedTemplate}
              style={{ marginTop: 16 }}
            >
              Générer mon rapport
            </Button>
          </Card>
          
          <Alert
            message="Information"
            description="Le rapport sera pré-configuré avec votre base de données. Aucune configuration manuelle n'est nécessaire."
            type="info"
            showIcon
          />
        </div>
      ),
    },
    {
      title: 'Personnaliser votre rapport',
      content: (
        <Card style={{ marginTop: 20 }}>
          <Title level={4}>Votre rapport est prêt !</Title>
          <Paragraph>
            Votre rapport Looker Studio sest ouvert dans un nouvel onglet avec :
          </Paragraph>
          
          <ul style={{ marginBottom: 20 }}>
            <li>Connexion automatique à votre base de données</li>
            <li>Template préconfiguré selon votre choix</li>
            <li>Tables et champs déjà sélectionnés</li>
          </ul>
          
          <Title level={4}>Modifications possibles :</Title>
          <ol>
            <li>Ajoutez ou modifiez les visualisations selon vos besoins</li>
            <li>Personnalisez les filtres et les plages de dates</li>
            <li>Ajustez la mise en page et les couleurs</li>
            <li>Cliquez sur <Text strong>"Enregistrer"</Text> dans le menu supérieur pour sauvegarder vos modifications</li>
          </ol>
          
          <Alert
            message="Astuce"
            description="Pour partager votre rapport, cliquez sur 'Partager' dans le menu supérieur de Looker Studio."
            type="info"
            showIcon
            style={{ marginTop: 20 }}
          />
        </Card>
      ),
    },
    {
      title: 'Gérer vos rapports',
      content: (
        <Card style={{ marginTop: 20 }}>
          <Title level={4}>Accéder à vos rapports existants</Title>
          <Paragraph>
            Vous pouvez accéder à tous vos rapports précédemment créés :
          </Paragraph>
          
          <ol>
            <li>Visitez <a href="https://lookerstudio.google.com/u/0/navigation/reporting" target="_blank" rel="noopener noreferrer">Looker Studio</a></li>
            <li>Connectez-vous avec votre compte Google si nécessaire</li>
            <li>Vos rapports apparaîtront dans la liste des rapports récents</li>
          </ol>
          
          <Alert
            message="Besoin d'aide ?"
            description="Si vous rencontrez des difficultés avec vos rapports, contactez notre équipe de support technique."
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
            <Title level={2}>Rapports Looker Studio</Title>
            <Paragraph>
              Créez et personnalisez facilement des rapports Looker Studio avec vos données.
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