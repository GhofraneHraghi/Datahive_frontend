import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Button, Spin, notification, Typography, Card, Layout } from 'antd';
import axios from 'axios';
import Navbar from "../Dashboard/Navbar";// Chemin vers votre composant Navbar

const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;

const SuccessPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [navbarCollapsed, setNavbarCollapsed] = useState(false);
  const sessionId = params.get('session_id');

  // Récupération de l'URL de base depuis les variables d'environnement Vite
  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    
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
          const userData = JSON.stringify(localStorage.getItem('user'));
          if (userData) {
            const updatedUserData = {
              ...JSON.parse(userData),
              subscription_id: response.data.subscription_id,
              has_active_subscription: true
            };
            localStorage.setItem('user', JSON.stringify(updatedUserData));
          }
        }
        
        setPaymentStatus(response.data.status);
        setSubscriptionDetails(response.data);
      } catch (error) {
        console.error('Verification error:', error);
        notification.error({
          message: 'Erreur de vérification',
          description: error.response?.data?.error || 'Impossible de vérifier le paiement'
        });
      } finally {
        setLoading(false);
      }
    };
    
    verifyPayment();
  }, [sessionId]);
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Vérification de votre paiement..." />
      </div>
    );
  }
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Intégration de la Navbar */}
      <Navbar 
        onCollapse={(collapsed) => setNavbarCollapsed(collapsed)} 
      />
      
      {/* Contenu principal avec marge dynamique */}
      <Layout 
        style={{ 
          marginLeft: navbarCollapsed ? 80 : 250,
          transition: 'margin-left 0.2s ease-out'
        }}
      >
        <Content style={{ 
          padding: '24px',
          background: '#fff',
          minHeight: 'calc(100vh - 64px)'
        }}>
          <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto',
            padding: '24px'
          }}>
            {paymentStatus === 'paid' ? (
              <Result
                status="success"
                title="Abonnement Activé avec Succès!"
                subTitle="Merci pour votre souscription. Votre abonnement est maintenant actif."
                extra={[
                  <Button
                    type="primary"
                    key="dashboard"
                    onClick={() => navigate('/dashboard')}
                  >
                    Accéder à votre Tableau de Bord
                  </Button>
                ]}
              >
                {subscriptionDetails && (
                  <Card style={{ marginTop: 24 }}>
                    <Title level={4}>Détails de votre abonnement</Title>
                    <Paragraph>
                      <Text strong>Identifiant:</Text> {subscriptionDetails.subscription_id}
                    </Paragraph>
                    <Paragraph>
                      <Text strong>Montant:</Text> {subscriptionDetails.amount}€
                    </Paragraph>
                    <Paragraph>
                      <Text strong>Durée:</Text> {subscriptionDetails.duration} jours
                    </Paragraph>
                    <Paragraph>
                      <Text strong>Email de facturation:</Text> {subscriptionDetails.customer_email}
                    </Paragraph>
                    <Paragraph>
                      <Text strong>Date dexpiration:</Text> {
                        new Date(new Date().getTime() + (subscriptionDetails.duration * 24 * 60 * 60 * 1000))
                          .toLocaleDateString('fr-FR', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                      }
                    </Paragraph>
                  </Card>
                )}
              </Result>
            ) : (
              <Result
                status="warning"
                title="Paiement en Cours de Vérification"
                subTitle="Votre paiement est en cours de traitement. Veuillez patienter quelques instants."
                extra={[
                  <Button
                    key="refresh"
                    type="primary"
                    onClick={() => window.location.reload()}
                  >
                    Actualiser
                  </Button>,
                  <Button
                    key="dashboard"
                    onClick={() => navigate('/dashboard')}
                  >
                    Retourner au Tableau de Bord
                  </Button>
                ]}
              />
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SuccessPage;