import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Layout, Typography, Card, Button, Row, Col, Spin, notification, Space } from "antd";
import { UserAddOutlined, EditOutlined, CloseOutlined, ArrowUpOutlined } from "@ant-design/icons";
import NavbarUser from "../Components/NavbarUser";

const { Content } = Layout;
const { Title, Text } = Typography;

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const location = useLocation();
  const isChangingSubscription = location.state?.isChangingSubscription || false;
  const currentSubscriptionType = location.state?.currentSubscriptionType || null;
  console.log("currentSubscriptionType:", currentSubscriptionType);


  // Gestion du collapse de la barre latérale
  const handleSiderCollapse = (collapsed) => {
    setSiderCollapsed(collapsed);
  };

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3001/api/plans");
        setPlans(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des abonnements :", error);
        notification.error({ message: "Une erreur s'est produite lors du chargement des abonnements." });
      } finally {
        setLoading(false);
      }
    };

   // Dans votre fonction fetchUserSubscription
const fetchUserSubscription = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.error("Token non trouvé dans localStorage.");
    return;
  }

  try {
    // Afficher le token pour débogage (à supprimer en production)
    console.log("Token utilisé:", token.substring(0, 10) + "...");
    
    const response = await axios.get("http://localhost:3001/api/user-subscription", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log("Réponse complète:", response);
    
    if (response.data) {
      setUserSubscription(response.data);
      console.log("Abonnement de l'utilisateur récupéré:", response.data);
    } else {
      console.warn("Réponse reçue mais pas de données d'abonnement");
      setUserSubscription(null);
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'abonnement utilisateur:", error);
    
    if (error.response) {
      // Afficher plus de détails sur l'erreur
      console.error("Détails de l'erreur:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Si le token est expiré ou invalide
      if (error.response.status === 401) {
        console.warn("Token invalide ou expiré. Déconnexion...");
        // Vous pourriez rediriger vers la page de connexion ou gérer autrement
        // localStorage.removeItem("authToken");
        // window.location.href = "/login";
      }
    }
    
    // Définir explicitement userSubscription comme null en cas d'erreur
    setUserSubscription(null);
  }
};

    fetchPlans();
    fetchUserSubscription();
  }, []);

  // Filtrer les plans pour exclure le plan Basic si l'utilisateur change son abonnement
  const filteredPlans = isChangingSubscription
    ? plans.filter((plan) => plan.title.toLowerCase() !== "basic")
    : plans;

  // Fonction pour choisir un abonnement
  const handleChoosePlan = async (plan) => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      notification.warning({ message: "Vous devez être connecté pour choisir un abonnement." });
      window.location.href = "/login";
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/api/create-subscription",
        {
          userId: userId,
          planId: plan.id,
          planType: plan.title.toLowerCase(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUserSubscription(response.data);
      notification.success({ message: "Abonnement créé avec succès !" });
    } catch (error) {
      console.error("Erreur lors de la création de l'abonnement :", error);
      if (error.response?.data?.message) {
        notification.error({ message: error.response.data.message });
      } else {
        notification.error({ message: "Une erreur s'est produite lors de la création de l'abonnement." });
      }
    }
  };

  // Fonction pour modifier un abonnement
  const handleModifyPlan = async (plan) => {
    console.log("Modifier l'abonnement :", plan);
    // Logique pour modifier l'abonnement
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      notification.warning({ message: "Vous devez être connecté pour modifier un abonnement." });
      return;
    }

    try {
      // Exemple d'appel API pour modifier un abonnement
      const response = await axios.put(
        "http://localhost:3001/api/modify-subscription",
        {
          userId: userId,
          subscriptionId: userSubscription.id,
          // Autres informations à modifier
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      notification.success({ message: "Abonnement modifié avec succès !" });
      // Mettre à jour l'état de l'abonnement si nécessaire
      setUserSubscription(response.data);
    } catch (error) {
      console.error("Erreur lors de la modification de l'abonnement :", error);
      notification.error({ message: "Une erreur s'est produite lors de la modification de l'abonnement." });
    }
  };

  // Fonction pour annuler un abonnement
  const handleCancelPlan = async () => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    if (!token || !userId || !userSubscription) {
      notification.warning({ message: "Vous devez être connecté et avoir un abonnement actif." });
      return;
    }

    try {
      await axios.put(
        "http://localhost:3001/api/cancel-subscription",
        {
          subscriptionId: userSubscription.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      notification.success({ message: "Abonnement annulé avec succès !" });
      // Mettre à jour l'état pour refléter l'annulation
      setUserSubscription(null);
    } catch (error) {
      console.error("Erreur lors de l'annulation de l'abonnement :", error);
      notification.error({ message: "Une erreur s'est produite lors de l'annulation de l'abonnement." });
    }
  };

  // Fonction pour mettre à niveau un abonnement
  const handleUpgradePlan = async (plan) => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    if (!token || !userId || !userSubscription) {
      notification.warning({ message: "Vous devez être connecté et avoir un abonnement actif." });
      return;
    }

    try {
      const response = await axios.put(
        "http://localhost:3001/api/upgrade-subscription",
        {
          userId: userId,
          currentSubscriptionId: userSubscription.id,
          newPlanId: plan.id,
          newPlanType: plan.title.toLowerCase(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUserSubscription(response.data);
      notification.success({ message: "Abonnement mis à niveau avec succès !" });
    } catch (error) {
      console.error("Erreur lors de la mise à niveau de l'abonnement :", error);
      notification.error({ message: "Une erreur s'est produite lors de la mise à niveau de l'abonnement." });
    }
  };

  // Fonction pour déterminer les actions à afficher pour chaque carte d'abonnement
  const getPlanActions = (plan) => {
    const currentPlanType = plan.title.toLowerCase().trim();
  
    // Si l'utilisateur n'a pas d'abonnement (currentSubscriptionType est null), afficher "Choisir cet Abonnement"
    if (!currentSubscriptionType) {
      return [
        <Button
          key="choose"
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => handleChoosePlan(plan)}
          style={{ width: "100%" }}
        >
          Choisir cet Abonnement
        </Button>,
      ];
    }
  
    // Si c'est le plan actuel de l'utilisateur, afficher les boutons "Modifier" et "Annuler"
    if (currentPlanType === currentSubscriptionType.toLowerCase()) {
      return [
        <Button
          key="modify"
          type="primary"
          icon={<EditOutlined />}
          onClick={() => handleModifyPlan(plan)}
          style={{ width: "100%", marginBottom: 8 }}
        >
          Modifier
        </Button>,
        <Button
          key="cancel"
          danger
          icon={<CloseOutlined />}
          onClick={() => handleCancelPlan()}
          style={{ width: "100%" }}
        >
          Annuler
        </Button>,
      ];
    }
  
    // Pour tous les autres plans, afficher le bouton "Upgrade"
    return [
      <Button
        key="upgrade"
        type="primary"
        icon={<ArrowUpOutlined />}
        onClick={() => handleUpgradePlan(plan)}
        style={{ width: "100%" }}
      >
        Upgrade
      </Button>,
    ];
  };
  

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Intégration de la Navbar */}
      <NavbarUser onCollapse={handleSiderCollapse} />

      <Layout
        style={{
          marginLeft: window.innerWidth < 768 ? 0 : siderCollapsed ? 80 : 200,
          transition: "margin-left 0.3s",
          background: "#f0f2f5",
        }}
      >
        <Content
          style={{
            margin: window.innerWidth < 768 ? "64px 16px 0" : "24px 16px 0",
            overflow: "initial",
          }}
        >
          <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
            <Title level={2} style={{ textAlign: "center", marginBottom: "24px" }}>
              Choisissez votre Abonnement
            </Title>

            {loading ? (
              <Spin size="large" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }} />
            ) : (
              <Row gutter={[16, 16]} justify="center">
                {filteredPlans.map((plan) => (
                  <Col key={plan.id} xs={24} sm={12} md={8} lg={6}>
                    <Card
                      title={
                        <Title level={4} style={{ textAlign: "center", margin: 0 }}>
                          {plan.title}
                        </Title>
                      }
                      style={{ textAlign: "center", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
                      actions={getPlanActions(plan)}
                    >
                      <Title level={3} style={{ color: "#1890ff", marginBottom: 16 }}>
                        {plan.price}€/mois
                      </Title>
                      <ul style={{ listStyle: "none", padding: 0 }}>
                        {plan.features.map((feature, i) => (
                          <li key={i} style={{ marginBottom: "10px", color: "#666" }}>
                            {feature}
                          </li>
                        ))}
                      </ul>
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