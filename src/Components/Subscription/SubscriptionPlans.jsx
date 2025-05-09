import { useState, useEffect } from "react";
import axios from "axios";
import { Layout, Typography, Card, Row, Col, Spin, notification, Button, Tooltip, Alert } from "antd";
import Navbar from "../Dashboard/Navbar";
import "./SubscriptionPlans.css";

const { Content } = Layout;
const { Title } = Typography;

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [navbarCollapsed, setNavbarCollapsed] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // Récupération de l'URL de base depuis les variables d'environnement Vite
  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const authToken = localStorage.getItem("token");
        
        const [plansResponse, subscriptionResponse] = await Promise.all([
          axios.get(`${VITE_BACKEND_BASE_URL}/api/plans`, {
            headers: { Authorization: `Bearer ${authToken}` }
          }),
          axios.get(`${VITE_BACKEND_BASE_URL}/api/check-subscription`, {
            headers: { Authorization: `Bearer ${authToken}` }
          })
        ]);
  
        console.log("Réponse de l'API subscription:", subscriptionResponse.data);
        
        setPlans(plansResponse.data);
        setHasActiveSubscription(subscriptionResponse.data.hasActiveSubscription);
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
        notification.error({ 
          message: "Erreur",
          description: "Impossible de charger les données"
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  const handleChoosePlan = async (plan) => {
    if (hasActiveSubscription) return;
    
    setRedirecting(true);
    try {
      const authToken = localStorage.getItem("token");
      
      const response = await axios.post(
        `${VITE_BACKEND_BASE_URL}/api/create-checkout-session`,
        { planId: plan.id },
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      window.location.href = response.data.url;
    } catch (error) {
      notification.error({
        message: "Erreur",
        description: error.response?.data?.message || "Échec du paiement"
      });
    } finally {
      setRedirecting(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navbar onCollapse={setNavbarCollapsed} />
      
      <Layout style={{ marginLeft: navbarCollapsed ? 80 : 250 }}>
        <Content style={{ margin: "24px 16px 0" }}>
          <div className="subscription-plans-container">
            <Title level={2}>Choisissez votre Abonnement</Title>
            
             {/* Ajoutez une condition pour afficher l'état actuel */}
          <div style={{ marginBottom: 20 }}>
          {hasActiveSubscription ? (
            <Alert
              message="Vous avez déjà un abonnement actif"
              description="Vous ne pouvez souscrire qu'à un seul abonnement à la fois"
              type="warning"
              showIcon
            />
          ) : (
            <Alert
              message="Aucun abonnement actif"
              description="Choisissez un plan ci-dessous pour vous abonner"
              type="info"
              showIcon
            />
          )}
        </div>

            {loading ? (
              <Spin size="large" style={{ display: "flex", justifyContent: "center", height: "50vh" }} />
            ) : (
              <Row gutter={[16, 16]} justify="center">
                {plans.map((plan) => (
                  <Col key={plan.id} xs={24} sm={12} md={8} lg={6}>
                    <Card
                      title={<Title level={4}>{plan.name}</Title>}
                      className="subscription-card"
                    >
                      <Title level={3}>{plan.price}€/mois</Title>
                      <ul>
                        <li>Durée: {plan.duration_days} jours</li>
                        <li>Quota: {plan.quota_limit} membres</li>
                      </ul>
                      
                      <Tooltip 
                        title={hasActiveSubscription ? "Annulez votre abonnement actif pour en choisir un nouveau" : null}
                      >
                        <Button
                          type="primary"
                          loading={redirecting}
                          onClick={() => handleChoosePlan(plan)}
                          disabled={hasActiveSubscription}
                          style={{
                            opacity: hasActiveSubscription ? 0.6 : 1,
                            cursor: hasActiveSubscription ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {redirecting ? 'Redirection...' : 'Choisir Plan'}
                        </Button>
                      </Tooltip>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SubscriptionPlans;