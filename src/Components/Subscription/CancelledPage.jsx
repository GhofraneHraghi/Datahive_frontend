import { useNavigate } from 'react-router-dom';
import { 
  Result, 
  Button, 
  Layout, 
  Typography, 
  Card, 
  Space,
  Divider,
  Steps,
  notification,
  Avatar,
  Badge
} from 'antd';
import { 
  CloseCircleOutlined, 
  ShoppingCartOutlined,
  CreditCardOutlined,
  CustomerServiceOutlined,
  ArrowRightOutlined,
  SyncOutlined
} from '@ant-design/icons';
import Navbar from "../Dashboard/Navbar";
import { useState } from 'react';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Step } = Steps;

const CancelledPage = () => {
  const navigate = useNavigate();
  const [navbarCollapsed, setNavbarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRetryPayment = () => {
    setLoading(true);
    notification.info({
      message: 'Redirection en cours',
      description: 'Préparation de votre nouvelle session de paiement',
      placement: 'bottomRight'
    });
    
    // Simuler un chargement avant la redirection
    setTimeout(() => {
      navigate('/subscription-plans');
      setLoading(false);
    }, 1500);
  };

  return (
    <Layout style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)'
    }}>
      <Navbar onCollapse={setNavbarCollapsed} />
      
      <Layout style={{ 
        marginLeft: navbarCollapsed ? 80 : 250,
        transition: 'all 0.2s'
      }}>
        <Content style={{ 
          padding: '24px',
          margin: 0,
          minHeight: 280,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ 
            maxWidth: '800px', 
            width: '100%'
          }}>
            <Card
              bordered={false}
              style={{
                borderRadius: '16px',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
                padding: '24px',
                textAlign: 'center',
                color: 'white'
              }}>
                <Badge count={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />} offset={[-15, 15]}>
                  <Avatar 
                    size={64} 
                    icon={<ShoppingCartOutlined />} 
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(5px)'
                    }} 
                  />
                </Badge>
                <Title level={3} style={{ color: 'white', margin: '16px 0 0' }}>
                  Paiement annulé
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Vous avez annulé le processus de paiement
                </Text>
              </div>

              {/* Main Content */}
              <div style={{ padding: '24px' }}>
                <Result
                  status="warning"
                  title="Paiement non complété"
                  subTitle="Votre abonnement n'a pas été activé"
                  extra={[
                    <Button 
                      type="primary" 
                      key="retry"
                      onClick={handleRetryPayment}
                      icon={<SyncOutlined />}
                      loading={loading}
                      style={{
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
                      }}
                    >
                      {loading ? 'Chargement...' : 'Réessayer le paiement'}
                    </Button>,
                    <Button 
                      key="dashboard" 
                      onClick={() => navigate('/dashboard')}
                      style={{
                        borderRadius: '8px'
                      }}
                    >
                      Retour au tableau de bord
                    </Button>,
                  ]}
                />

                <Divider orientation="left">
                  <Text strong>Que souhaitez-vous faire ?</Text>
                </Divider>

                <Steps direction="vertical" current={-1}>
                  <Step
                    title="Réessayer le paiement"
                    description={
                      <Text type="secondary">
                        Complétez votre achat avec la même méthode de paiement
                      </Text>
                    }
                    icon={<CreditCardOutlined style={{ color: '#1890ff' }} />}
                  />
                  <Step
                    title="Changer de plan"
                    description={
                      <Text type="secondary">
                        Sélectionnez un autre plan dabonnement
                      </Text>
                    }
                    icon={<ShoppingCartOutlined style={{ color: '#722ed1' }} />}
                  />
                  <Step
                    title="Contacter le support"
                    description={
                      <Space direction="vertical" size={4}>
                        <Text type="secondary">
                          <CustomerServiceOutlined /> Assistance en ligne
                        </Text>
                        <Text type="secondary">
                          Disponible 24h/24, 7j/7
                        </Text>
                      </Space>
                    }
                    icon={<CustomerServiceOutlined style={{ color: '#13c2c2' }} />}
                  />
                </Steps>

                <Divider />

                <Card
                  title="Informations importantes"
                  bordered={false}
                  style={{
                    marginTop: '24px',
                    borderRadius: '12px',
                    border: '1px solid #ffe58f',
                    background: '#fffbe6'
                  }}
                >
                  <Space direction="vertical" size="middle">
                    <Text>
                      <ArrowRightOutlined style={{ color: '#faad14' }} /> Votre carte n'a pas été débitée
                    </Text>
                    <Text>
                      <ArrowRightOutlined style={{ color: '#faad14' }} /> Aucun abonnement n'a été créé
                    </Text>
                    <Text>
                      <ArrowRightOutlined style={{ color: '#faad14' }} /> Vous pouvez réessayer à tout moment
                    </Text>
                  </Space>
                </Card>
              </div>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CancelledPage;