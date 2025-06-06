import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Button, 
  message, 
  Layout, 
  Card, 
  Typography, 
  Alert, 
  Spin,
  Divider,
  Space,
  Tooltip,
  Empty
} from 'antd';
import { 
  ReloadOutlined, 
  LeftOutlined,
  RightOutlined,
  DashboardOutlined,
  QuestionCircleOutlined,
  PlayCircleOutlined,
  EditOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from './Dashboard/Navbar';
import Guide from './Guide'; // Import du composant Guide

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

// Configuration des couleurs
const BLUE_COLOR = '#1890ff';

const MagicTemplate = () => {
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  
  // États pour les templates récupérés depuis l'API
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  
  const [dbName, setDbName] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [needsTokenRefresh, setNeedsTokenRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // États pour le guide
  const [guideVisible, setGuideVisible] = useState(false);
  
  const navigate = useNavigate();
  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  // Fonction pour récupérer les templates depuis l'API
  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token manquant');
      }

      const response = await axios.get(
        `${VITE_BACKEND_BASE_URL}/api/looker-templates`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Templates récupérés:', response.data.templates);
      
      // Traiter les templates pour extraire les données
      const processedTemplates = response.data.templates.map(template => {
        let templateData;
        try {
          // Parser le template_data s'il est en JSON
          templateData = typeof template.template_data === 'string' 
            ? JSON.parse(template.template_data) 
            : template.template_data;
        } catch (error) {
          console.error('Erreur parsing template_data:', error);
          templateData = { embedUrl: template.template_data };
        }

        return {
          id: template.looker_id,
          name: template.looker_name,
          description: template.description,
          embedUrl: templateData.embedUrl || templateData.reportTemplate || template.template_data,
          color: BLUE_COLOR
        };
      });

      setTemplates(processedTemplates);
      
      // Sélectionner le premier template par défaut
      if (processedTemplates.length > 0) {
        setSelectedTemplate(processedTemplates[0]);
        setCurrentTemplateIndex(0);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
      message.error('Erreur lors du chargement des templates');
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('db_name');
        navigate('/login');
      }
    } finally {
      setTemplatesLoading(false);
    }
  };

  // Navigation entre les templates
  const navigateTemplate = (direction) => {
    if (templates.length === 0) return;
    
    const newIndex = direction === 'next' 
      ? (currentTemplateIndex + 1) % templates.length
      : (currentTemplateIndex - 1 + templates.length) % templates.length;
    
    setCurrentTemplateIndex(newIndex);
    setSelectedTemplate(templates[newIndex]);
  };

  // Sélection directe d'un template
  const selectTemplate = (template, index) => {
    setSelectedTemplate(template);
    setCurrentTemplateIndex(index);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      initializeData();
    }
  }, [navigate]);

  // Function to refresh token with updated tenant_id
  const refreshToken = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${VITE_BACKEND_BASE_URL}/api/refresh-token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('db_name', response.data.user.tenant_id ? 'updated' : '');
      
      setNeedsTokenRefresh(false);
      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('db_name');
        navigate('/login');
      }
      throw error;
    } finally {
      setRefreshing(false);
    }
  };

  const initializeData = async () => {
    setInitializing(true);
    try {
      // Charger les templates et les données DB en parallel
      await Promise.all([
        fetchTemplates(),
        fetchDbName()
      ]);
      console.log('Données initialisées avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des données:', error);
      if (error.response?.data?.needsRefresh) {
        setNeedsTokenRefresh(true);
      } else {
        message.error('Erreur lors du chargement des données initiales');
      }
    } finally {
      setInitializing(false);
    }
  };

  const fetchDbName = async (retryCount = 0) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token manquant');
      }

      const response = await axios.get(
        `${VITE_BACKEND_BASE_URL}/api/tenant-db`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setDbName(response.data.db_name);
      localStorage.setItem('db_name', response.data.db_name);
      return response.data.db_name;
    } catch (error) {
      console.error('Erreur lors de la récupération du nom de la DB:', error);
      
      if (error.response?.data?.needsRefresh && retryCount === 0) {
        console.log('Tenant not assigned, attempting token refresh...');
        try {
          await refreshToken();
          return await fetchDbName(1);
        } catch (refreshError) {
          console.error('Auto-refresh failed:', refreshError);
        }
      }
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('db_name');
        navigate('/login');
        return;
      }
      
      const cachedDbName = localStorage.getItem('db_name');
      if (cachedDbName && cachedDbName !== 'updated') {
        setDbName(cachedDbName);
        return cachedDbName;
      }
      
      setDbName('');
      throw error;
    }
  };

  const fetchLookerLink = async (useTemplate = false) => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user) {
        message.error('Session expirée, veuillez vous reconnecter');
        navigate('/login');
        return;
      }
      
      if (useTemplate && !selectedTemplate) {
        message.error('Aucun template sélectionné');
        return;
      }
      
      console.log('Demande de lien Looker:', {
        useTemplate,
        templateId: useTemplate ? selectedTemplate.id : 'blank'
      });
      
      const response = await axios.get(
        `${VITE_BACKEND_BASE_URL}/api/looker-link`,
        {
          params: {
            templateId: useTemplate ? selectedTemplate.id : 'blank',
            predefined: useTemplate
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data?.url) {
        window.open(response.data.url, '_blank', 'noopener,noreferrer');
        message.success(useTemplate 
          ? 'Votre template pré-configuré s\'ouvre dans un nouvel onglet'
          : 'Votre rapport vierge s\'ouvre dans un nouvel onglet'
        );
      } else {
        throw new Error('URL Looker non reçue');
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      
      // Gestion des erreurs avec fallback
      if (useTemplate && selectedTemplate) {
        const fallbackUrl = selectedTemplate.embedUrl.replace('/embed/', '/');
        window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
        message.warning('Redirection directe vers le template (mode fallback)');
      } else {
        window.open('https://lookerstudio.google.com/datasources/create?connectorId=AKfycbyl-ZwfBzwXRCIipQkH5l0boKCcE2uN5g1-XwAxK5EIbkBtaiHxuDjPOIo28iwtK3ykag', '_blank', 'noopener,noreferrer');
        message.warning('Redirection directe vers Looker Studio (mode fallback)');
      }
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh handler
  const handleManualRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshToken();
      await initializeData();
      message.success('Données rafraîchies avec succès !');
    } catch (error) {
      message.error('Erreur lors du rafraîchissement');
    }
  };

  // Guide handlers
  const openGuide = () => {
    setGuideVisible(true);
  };

  const closeGuide = () => {
    setGuideVisible(false);
  };

  // Render refresh alert when needed
  const renderRefreshAlert = () => {
    if (needsTokenRefresh) {
      return (
        <Alert
          message="Données non disponibles"
          description="Vos informations de tenant ne sont pas à jour. Cliquez pour rafraîchir vos données."
          type="warning"
          showIcon
          style={{ marginBottom: 20 }}
          action={
            <Button 
              size="small" 
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={handleManualRefresh}
              loading={refreshing}
            >
              Rafraîchir
            </Button>
          }
        />
      );
    }
    return null;
  };

  // Template Preview with Navigation
  const renderTemplatePreview = () => {
    if (templatesLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Spin size="large" tip="Chargement des templates..." />
        </div>
      );
    }

    if (templates.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Empty 
            description="Aucun template disponible"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      );
    }

    if (!selectedTemplate) {
      return (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Spin size="large" tip="Chargement du template..." />
        </div>
      );
    }

    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <Title level={3} style={{ color: BLUE_COLOR, margin: 0 }}>
                <DashboardOutlined style={{ marginRight: 8 }} />
                {selectedTemplate.name}
              </Title>
              <Text type="secondary">
                Template {currentTemplateIndex + 1} sur {templates.length}
              </Text>
            </div>
            
            <Space>
              <Button
                onClick={() => navigateTemplate('prev')}
                icon={<LeftOutlined />}
                size="large"
                type="primary"
                disabled={templates.length <= 1}
              >
                Précédent
              </Button>
              <Button
                onClick={() => navigateTemplate('next')}
                icon={<RightOutlined />}
                size="large"
                type="primary"
                disabled={templates.length <= 1}
              >
                Suivant
              </Button>
            </Space>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <Paragraph style={{ fontSize: 16, marginBottom: 16, maxWidth: 800, margin: '0 auto' }}>
              {selectedTemplate.description}
            </Paragraph>
          </div>

          {/* Template centré sur toute la largeur */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ 
              border: '1px solid #d9d9d9', 
              borderRadius: 6,
              overflow: 'hidden',
              background: '#f5f5f5',
              width: '100%'
            }}>
              <iframe
                width="100%"
                height="600"
                src={selectedTemplate.embedUrl}
                frameBorder="0"
                style={{ border: 0 }}
                allowFullScreen
                sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              />
            </div>
          </div>

          <Divider />
          
          <div style={{ textAlign: 'center' }}>
            <Space size="large">
              <Button 
                type="primary"
                size="large"
                onClick={() => fetchLookerLink(true)} // true = utiliser le template
                loading={loading}
                disabled={initializing || !selectedTemplate || needsTokenRefresh}
                style={{ 
                  minWidth: 200,
                  backgroundColor: BLUE_COLOR,
                  borderColor: BLUE_COLOR
                }}
                icon={<PlayCircleOutlined />}
              >
                Utiliser ce Template
              </Button>
              
              <Button 
                size="large"
                onClick={() => fetchLookerLink(false)} // false = rapport vierge
                loading={loading}
                disabled={initializing || !dbName || needsTokenRefresh}
                style={{ 
                  minWidth: 200
                }}
                icon={<EditOutlined />}
              >
                Créer un Rapport Vierge
              </Button>
            </Space>
            
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                <InfoCircleOutlined style={{ marginRight: 4 }} />
                Choisissez "Utiliser ce Template" pour un rapport pré-configuré avec des données dexemple,
                ou "Créer un Rapport Vierge" pour partir de zéro.
              </Text>
            </div>
          </div>
        </Card>

        {/* Template Navigation Indicators */}
        {templates.length > 1 && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Space>
              {templates.map((template, index) => (
                <Button
                  key={template.id}
                  size="small"
                  type={index === currentTemplateIndex ? 'primary' : 'default'}
                  style={{
                    backgroundColor: index === currentTemplateIndex ? BLUE_COLOR : undefined,
                    borderColor: index === currentTemplateIndex ? BLUE_COLOR : undefined,
                    width: 8,
                    height: 8,
                    padding: 0,
                    borderRadius: '50%'
                  }}
                  onClick={() => selectTemplate(template, index)}
                />
              ))}
            </Space>
          </div>
        )}
      </div>
    );
  };
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
        <div style={{ 
          padding: 24, 
          background: '#fff', 
          minHeight: 'calc(100vh - 112px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{ 
            width: '100%', 
            maxWidth: '1400px',
            marginBottom: 24 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={2}>Rapports Looker Studio</Title>
                <Paragraph>
                  Naviguez entre nos templates préconçus et créez votre rapport en quelques clics.
                </Paragraph>
              </div>
              
              <Space>
                <Tooltip title="Ouvrir le guide d'utilisation">
                  <Button
                    icon={<QuestionCircleOutlined />}
                    onClick={openGuide}
                    type="default"
                    style={{ 
                      borderColor: BLUE_COLOR,
                      color: BLUE_COLOR
                    }}
                  >
                    Guide dutilisation
                  </Button>
                </Tooltip>
                
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleManualRefresh}
                  loading={refreshing}
                  type="default"
                >
                  Actualiser
                </Button>
              </Space>
            </div>
            
            {renderRefreshAlert()}
          </div>
          
          {initializing ? (
            <div style={{ textAlign: 'center', padding: '60px', flex: 1 }}>
              <Spin size="large" tip="Initialisation..." />
            </div>
          ) : (
            <div style={{ width: '100%', flex: 1 }}>
              {renderTemplatePreview()}
            </div>
          )}
        </div>
      </Content>
    </Layout>

    {/* AJOUTER CETTE LIGNE - Composant Guide */}
    <Guide visible={guideVisible} onClose={closeGuide} />
  </Layout>
);
};

export default MagicTemplate;