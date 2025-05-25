import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Button, 
  message, 
  Layout, 
  Card, 
  Steps, 
  Typography, 
  Alert, 
  Collapse, 
  Select, 
  Spin,
  Divider
} from 'antd';
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons';
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
  const [dbName, setDbName] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [isEmptyTemplate, setIsEmptyTemplate] = useState(false);
  const [needsTokenRefresh, setNeedsTokenRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const navigate = useNavigate();
  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  // Debug function to check token content
  const debugToken = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('=== TOKEN DEBUG ===');
    console.log('Token exists:', !!token);
    console.log('Token length:', token?.length);
    console.log('User data:', user);
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('Tenant ID in token:', payload.tenant_id);
      } catch (e) {
        console.log('Cannot decode token:', e);
      }
    }
  };

  useEffect(() => {
    debugToken(); // Debug token content
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
      console.log('Refreshing token...');
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
      
      // Update stored token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('db_name', response.data.user.tenant_id ? 'updated' : '');
      
      console.log('Token refreshed successfully:', response.data);
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
      // Récupérer le db_name en premier
      const dbName = await fetchDbName();
      console.log('DB Name initialisé:', dbName);
      
      // Puis récupérer les templates
      const templates = await fetchTemplates();
      console.log('Templates initialisés:', templates?.length || 0);
      
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
      
      console.log('DB Name récupéré:', response.data.db_name);
      setDbName(response.data.db_name);
      localStorage.setItem('db_name', response.data.db_name);
      
      return response.data.db_name;
    } catch (error) {
      console.error('Erreur lors de la récupération du nom de la DB:', error);
      
      // Handle tenant not assigned error with auto-refresh
      if (error.response?.data?.needsRefresh && retryCount === 0) {
        console.log('Tenant not assigned, attempting token refresh...');
        try {
          await refreshToken();
          return await fetchDbName(1); // Retry once after refresh
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
      
      // Try to get from localStorage as fallback
      const cachedDbName = localStorage.getItem('db_name');
      if (cachedDbName && cachedDbName !== 'updated') {
        setDbName(cachedDbName);
        return cachedDbName;
      }
      
      setDbName('');
      throw error;
    }
  };

  const fetchTemplates = async (retryCount = 0) => {
    setLoadingTemplates(true);
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
      
      console.log('Templates reçus:', response.data);
      
      if (response.data?.templates && response.data.templates.length > 0) {
        setTemplates(response.data.templates);
        const firstTemplateId = response.data.templates[0].looker_id;
        setSelectedTemplate(firstTemplateId);
        
        console.log('Premier template sélectionné:', firstTemplateId);
        checkIfEmptyTemplate(response.data.templates[0].template_data);
        
        return response.data.templates;
      } else {
        console.log('Aucun template trouvé ou structure de données incorrecte');
        setTemplates([]);
        setSelectedTemplate(null);
        return [];
      }
    } catch (error) {
      console.error('Erreur de chargement des templates:', error);
      
      // Handle tenant not assigned error with auto-refresh
      if (error.response?.data?.needsRefresh && retryCount === 0) {
        console.log('Tenant not assigned, attempting token refresh...');
        setNeedsTokenRefresh(true);
        try {
          await refreshToken();
          return await fetchTemplates(1); // Retry once after refresh
        } catch (refreshError) {
          console.error('Auto-refresh failed:', refreshError);
        }
      }
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('db_name');
        navigate('/login');
        return [];
      }
      
      message.error('Impossible de charger les templates de rapport');
      setTemplates([]);
      setSelectedTemplate(null);
      throw error;
    } finally {
      setLoadingTemplates(false);
    }
  };

  const checkIfEmptyTemplate = (templateData) => {
    try {
      if (!templateData) {
        setIsEmptyTemplate(true);
        return;
      }
      
      const data = JSON.parse(templateData);
      setIsEmptyTemplate(Object.keys(data).length === 0);
    } catch {
      setIsEmptyTemplate(false);
    }
  };

  const fetchLookerLink = async () => {
    setLoading(true);
    setDebugInfo(null);
    
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user) {
        message.error('Session expirée, veuillez vous reconnecter');
        navigate('/login');
        return;
      }
      
      console.log('Génération du lien avec templateId:', selectedTemplate);
      
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
        throw new Error('URL Looker Studio introuvable');
      }
      
      setDebugInfo(response.data.url);
      window.open(response.data.url, '_blank', 'noopener,noreferrer');
      message.success('Votre rapport Looker Studio s\'ouvre dans un nouvel onglet');
      setCurrentStep(1);
      
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success('Copié dans le presse-papier');
  };

  const handleTemplateChange = (value) => {
    console.log('Template sélectionné:', value);
    setSelectedTemplate(value);
    const selected = templates.find(t => t.looker_id === value);
    if (selected) {
      checkIfEmptyTemplate(selected.template_data);
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

  // Render refresh alert when needed
  const renderRefreshAlert = () => {
    if (needsTokenRefresh || (templates.length === 0 && !loadingTemplates && !initializing)) {
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

  const steps = [
    {
      title: 'Choisir un template',
      content: (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          {renderRefreshAlert()}
          
          <Card style={{ marginBottom: 20 }}>
            <Title level={4}>Sélectionnez un modèle de rapport</Title>
            <Paragraph>
              Choisissez parmi nos templates préconçus pour démarrer rapidement avec un rapport adapté à vos besoins.
            </Paragraph>
            
            {loadingTemplates || initializing ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin tip={initializing ? "Initialisation..." : "Chargement des templates..."} />
              </div>
            ) : (
              <Select
                style={{ width: '100%', marginTop: 16, marginBottom: 24, maxWidth: 500 }}
                placeholder="Sélectionnez un template"
                value={selectedTemplate}
                onChange={handleTemplateChange}
                disabled={templates.length === 0}
                size="large"
              >
                {templates.map(template => (
                  <Option key={template.looker_id} value={template.looker_id}>
                    {template.looker_name} - {template.description}
                  </Option>
                ))}
              </Select>
            )}
            
            {templates.length === 0 && !loadingTemplates && !initializing && !needsTokenRefresh && (
              <Alert
                message="Aucun template disponible"
                description="Contactez votre administrateur pour créer des templates de rapport."
                type="info"
                showIcon
                style={{ marginTop: 20 }}
              />
            )}
            
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Button 
                type="primary"
                size="large"
                onClick={fetchLookerLink}
                loading={loading}
                disabled={initializing || templates.length === 0 || !selectedTemplate || !dbName || needsTokenRefresh}
              >
                Générer mon rapport
              </Button>
              
              <Button 
                style={{ marginLeft: 16 }}
                onClick={() => setCurrentStep(1)}
                disabled={needsTokenRefresh}
              >
                Passer à la configuration
              </Button>
            </div>
          </Card>
        </div>
      ),
    },
    {
      title: 'Personnaliser votre rapport',
      content: (
        <Card style={{ marginTop: 20 }}>
          {isEmptyTemplate ? (
            <>
              <Title level={4}>Création dun nouveau rapport</Title>
              <Paragraph>
                Vous avez choisi de créer un rapport vide. Voici comment procéder :
              </Paragraph>
              
              <ol>
                <li>Dans Looker Studio, cliquez sur <Text strong>"Créer"</Text> puis <Text strong>"Rapport"</Text></li>
                <li>Sélectionnez <Text strong>"Nouvelle source de données"</Text></li>
                <li>Choisissez le connecteur MySQL</li>
                <li>Remplissez les informations de connexion ci-dessous</li>
                <li>Sélectionnez les tables et champs à utiliser</li>
                <li>Créez vos visualisations (tableaux, graphiques, etc.)</li>
              </ol>
              
              <Divider orientation="left">Configuration requise</Divider>
            </>
          ) : (
            <>
              <Title level={4}>Votre rapport est prêt !</Title>
              <Paragraph>
                Votre rapport Looker Studio sest ouvert dans un nouvel onglet avec :
              </Paragraph>
              
              <ul style={{ marginBottom: 20 }}>
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
            </>
          )}
          
          <Collapse style={{ marginTop: 20 }}>
            <Panel header="Configuration de connexion MySQL (Copier ces informations)" key="db-config">
              <Alert
                message="Informations sensibles"
                description="Ces identifiants sont personnels et confidentiels"
                type="warning"
                showIcon
                style={{ marginBottom: 20 }}
              />

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #d9d9d9', width: '150px' }}>
                      <Text strong>Hôte MySQL:</Text>
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #d9d9d9' }}>
                      ****
                      <Button 
                        type="text" 
                        icon={<CopyOutlined />} 
                        onClick={() => copyToClipboard('51.38.187.245')}
                        style={{ marginLeft: 8 }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #d9d9d9', width: '150px' }}>
                      <Text strong>Nom de la base :</Text>
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #d9d9d9' }}>
                      {dbName || '****'}
                      <Button 
                        type="text" 
                        icon={<CopyOutlined />} 
                        onClick={() => copyToClipboard(dbName)}
                        style={{ marginLeft: 8 }}
                        disabled={!dbName}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #d9d9d9' }}>
                      <Text strong>Port:</Text>
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #d9d9d9' }}>
                      ****
                      <Button 
                        type="text" 
                        icon={<CopyOutlined />} 
                        onClick={() => copyToClipboard('3306')}
                        style={{ marginLeft: 8 }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #d9d9d9' }}>
                      <Text strong>Utilisateur:</Text>
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #d9d9d9' }}>
                      ****
                      <Button 
                        type="text" 
                        icon={<CopyOutlined />} 
                        onClick={() => copyToClipboard('looker_user')}
                        style={{ marginLeft: 8 }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #d9d9d9' }}>
                      <Text strong>Mot de passe:</Text>
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #d9d9d9' }}>
                      ****
                      <Button 
                        type="text" 
                        icon={<CopyOutlined />} 
                        onClick={() => copyToClipboard('lokaszsh98@Datahive_looker')}
                        style={{ marginLeft: 8 }}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <Alert
                message="Instructions"
                description={
                  <>
                    <p>1. Dans Looker Studio, sélectionnez "Créer une source de données"</p>
                    <p>2. Choisissez le connecteur MySQL</p>
                    <p>3. Remplissez les champs avec les informations ci-dessus</p>
                    <p>4. Cliquez sur "Authentifier"</p>
                  </>
                }
                type="info"
                showIcon
              />
            </Panel>
          </Collapse>

          <Alert
            message="Astuce"
            description="Pour partager votre rapport, cliquez sur 'Partager' dans le menu supérieur de Looker Studio."
            type="info"
            showIcon
            style={{ marginTop: 20 }}
          />

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Button 
              style={{ marginRight: 8 }} 
              onClick={() => setCurrentStep(0)}
            >
              Retour
            </Button>
            <Button 
              type="primary"
              onClick={() => setCurrentStep(2)}
            >
              Continuer vers la gestion
            </Button>
          </div>
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

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <Button 
              style={{ marginRight: 8 }}
              onClick={() => setCurrentStep(1)}
            >
              Retour à la personnalisation
            </Button>
            <Button 
              type="primary"
              onClick={() => {
                setCurrentStep(0);
                setDebugInfo(null);
              }}
            >
              Créer un nouveau rapport
            </Button>
          </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <Title level={2}>Rapports Looker Studio</Title>
                <Paragraph>
                  Créez et personnalisez facilement des rapports Looker Studio avec vos données.
                </Paragraph>
              </div>
              
              {/* Manual refresh button in header */}
              <Button
                icon={<ReloadOutlined />}
                onClick={handleManualRefresh}
                loading={refreshing}
                type="default"
              >
                Actualiser
              </Button>
            </div>
            
            <Steps current={currentStep} style={{ margin: '40px 0' }}>
              {steps.map((item) => (
                <Step key={item.title} title={item.title} />
              ))}
            </Steps>
            
            <div className="steps-content">{steps[currentStep].content}</div>
            
            {debugInfo && (
              <Collapse style={{ marginTop: 40 }}>
                <Panel header="Informations techniques (pour support)" key="1">
                  <div>
                    <h4>URL générée :</h4>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {typeof debugInfo === 'string' ? debugInfo : JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </div>
                  <Paragraph>
                    En cas de problème, fournissez ces informations à léquipe technique.
                  </Paragraph>
                </Panel>
              </Collapse>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MagicTemplate;