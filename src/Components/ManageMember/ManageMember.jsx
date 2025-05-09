import React, { useState, useEffect } from "react";
import { Layout, Typography, Card, Button, Modal, Input, Spin, Table, notification, Badge, Space } from "antd";
import { PlusOutlined, DeleteOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";
import axios from "axios";
import Navbar from "../Dashboard/Navbar";
import "./ManageMember.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const ManageMember = () => {
  const [userData, setUserData] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [remainingQuota, setRemainingQuota] = useState(0);
  const [siderCollapsed, setSiderCollapsed] = useState(false);

  // Récupération de l'URL de base depuis les variables d'environnement Vite
  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  const handleSiderCollapse = (collapsed) => {
    setSiderCollapsed(collapsed);
  };

  const fetchUserDataAndMembers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      notification.error({ message: "Token non trouvé." });
      setLoading(false);
      return;
    }

    try {
      // Récupérer les données de l'utilisateur connecté
      const userResponse = await axios.get(`${VITE_BACKEND_BASE_URL}/api/user-data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(userResponse.data.user);

      // Récupérer les membres associés à l'utilisateur
      const membersResponse = await axios.get(`${VITE_BACKEND_BASE_URL}/api/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(membersResponse.data.members);

      // Calculer le quota restant
      if (userResponse.data.user.subscription && userResponse.data.user.subscription.plan) {
        const { quota_limit } = userResponse.data.user.subscription.plan;
        const usedQuota = membersResponse.data.members.length;
        setRemainingQuota(quota_limit - usedQuota);
      }

      setLoading(false);
    } catch (error) {
      notification.error({ message: "Erreur lors du chargement des données." });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDataAndMembers();
  }, []);

  const handleAddMember = async () => {
    if (!newMemberEmail) {
      notification.warning({ message: "Veuillez entrer un email valide." });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${VITE_BACKEND_BASE_URL}/api/add-members`,
        { email: newMemberEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      notification.success({ message: response.data.message });
      setMembers([...members, response.data.member]);
      setRemainingQuota(remainingQuota - 1);
      setNewMemberEmail("");
      setIsAddMemberModalVisible(false);
    } catch (error) {
      notification.error({
        message: "Erreur lors de l'ajout du membre.",
        description: error.response?.data?.message || "Une erreur est survenue.",
      });
    }
  };

  const handleDeleteMember = async (memberId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${VITE_BACKEND_BASE_URL}/api/delete_members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      notification.success({ message: "Membre supprimé avec succès." });
      setMembers(members.filter((member) => member.id !== memberId));
      setRemainingQuota(remainingQuota + 1);
    } catch (error) {
      notification.error({ message: "Erreur lors de la suppression du membre." });
    }
  };

  const columns = [
    {
      title: "Nom",
      dataIndex: "first_name",
      key: "first_name",
      render: (text, record) => (
        <Space>
          <UserOutlined />
          {`${record.first_name || ""} ${record.last_name || ""}`}
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Statut",
      key: "status",
      render: () => <Badge status="success" text="Actif" />,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteMember(record.id)}
          >
            Supprimer
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navbar onCollapse={handleSiderCollapse} />
      <Layout
        style={{
          marginLeft: siderCollapsed ? 80 : 250,
          transition: "margin-left 0.3s",
          background: "#f0f2f5",
        }}
      >
        <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
          <div className="manage-member-container">
            <Title level={3} className="manage-member-title">
              <TeamOutlined /> Gérer les Membres
            </Title>
    
            {/* Informations de l'utilisateur connecté */}
            <Card
              title="Informations de l'utilisateur connecté"
              className="manage-member-card"
            >
              <p>
                <Text strong>Nom :</Text> {userData?.first_name} {userData?.last_name}
              </p>
              <p>
                <Text strong>Email :</Text> {userData?.email}
              </p>
              <p>
                <Text strong>Abonnement :</Text> {userData?.subscription?.plan?.name || "Aucun"}
              </p>
              <p>
                <Text strong>Statut :</Text>{" "}
                {userData?.subscription?.status === "active" ? (
                  <Badge status="success" text="Actif" />
                ) : (
                  <Badge status="error" text="Inactif" />
                )}
              </p>
            </Card>
    
            {/* Liste des membres */}
            <Card
              title="Liste des Membres"
              className="manage-member-card"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  className="add-member-button"
                  onClick={() => setIsAddMemberModalVisible(true)}
                  disabled={remainingQuota <= 0}
                >
                  Ajouter un membre
                </Button>
              }
            >
              {userData && userData.subscription && userData.subscription.plan && (
                <p>
                  <Text strong>Quota disponible :</Text> {remainingQuota} / {userData.subscription.plan.quota_limit} membres
                </p>
              )}
              <Table
                columns={columns}
                dataSource={members.map((member) => ({ ...member, key: member.id }))}
                pagination={false}
                locale={{ emptyText: "Aucun membre trouvé" }}
              />
            </Card>
    
            <Modal
              title="Ajouter un membre"
              visible={isAddMemberModalVisible}
              onCancel={() => setIsAddMemberModalVisible(false)}
              onOk={handleAddMember}
              okText="Ajouter"
              cancelText="Annuler"
            >
              <Input
                placeholder="Email du membre"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
            </Modal>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ManageMember;