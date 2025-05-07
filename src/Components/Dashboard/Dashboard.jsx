import React, { useState, useEffect } from 'react';
import {
  Layout, Typography, Card, Steps, Button, Input, Form, Row, Col,
  message, Space, Progress, Alert, Modal
} from 'antd';
import {
  CopyOutlined,  CloudOutlined, PlayCircleOutlined,
  ApiOutlined, CheckCircleOutlined, 
  InfoCircleOutlined, RocketOutlined,
  ThunderboltOutlined,  CloseOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Guide from './Guide';
import Navbar from './Navbar';
import './Dashboard.css';

const {  Content, Footer, Sider } = Layout;
const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;
const BASE_URL = import.meta.env.BASE_URL;

const Dashboard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [bucketURI, setBucketURI] = useState('');
  const [keyFile, setKeyFile] = useState(null);
  const [tenantName, setTenantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [userId, setUserId] = useState(null);
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [guideVisible, setGuideVisible] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  
  // Variables pour la navbar
  const [navbarCollapsed, setNavbarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState('accueil');

  // Récupération de l'URL de base depuis les variables d'environnement Vite
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('authToken');
    
    if (!token || !user) {
      navigate('/login');
      return;
    }
    
    setUserId(user.id);
    
    // Vérifier l'abonnement à partir des données stockées
    if (user.has_active_subscription) {
      setHasActivePlan(true);
    } else {
      // En cas de doute, vérifier à nouveau auprès du serveur
      checkSubscription();
    }
    
    setHasNotifications(Math.random() > 0.5);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  const checkSubscription = async () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
      navigate('/login');
      return;
    }

    try {
      const res = await axios.get(`${BASE_URL}/api/user-subscription/${user.id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      const isActive = res.data?.subscription?.status === 'active';
      
      // Mettre à jour l'état local et le localStorage
      setHasActivePlan(isActive);
      
      // Mettre à jour le localStorage avec l'information d'abonnement
      const updatedUser = {
        ...user,
        subscription_id: res.data?.subscription?.id || null,
        has_active_subscription: isActive
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
    } catch (error) {
      console.error('Subscription check error:', error);
      setHasActivePlan(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('test-google-play-console@pc-api-4722596725443039036-6');
    messageApi.success('Email copié !', 2);
  };

  const handleSubmit = async () => {
    try {
      if (!bucketURI || !tenantName) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      console.log('bucketURI:', bucketURI);
      console.log('sourceName:', tenantName);
      console.log('userId:', userId);

      setLoading(true);

      // Utilisation d'Axios au lieu de fetch pour plus de lisibilité
      const response = await axios.post(`${API_BASE_URL}/api/process-bucket`, {
        bucketURI,
        sourceName: tenantName,
        userId
      });

      messageApi.success(`Configuration réussie pour ${tenantName}`);

      // Réinitialisation après succès
      form.resetFields();
      setCurrentStep(0);

    } catch (error) {
      messageApi.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavbarCollapse = (collapsed) => {
    setNavbarCollapsed(collapsed);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Bouton pour ouvrir/fermer le guide (sidebar)
  const handleToggleGuide = () => {
    setGuideVisible((prev) => !prev);
  };

  const steps = [
    {
      title: 'Invitation',
      icon: <ApiOutlined />,
      content: (
        <Card title="Étape 1: Inviter le compte" className="step-card">
          <Paragraph>
            Accordez laccès à votre Google Play Console en invitant notre compte de service.
          </Paragraph>
          <Card type="inner" className="instruction-card">
            <ol className="feature-list">
              <li>Connectez-vous à votre Google Play Console</li>
              <li>Accédez à Utilisateurs et permissions</li>
              <li>Invitez un nouvel utilisateur avec accès admin</li>
              <li>Utilisez lemail ci-dessous</li>
            </ol>
          </Card>
          <Form.Item label="Email d'invitation">
            <Input.Group compact>
              <Input
                value="test-google-play-console@pc-api-4722596725443039036-6"
                readOnly
                className="readonly-input"
              />
              <Button 
                type="primary"
                icon={<CopyOutlined />}
                onClick={handleCopy}
                className="copy-button"
              >
                Copier
              </Button>
            </Input.Group>
          </Form.Item>
        </Card>
      ),
    },
    {
      title: 'Configuration GCS',
      icon: <CloudOutlined />,
      content: (
        <Card title="Étape 2: Configurer Google Cloud Storage" className="step-card">
          <Paragraph>
            Indiquez ladresse de votre bucket Google Cloud Storage pour recevoir les données synchronisées.
          </Paragraph>
          <Form layout="vertical">
            <Form.Item
              label="URI GCS"
              name="bucketURI"
              rules={[{ required: true, message: "L'URI du bucket est requise" }]}
            >
              <Input
                placeholder="gs://nom-de-votre-bucket"
                value={bucketURI}
                onChange={(e) => setBucketURI(e.target.value)}
                prefix={<CloudOutlined />}
                disabled={!hasActivePlan}
              />
            </Form.Item>
          </Form>
          <Alert
            message="Authentification automatique"
            description="Notre application utilisera automatiquement les identifiants sécurisés pour accéder à votre bucket."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        </Card>
      ),
    },
    {
      title: 'Nommer la source',
      icon: <PlayCircleOutlined />,
      content: (
        <Card title="Étape 3: Nommez votre source de données" className="step-card">
          <Paragraph>
            Identifiez cette source de données avec un nom significatif pour vos rapports.
          </Paragraph>
          <Form layout="vertical">
            <Form.Item
              label="Nom de la source"
              name="tenantName"
              rules={[{ required: true, message: 'Le nom de la source est requis' }]}
            >
              <Input
                placeholder="ex. MonApp-Production"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                disabled={!hasActivePlan}
              />
            </Form.Item>
          </Form>

          {syncStatus === 'syncing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="progress-card">
                <Space direction="vertical" size="middle">
                  <Progress 
                    percent={syncProgress}
                    status="active"
                    strokeColor={{ from: '#1890ff', to: '#096dd9' }}
                  />
                  <Text>Synchronisation de vos données...</Text>
                </Space>
              </Card>
            </motion.div>
          )}

          {syncStatus === 'completed' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="success-card">
                <Space direction="vertical" size="middle">
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
                  <Text strong>Configuration terminée avec succès !</Text>
                </Space>
              </Card>
            </motion.div>
          )}

          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            block
            size="large"
            icon={<ThunderboltOutlined />}
            className="submit-button"
            disabled={!hasActivePlan}
          >
            Terminer la configuration
          </Button>
        </Card>
      ),
    },
  ];

  useEffect(() => {
    const audio = document.getElementById('myAudio');
    if (audio && audio.paused) {
      audio.play();
    }
  }, []);

  return (
    <Layout className="dashboard-layout">
      {contextHolder}

      {/* Navbar importée */}
      <Navbar 
        onCollapse={handleNavbarCollapse} 
        onPageChange={handlePageChange}
      />

      <Layout
        style={{
          marginLeft: isMobile ? 0 : (navbarCollapsed ? 80 : 250),
          marginRight: guideVisible ? 300 : 0,
          transition: 'margin-left 0.2s, margin-right 0.2s'
        }}
      >
        <Content className="dashboard-content">
          {/* Bouton pour ouvrir le guide (desktop) */}
          {!isMobile && !guideVisible && (
            <Button
              type="primary"
              icon={<InfoCircleOutlined />}
              onClick={handleToggleGuide}
              style={{
                marginBottom: 24,
                float: 'right',
                zIndex: 1100
              }}
            >
              Ouvrir le guide
            </Button>
          )}
          {/* Bouton pour fermer le guide (desktop) */}
          {!isMobile && guideVisible && (
            <Button
              type="primary"
              icon={<CloseOutlined />}
              onClick={handleToggleGuide}
              style={{
                marginBottom: 24,
                float: 'right',
                zIndex: 1100
              }}
            >
              Fermer le guide
            </Button>
          )}

          <div
            className="content-container"
            style={{
              transition: 'margin 0.2s'
            }}
          >
            <motion.div 
              className="welcome-card"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card bordered={false}>
                <Row align="middle" gutter={[24, 24]}>
                  <Col span={24}>
                    <Title level={3}>Synchronisation Google Play</Title>
                    <Paragraph type="secondary">
                      Connectez votre Google Play Console pour synchroniser automatiquement 
                      les données analytiques et de vente vers votre Google Cloud Storage.
                    </Paragraph>
                  </Col>
                </Row>
              </Card>
            </motion.div>

            {!hasActivePlan && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Alert
                  message="Abonnement Requis"
                  description={
                    <Space direction="vertical">
                      <Text>Vous avez besoin dun abonnement actif pour utiliser ce service.</Text>
                      <Button 
                        type="primary" 
                        href="/subscription-plans"
                        icon={<RocketOutlined />}
                        className="upgrade-button"
                      >
                        Mettre à niveau
                      </Button>
                    </Space>
                  }
                  type="warning"
                  showIcon
                  closable
                />
              </motion.div>
            )}

            <div className="steps-container">
              <Steps current={currentStep} onChange={setCurrentStep} className="progress-steps">
                {steps.map(item => (
                  <Step key={item.title} title={item.title} icon={item.icon} />
                ))}
              </Steps>

              <div className="step-content">
                {steps[currentStep].content}
              </div>

              <div className="step-navigation">
                {currentStep > 0 && (
                  <Button onClick={() => setCurrentStep(currentStep - 1)} className="nav-button prev-button">
                    Précédent
                  </Button>
                )}
                {currentStep < steps.length - 1 && (
                  <Button 
                    type="primary"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={(currentStep === 1 && (!bucketURI)) || !hasActivePlan}
                    className="nav-button next-button"
                  >
                    Suivant
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Content>

        <Footer className="dashboard-footer">
          <Text type="secondary">
            Synchronisation Google Play © {new Date().getFullYear()} - BigDeal Analytics
          </Text>
        </Footer>
      </Layout>
      
      {/* Guide sidebar : n'affiche que si guideVisible */}
      {guideVisible && (
        <Sider
          width={300}
          theme="light"
          className="guide-sider"
          style={{ 
            position: 'fixed', 
            right: 0, 
            top: 0, 
            height: '100vh',
            zIndex: 1000,
            boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.15)'
          }}
          trigger={null}
        >
          <Guide onClose={handleToggleGuide} />
        </Sider>
      )}

      {/* Bouton de bascule pour le guide sur mobile */}
      {isMobile && !guideVisible && (
        <Button
          type="primary"
          shape="circle"
          icon={<InfoCircleOutlined />}
          onClick={handleToggleGuide}
          className="mobile-guide-toggle"
          style={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            zIndex: 1000,
            width: 50,
            height: 50
          }}
        />
      )}
      {isMobile && guideVisible && (
        <Button
          type="primary"
          shape="circle"
          icon={<CloseOutlined />}
          onClick={handleToggleGuide}
          className="mobile-guide-toggle"
          style={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            zIndex: 1000,
            width: 50,
            height: 50
          }}
        />
      )}

      <Modal
        title="Aide avancée"
        open={isHelpVisible}
        onCancel={() => setIsHelpVisible(false)}
        footer={null}
        width={800}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title="Dépannage">
            <Paragraph>
              <Text strong>Problèmes courants :</Text>
            </Paragraph>
            <ul>
              <li>Erreurs de permission - Vérifiez les droits admin</li>
              <li>Accès au bucket - Vérifiez le rôle Storage Admin</li>
              <li>Retards de synchronisation - La première sync peut prendre plusieurs minutes</li>
            </ul>
          </Card>

          <Card title="Configuration avancée">
            <Paragraph>
              <Text strong>Paramètres personnalisés :</Text>
            </Paragraph>
            <ul>
              <li>Ajustez la fréquence de synchronisation</li>
              <li>Définissez des politiques de rétention</li>
              <li>Configurez des filtres personnalisés</li>
            </ul>
          </Card>

          <Button type="primary" block onClick={() => setIsHelpVisible(false)}>
            Compris !
          </Button>
        </Space>
      </Modal>
    </Layout>
  );
};

export default Dashboard;