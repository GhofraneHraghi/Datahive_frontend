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
  Space,
  Row,
  Col,
  Steps,
  Statistic,
  Alert,
  Badge,
  Avatar
} from 'antd';
import { 
  CheckCircleOutlined, 
  LoadingOutlined, 
  ClockCircleOutlined,
  ArrowLeftOutlined,
  PrinterOutlined,
  SyncOutlined,
  UserOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  SafetyOutlined,
  GiftOutlined
} from '@ant-design/icons';
import Navbar from "../Dashboard/Navbar";

const { Content } = Layout;
const { Title, Text } = Typography;

const SuccessPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [navbarCollapsed, setNavbarCollapsed] = useState(false);
  const [userData, setUserData] = useState(null);
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
      'active': { color: 'success', text: 'Actif', icon: <CheckCircleOutlined /> },
      'pending': { color: 'warning', text: 'En attente', icon: <ClockCircleOutlined /> },
      'cancelled': { color: 'error', text: 'Annulé', icon: <ClockCircleOutlined /> },
      'expired': { color: 'default', text: 'Expiré', icon: <ClockCircleOutlined /> }
    };
    
    const statusInfo = statusMap[status] || { color: 'default', text: status, icon: null };
    
    return (
      <Tag color={statusInfo.color} icon={statusInfo.icon}>
        {statusInfo.text}
      </Tag>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5'
      }}>
        <Card 
          style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <Spin 
            indicator={<LoadingOutlined style={{ fontSize: 32, color: '#1890ff' }} spin />} 
          />
          <Title level={4} style={{ marginTop: 24, marginBottom: 8 }}>
            Vérification en cours...
          </Title>
          <Text type="secondary">
            Nous vérifions votre paiement, veuillez patienter
          </Text>
        </Card>
      </div>
    );
  }
  
  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navbar onCollapse={(collapsed) => setNavbarCollapsed(collapsed)} />
      
      <Layout 
        style={{ 
          marginLeft: navbarCollapsed ? 80 : 250,
          transition: 'margin-left 0.2s ease-out',
          backgroundColor: '#f5f5f5'
        }}
      >
        <Content style={{ padding: '24px' }}>
          {paymentStatus === 'paid' && subscriptionDetails ? (
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
              {/* En-tête avec bouton retour */}
              <div style={{ marginBottom: 24 }}>
                <Button 
                  type="default" 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => navigate('/dashboard')}
                  size="large"
                >
                  Retour au tableau de bord
                </Button>
              </div>
              
              {/* Message de succès principal */}
              <Card 
                style={{ 
                  marginBottom: 24, 
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <Result
                  status="success"
                  title={
                    <Title level={2} style={{ color: '#52c41a', marginBottom: 8 }}>
                      🎉 Abonnement Activé Avec Succès!
                    </Title>
                  }
                  subTitle={
                    <Text style={{ fontSize: '16px' }}>
                      Votre abonnement a été activé avec succès. Vous pouvez maintenant profiter de tous nos services premium.
                    </Text>
                  }
                />
              </Card>

              {/* Étapes de confirmation */}
              <Card 
                title={
                  <Space>
                    <SafetyOutlined />
                    <span>Processus de confirmation</span>
                  </Space>
                }
                style={{ 
                  marginBottom: 24, 
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
              >
                <Steps
                  current={2}
                  items={[
                    {
                      title: 'Paiement',
                      description: 'Transaction effectuée',
                      status: 'finish',
                      icon: <CreditCardOutlined />
                    },
                    {
                      title: 'Vérification',
                      description: 'Paiement confirmé',
                      status: 'finish',
                      icon: <CheckCircleOutlined />
                    },
                    {
                      title: 'Activation',
                      description: 'Compte activé',
                      status: 'finish',
                      icon: <GiftOutlined />
                    }
                  ]}
                />
              </Card>

              <Row gutter={[24, 24]}>
                {/* Informations du client */}
                <Col xs={24} lg={12}>
                  <Card 
                    title={
                      <Space>
                        <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                        <span>Informations client</span>
                      </Space>
                    }
                    style={{ 
                      height: '100%',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                  >
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Nom complet">
                        <Text strong>
                          {subscriptionDetails.client.first_name} {subscriptionDetails.client.last_name}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        <Text copyable>{subscriptionDetails.client.email}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="ID Client">
                        <Text code>{subscriptionDetails.client.id}</Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>

                {/* Détails du plan */}
                <Col xs={24} lg={12}>
                  <Card 
                    title={
                      <Space>
                        <Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#52c41a' }} />
                        <span>Détails du plan</span>
                      </Space>
                    }
                    style={{ 
                      height: '100%',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text type="secondary">Plan souscrit</Text>
                        <Title level={4} style={{ margin: '4px 0' }}>
                          {subscriptionDetails.plan.name}
                        </Title>
                      </div>
                      
                      <Row gutter={16}>
                        <Col span={12}>
                          <Statistic 
                            title="Prix" 
                            value={parseFloat(subscriptionDetails.plan.price).toFixed(2)} 
                            suffix="€"
                            valueStyle={{ color: '#52c41a' }}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic 
                            title="Quota" 
                            value={subscriptionDetails.plan.quota_limit} 
                            suffix="unités"
                          />
                        </Col>
                      </Row>
                    </Space>
                  </Card>
                </Col>

                {/* Période d'abonnement */}
                <Col xs={24} lg={12}>
                  <Card 
                    title={
                      <Space>
                        <Avatar icon={<CalendarOutlined />} style={{ backgroundColor: '#faad14' }} />
                        <span>Période dabonnement</span>
                      </Space>
                    }
                    style={{ 
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                  >
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Date de début">
                        <Text strong>{formatDate(subscriptionDetails.subscription.start_date)}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Date de fin">
                        <Text strong>{formatDate(subscriptionDetails.subscription.end_date)}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Durée">
                        <Badge count={subscriptionDetails.plan.duration_days} showZero color="#1890ff" />
                        <Text style={{ marginLeft: 8 }}>jours</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Statut">
                        {getStatusTag(subscriptionDetails.subscription.status)}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>

                {/* Informations de paiement */}
                <Col xs={24} lg={12}>
                  <Card 
                    title={
                      <Space>
                        <Avatar icon={<CreditCardOutlined />} style={{ backgroundColor: '#13c2c2' }} />
                        <span>Informations de paiement</span>
                      </Space>
                    }
                    style={{ 
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                  >
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Méthode">
                        <Text>Carte bancaire (Stripe)</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Référence">
                        <Text copyable style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                          {subscriptionDetails.subscription.stripe_session_id}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Montant">
                        <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                          {parseFloat(subscriptionDetails.plan.price).toFixed(2)} €
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>
              
              <Divider />

              {/* Boutons d'action */}
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <Space size="large">
                  <Button 
                    type="primary" 
                    icon={<PrinterOutlined />}
                    onClick={() => window.print()}
                    size="large"
                  >
                    Imprimer le reçu
                  </Button>
                  <Button 
                    size="large"
                    onClick={() => navigate('/dashboard')}
                  >
                    Accéder au tableau de bord
                  </Button>
                </Space>
              </div>
            </div>
          ) : paymentStatus === 'error' ? (
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
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
                    >
                      Réessayer
                    </Button>,
                    <Button 
                      key="dashboard" 
                      onClick={() => navigate('/dashboard')}
                      size="large"
                    >
                      Retourner au Tableau de Bord
                    </Button>
                  ]}
                />
              </Card>
            </div>
          ) : (
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <Result
                  icon={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                  title="Paiement en Cours de Vérification"
                  subTitle="Votre abonnement est en cours de traitement. Veuillez patienter quelques instants."
                  extra={[
                    <Button
                      key="refresh"
                      type="primary"
                      icon={<SyncOutlined />}
                      onClick={() => window.location.reload()}
                      size="large"
                    >
                      Actualiser
                    </Button>,
                    <Button
                      key="dashboard"
                      onClick={() => navigate('/dashboard')}
                      size="large"
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