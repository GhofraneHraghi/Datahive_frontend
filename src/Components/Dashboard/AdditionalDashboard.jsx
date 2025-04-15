import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Layout, Typography, Card, Spin, Button, Table, notification } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import AdditionalNavbar from "../AdditionalNavbar"; // Importer le AdditionalNavbar

const { Content } = Layout;
const { Title, Text } = Typography;

const AdditionalDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [siderCollapsed, setSiderCollapsed] = useState(false);

  // Fonction pour récupérer les données de l'utilisateur supplémentaire
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`http://localhost:3001/api/additional-users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserData(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des données", error);
      notification.error({ message: "Erreur lors de la récupération des données utilisateur." });
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [navigate]);

  // Gestion du collapse de la barre latérale
  const handleSiderCollapse = (collapsed) => {
    setSiderCollapsed(collapsed);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

  // Colonnes pour le tableau des détails de l'abonnement
  const subscriptionColumns = [
    {
      title: "Type d'abonnement",
      dataIndex: "subscriptionType",
      key: "subscriptionType",
    },
    {
      title: "Statut",
      dataIndex: "subscriptionStatus",
      key: "subscriptionStatus",
    },
    {
      title: "Date de début",
      dataIndex: "startDate",
      key: "startDate",
      render: (text) => new Date(text).toLocaleDateString("fr-FR"),
    },
    {
      title: "Date de fin",
      dataIndex: "endDate",
      key: "endDate",
      render: (text) => new Date(text).toLocaleDateString("fr-FR"),
    },
  ];

  // Données pour le tableau des abonnements
  const subscriptionData = userData?.subscriptions?.map((subscription, index) => ({
    key: index,
    subscriptionType: subscription.type,
    subscriptionStatus: subscription.status,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
  })) || [];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Utilisation du AdditionalNavbar */}
      <AdditionalNavbar  onCollapse={handleSiderCollapse} />

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
            <Title level={3}>Bienvenue, {userData?.name || "Utilisateur supplémentaire"}</Title>

            {/* Carte pour les informations de l'utilisateur */}
            <Card title="Informations de l'utilisateur" style={{ marginBottom: 24 }}>
              
              <p>
                <Text strong>Email :</Text> {userData?.email}
              </p>
              <p>
                <Text strong>Rôle :</Text> Utilisateur supplémentaire
              </p>
            </Card>

            {/* Tableau pour les détails de l'abonnement */}
            <Card title="Détails de l'abonnement" style={{ marginBottom: 24 }}>
              <Table
                columns={subscriptionColumns}
                dataSource={subscriptionData}
                pagination={false}
                locale={{ emptyText: "Aucun abonnement trouvé" }}
              />
            </Card>

            {/* Bouton pour contacter le support */}
            <Button type="primary" onClick={() => navigate("/support")}>
              Contacter le support
            </Button>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdditionalDashboard;