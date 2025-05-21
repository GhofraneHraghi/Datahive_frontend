import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Result, 
  Button, 
  Spin, 
  notification, 
  Typography, 
  Layout, 
  Descriptions, 
  Tag, 
  Card, 
  Divider,
  Steps,
  Space,
  Badge,
  Avatar,
  Statistic,
  Progress,
  Collapse,
  theme,
  Row,
  Col,
  Timeline
} from 'antd';
import { 
  CheckCircleOutlined, 
  LoadingOutlined, 
  ClockCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  DollarOutlined,
  ArrowLeftOutlined,
  PrinterOutlined,
  SyncOutlined,
  RocketOutlined,
  LikeOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import Navbar from "../Dashboard/Navbar";
// Extraction correcte des composants de Layout
const { Header, Footer, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { useToken } = theme;


const SuccessPage = () => {
  const { token } = useToken();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [navbarCollapsed, setNavbarCollapsed] = useState(false);
  const [userData, setUserData] = useState(null);
  const [activePanel, setActivePanel] = useState(['1']);
  const sessionId = params.get('session_id');

  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  
  useEffect(() => {
    const authToken = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('user');
    
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error('Erreur de parsing des données utilisateur:', error);
      }
    }
    
    const verifyPayment = async () => {
      if (!sessionId) {
        setLoading(false);
        return notification.error({
          message: 'Session invalide',
          description: 'Aucun identifiant de session trouvé'
        });
      }
      
      try {
        const response = await axios.get(
          `${VITE_BACKEND_BASE_URL}/api/verify-session?session_id=${sessionId}`,
          { 
            headers: { 
              Authorization: `Bearer ${authToken}`
            }
          }
        );
        
        if (response.data.status === 'paid') {
          setPaymentStatus('paid');
          
          const customerData = response.data.customer || {};
          const planData = response.data.plan || {};
          const subscriptionData = response.data.subscription || {};
          const paymentData = response.data.payment || {};
          
          let startDate, endDate;
          
          if (subscriptionData.start_date) {
            startDate = new Date(subscriptionData.start_date);
          } else {
            startDate = new Date();
          }
          
          if (subscriptionData.end_date) {
            endDate = new Date(subscriptionData.end_date);
          } else {
            endDate = new Date();
            const durationDays = planData.duration_days || 30;
            endDate.setDate(startDate.getDate() + parseInt(durationDays));
          }
          
          const formattedData = {
            client: {
              id: customerData.id || userData?.id || 'N/A',
              first_name: customerData.first_name || (userData?.name?.split(' ')[0]) || 'N/A',
              last_name: customerData.last_name || (userData?.name?.split(' ').slice(1).join(' ')) || 'N/A',
              email: customerData.email || userData?.email || 'N/A'
            },
            subscription: {
              id: subscriptionData.id || 'N/A',
              start_date: startDate.toISOString().split('T')[0],
              end_date: endDate.toISOString().split('T')[0],
              status: subscriptionData.status || 'active',
              stripe_session_id: sessionId
            },
            plan: {
              id: planData.id || 'N/A',
              name: planData.name || 'Plan Standard',
              quota_limit: planData.quota_limit || 0,
              duration_days: planData.duration_days || 30,
              price: (paymentData.amount || planData.price || '0.00').toString()
            }
          };
          
          setSubscriptionDetails(formattedData);
          
          try {
            const userInfoResponse = await axios.get(
              `${VITE_BACKEND_BASE_URL}/api/user-info`, 
              { 
                headers: { 
                  Authorization: `Bearer ${authToken}`
                }
              }
            );
            
            localStorage.setItem('user', JSON.stringify(userInfoResponse.data));
            setUserData(userInfoResponse.data);
          } catch (userInfoError) {
            console.error('Erreur de récupération des infos utilisateur:', userInfoError);
          }
        } else {
          setPaymentStatus('pending');
        }
      } catch (error) {
        console.error('Erreur de vérification:', error);
        notification.error({
          message: 'Erreur de vérification',
          description: error.response?.data?.error || 'Impossible de vérifier le paiement'
        });
        setPaymentStatus('error');
      } finally {
        setLoading(false);
      }
    };
    
    verifyPayment();
  }, [sessionId]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const getStatusTag = (status) => {
    const statusMap = {
      'active': { color: 'green', text: 'Actif', icon: <CheckCircleOutlined /> },
      'pending': { color: 'orange', text: 'En attente', icon: <ClockCircleOutlined /> },
      'cancelled': { color: 'red', text: 'Annulé', icon: <ClockCircleOutlined /> },
      'expired': { color: 'gray', text: 'Expiré', icon: <ClockCircleOutlined /> }
    };
    
    const statusInfo = statusMap[status] || { color: 'blue', text: status, icon: null };
    
    return (
      <Tag 
        icon={statusInfo.icon} 
        color={statusInfo.color}
        style={{ 
          borderRadius: 20,
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontWeight: 'bold'
        }}
      >
        {statusInfo.text}
      </Tag>
    );
  };
  
  const calculateProgress = () => {
    if (!subscriptionDetails) return 0;
    
    const start = new Date(subscriptionDetails.subscription.start_date).getTime();
    const end = new Date(subscriptionDetails.subscription.end_date).getTime();
    const now = new Date().getTime();
    
    if (now >= end) return 100;
    if (now <= start) return 0;
    
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const getBenefitIcon = (index) => {
    const icons = [
      <RocketOutlined style={{fontSize: 24, color: token.colorPrimary}} />,
      <LikeOutlined style={{fontSize: 24, color: token.colorPrimary}} />,
      <TrophyOutlined style={{fontSize: 24, color: token.colorPrimary}} />
    ];
    return icons[index % icons.length];
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 16,
        background: token.colorBgLayout
      }}>
        <Card
          style={{
            borderRadius: 16,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            padding: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            width: 300
          }}
        >
          <Spin 
            indicator={<LoadingOutlined style={{ fontSize: 48, color: token.colorPrimary }} spin />} 
          />
          <Text strong style={{ fontSize: 18, marginTop: 24 }}>Vérification de votre abonnement...</Text>
          <Text type="secondary" style={{ textAlign: 'center', marginTop: 8 }}>
            Merci de patienter pendant que nous traitons votre paiement
          </Text>
        </Card>
      </div>
    );
  }
  
  return (
    <Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
      <Navbar onCollapse={(collapsed) => setNavbarCollapsed(collapsed)} />
      
      <Layout 
        style={{ 
          marginLeft: navbarCollapsed ? 80 : 250,
          transition: 'margin-left 0.2s ease-out',
          background: token.colorBgLayout
        }}
      >
        <Content style={{ 
          padding: '32px',
          minHeight: 'calc(100vh - 64px)'
        }}>
          {paymentStatus === 'paid' && subscriptionDetails ? (
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              {/* Header with back button */}
              <Space style={{ marginBottom: 24 }}>
                <Button 
                  type="default" 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => navigate('/dashboard')}
                  size="large"
                  style={{
                    borderRadius: 8,
                    boxShadow: '0 2px 0 rgba(0,0,0,0.02)'
                  }}
                >
                  Retour au tableau de bord
                </Button>
              </Space>
              
              {/* Success Card */}
              <Card
                bordered={false}
                style={{ 
                  borderRadius: 16,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  marginBottom: 32,
                  overflow: 'hidden'
                }}
                bodyStyle={{ padding: 0 }}
              >
                <div style={{
                  background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
                  padding: '28px 32px',
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                  color: '#fff'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 16,
                  }}>
                    <Badge 
                      count={<CheckCircleOutlined style={{ color: '#fff', fontSize: 24 }} />}
                      offset={[-10, 10]}
                      style={{ backgroundColor: 'transparent' }}
                    >
                      <Avatar 
                        size={72} 
                        icon={<UserOutlined />} 
                        style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          color: '#fff'
                        }} 
                      />
                    </Badge>
                    <div>
                      <Title level={2} style={{ margin: 0, color: '#fff' }}>
                        Merci pour votre abonnement !
                      </Title>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 16 }}>
                        Votre paiement a été confirmé avec succès
                      </Text>
                    </div>
                  </div>
                </div>
                
                <div style={{ padding: '32px' }}>
                  {/* Progress and Stats */}
                  <Row gutter={[32, 32]}>
                    <Col xs={24} md={14}>
                      <Card 
                        bordered={false} 
                        style={{ 
                          borderRadius: 12,
                          height: '100%',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        }}
                      >
                        <div>
                          <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
                            <CalendarOutlined style={{ marginRight: 8 }} />
                            Progression de labonnement
                          </Text>
                          <Progress 
                            percent={calculateProgress()} 
                            strokeColor={{
                              '0%': token.colorPrimary,
                              '100%': token.colorPrimaryActive,
                            }}
                            strokeWidth={12}
                            status="active"
                          />
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            marginTop: 16
                          }}>
                            <div>
                              <Text type="secondary">Début</Text>
                              <Text strong style={{ display: 'block' }}>
                                {formatDate(subscriptionDetails.subscription.start_date)}
                              </Text>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <Text type="secondary">Durée</Text>
                              <Text strong style={{ display: 'block' }}>
                                {subscriptionDetails.plan.duration_days} jours
                              </Text>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <Text type="secondary">Fin</Text>
                              <Text strong style={{ display: 'block' }}>
                                {formatDate(subscriptionDetails.subscription.end_date)}
                              </Text>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                    
                    <Col xs={24} md={10}>
                      <Card 
                        bordered={false} 
                        style={{ 
                          borderRadius: 12,
                          height: '100%',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        }}
                      >
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                          <Statistic 
                            title={<Text strong>Plan</Text>}
                            value={subscriptionDetails.plan.name} 
                            prefix={<FileTextOutlined style={{ color: token.colorPrimary }} />}
                            valueStyle={{ color: token.colorTextHeading, fontWeight: 'bold' }}
                          />
                          
                          <div>
                            <Text type="secondary">Statut</Text>
                            <div style={{ marginTop: 8 }}>
                              {getStatusTag(subscriptionDetails.subscription.status)}
                            </div>
                          </div>
                          
                          <Statistic 
                            title={<Text strong>Montant</Text>}
                            prefix={<DollarOutlined style={{ color: token.colorSuccess }} />}
                            value={parseFloat(subscriptionDetails.plan.price).toFixed(2)}
                            suffix="€"
                            valueStyle={{ color: token.colorSuccess, fontWeight: 'bold' }}
                          />
                        </Space>
                      </Card>
                    </Col>
                  </Row>
                  
            <Row gutter={[32, 32]} style={{ marginTop: 32 }}>
  <Col xs={24} md={16}>
    <Card 
      title={<Title level={4} style={{ margin: 0 }}>Détails de labonnement</Title>}
      bordered={false} 
      style={{ 
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}
    >
      {/* Nouveau design empilé */}
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {/* Carte Client */}
        <Card
          bordered={false}
          style={{ background: token.colorFillAlter }}
          bodyStyle={{ padding: '16px 24px' }}
        >
          <Space size="middle" align="start">
            <Avatar 
              size={40} 
              icon={<UserOutlined />} 
              style={{ 
                backgroundColor: token.colorPrimaryBg,
                color: token.colorPrimary
              }} 
            />
            <Space direction="vertical" size={4}>
              <Text strong style={{ fontSize: 16 }}>
                {subscriptionDetails.client.first_name} {subscriptionDetails.client.last_name}
              </Text>
              <Text type="secondary">{subscriptionDetails.client.email}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                ID: {subscriptionDetails.client.id}
              </Text>
            </Space>
          </Space>
        </Card>

        {/* Carte Période */}
        <Card
          bordered={false}
          style={{ background: token.colorFillAlter }}
          bodyStyle={{ padding: '16px 24px' }}
        >
          <Space size="middle" align="start">
            <Avatar 
              size={40} 
              icon={<CalendarOutlined />} 
              style={{ 
                backgroundColor: token.colorPrimaryBg,
                color: token.colorPrimary
              }} 
            />
            <Space direction="vertical" size={4}>
              <Text strong style={{ fontSize: 16 }}>Période dabonnement</Text>
              <Space size={8}>
                <Text>{formatDate(subscriptionDetails.subscription.start_date)}</Text>
                <Text type="secondary">à</Text>
                <Text>{formatDate(subscriptionDetails.subscription.end_date)}</Text>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Durée: {subscriptionDetails.plan.duration_days} jours
              </Text>
            </Space>
          </Space>
        </Card>

        {/* Carte Plan */}
        <Card
          bordered={false}
          style={{ background: token.colorFillAlter }}
          bodyStyle={{ padding: '16px 24px' }}
        >
          <Space size="middle" align="start">
            <Avatar 
              size={40} 
              icon={<FileTextOutlined />} 
              style={{ 
                backgroundColor: token.colorPrimaryBg,
                color: token.colorPrimary
              }} 
            />
            <Space direction="vertical" size={4}>
              <Text strong style={{ fontSize: 16 }}>Plan souscrit</Text>
              <Text>{subscriptionDetails.plan.name}</Text>
              <Space size={16}>
                <Text type="secondary">
                  Quota: {subscriptionDetails.plan.quota_limit} unités
                </Text>
                <Text type="secondary">
                  Prix: {parseFloat(subscriptionDetails.plan.price).toFixed(2)}€
                </Text>
              </Space>
            </Space>
          </Space>
        </Card>

        {/* Carte Paiement */}
        <Card
          bordered={false}
          style={{ background: token.colorFillAlter }}
          bodyStyle={{ padding: '16px 24px' }}
        >
          <Space size="middle" align="start">
            <Avatar 
              size={40} 
              icon={<CreditCardOutlined />} 
              style={{ 
                backgroundColor: token.colorPrimaryBg,
                color: token.colorPrimary
              }} 
            />
            <Space direction="vertical" size={4}>
              <Text strong style={{ fontSize: 16 }}>Méthode de paiement</Text>
              <Text>Carte bancaire (Stripe)</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Référence: <Text copyable>{subscriptionDetails.subscription.stripe_session_id}</Text>
              </Text>
            </Space>
          </Space>
        </Card>
      </Space>
      
      <Divider style={{ margin: '24px 0' }} />
      
      <div>
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
          Étapes dactivation
        </Text>
        <Timeline
          items={[
            {
              color: 'green',
              children: (
                <>
                  <Text strong>Paiement confirmé</Text>
                  <br />
                  <Text type="secondary">Transaction complétée avec succès</Text>
                </>
              )
            },
            {
              color: 'green',
              children: (
                <>
                  <Text strong>Compte activé</Text>
                  <br />
                  <Text type="secondary">Votre abonnement est maintenant actif</Text>
                </>
              )
            },
            {
              color: 'blue',
              children: (
                <>
                  <Text strong>Profitez de nos services</Text>
                  <br />
                  <Text type="secondary">Explorez toutes les fonctionnalités disponibles</Text>
                </>
              )
            }
          ]}
        />
      </div>
    </Card>
  </Col>
  
  <Col xs={24} md={8}>
    {/* Votre contenu supplémentaire ici */}
  </Col>
</Row>
                  
                  {/* Actions */}
                  <div style={{ 
                    marginTop: 32,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 16
                  }}>
                    <Button 
                      type="primary" 
                      icon={<PrinterOutlined />}
                      onClick={() => window.print()}
                      size="large"
                      style={{
                        borderRadius: 8,
                        height: 48,
                        paddingLeft: 24,
                        paddingRight: 24
                      }}
                    >
                      Imprimer le reçu
                    </Button>
                    <Button 
                      type="default"
                      onClick={() => navigate('/dashboard')}
                      size="large"
                      style={{
                        borderRadius: 8,
                        height: 48,
                        paddingLeft: 24,
                        paddingRight: 24
                      }}
                    >
                      Accéder au tableau de bord
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ) : paymentStatus === 'error' ? (
            <div style={{ maxWidth: 800, margin: '40px auto' }}>
              <Card
                bordered={false}
                style={{ 
                  borderRadius: 16,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  overflow: 'hidden'
                }}
              >
                <Result
                  status="error"
                  title="Erreur de Vérification"
                  subTitle="Nous n'avons pas pu vérifier votre abonnement. Veuillez contacter notre support."
                  extra={[
                    <Button 
                      key="retry" 
                      type="primary" 
                      icon={<SyncOutlined />}
                      onClick={() => window.location.reload()}
                      size="large"
                      style={{
                        borderRadius: 8,
                        height: 48
                      }}
                    >
                      Réessayer
                    </Button>,
                    <Button 
                      key="dashboard" 
                      onClick={() => navigate('/dashboard')}
                      size="large"
                      style={{
                        borderRadius: 8,
                        height: 48
                      }}
                    >
                      Retourner au Tableau de Bord
                    </Button>
                  ]}
                />
              </Card>
            </div>
          ) : (
            <div style={{ maxWidth: 800, margin: '40px auto' }}>
              <Card
                bordered={false}
                style={{ 
                  borderRadius: 16,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  overflow: 'hidden'
                }}
              >
                <Result
                  icon={<ClockCircleOutlined style={{ color: token.colorWarning }} />}
                  title="Paiement en Cours de Vérification"
                  subTitle="Votre abonnement est en cours de traitement. Veuillez patienter quelques instants."
                  extra={[
                    <Button
                      key="refresh"
                      type="primary"
                      icon={<SyncOutlined />}
                      onClick={() => window.location.reload()}
                      size="large"
                      style={{
                        borderRadius: 8,
                        height: 48
                      }}
                    >
                      Actualiser
                    </Button>,
                    <Button
                      key="dashboard"
                      onClick={() => navigate('/dashboard')}
                      size="large"
                      style={{
                        borderRadius: 8,
                        height: 48
                      }}
                    >
                      Retourner au Tableau de Bord
                    </Button>
                  ]}
                />
              </Card>
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default SuccessPage;