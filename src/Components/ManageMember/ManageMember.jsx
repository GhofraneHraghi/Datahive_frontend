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
  const [newMemberData, setNewMemberData] = useState({
    email: "",
    first_name: "",
    last_name: ""
  });
  const [remainingQuota, setRemainingQuota] = useState(0);
  const [siderCollapsed, setSiderCollapsed] = useState(false);

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
      const userResponse = await axios.get(`${VITE_BACKEND_BASE_URL}/api/user-data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(userResponse.data.user);

      const membersResponse = await axios.get(`${VITE_BACKEND_BASE_URL}/api/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(membersResponse.data.members);

      if (userResponse.data.user.subscription && userResponse.data.user.subscription.plan) {
        const { quota_limit } = userResponse.data.user.subscription.plan;
        const usedQuota = membersResponse.data.members.length;
        setRemainingQuota(quota_limit - usedQuota);
      }

      setLoading(false);
    } catch (error) {
      notification.error({ 
        message: "Erreur lors du chargement des données.",
        description: error.response?.data?.message || error.message
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDataAndMembers();
  }, []);

 const handleAddMember = async () => {
  if (!newMemberData.email) {
    notification.warning({ message: "Veuillez entrer un email valide." });
    return;
  }

  try {
    const token = localStorage.getItem("token");
    
    // Debug: Vérifier les données avant envoi
    console.log("Données envoyées:", {
      email: newMemberData.email,
      first_name: newMemberData.first_name,
      last_name: newMemberData.last_name
    });

    const response = await axios.post(
      `${VITE_BACKEND_BASE_URL}/api/add-members`,
      {
        email: newMemberData.email,
        first_name: newMemberData.first_name,
        last_name: newMemberData.last_name
      },
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );

    notification.success({ 
      message: "Membre ajouté avec succès",
      description: response.data.message
    });
    
    setNewMemberData({
      email: "",
      first_name: "",
      last_name: ""
    });
    setIsAddMemberModalVisible(false);
    fetchUserDataAndMembers();
    
  } catch (error) {
    console.error("Erreur complète:", {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });

    notification.error({
      message: "Erreur lors de l'ajout du membre",
      description: error.response?.data?.message || 
        "Veuillez vérifier votre abonnement et réessayer"
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
      fetchUserDataAndMembers(); // Rafraîchir la liste
    } catch (error) {
      notification.error({ 
        message: "Erreur lors de la suppression du membre.",
        description: error.response?.data?.message || error.message
      });
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
              {userData?.subscription?.plan && (
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
              title="Ajouter un nouveau membre"
              visible={isAddMemberModalVisible}
              onCancel={() => setIsAddMemberModalVisible(false)}
              onOk={handleAddMember}
              okText="Ajouter"
              cancelText="Annuler"
              width={600}
            >
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <Input
                  placeholder="Prénom"
                  value={newMemberData.first_name}
                  onChange={(e) => setNewMemberData({...newMemberData, first_name: e.target.value})}
                  style={{ flex: 1 }}
                />
                <Input
                  placeholder="Nom"
                  value={newMemberData.last_name}
                  onChange={(e) => setNewMemberData({...newMemberData, last_name: e.target.value})}
                  style={{ flex: 1 }}
                />
              </div>
              <Input
                placeholder="Email du membre"
                value={newMemberData.email}
                onChange={(e) => setNewMemberData({...newMemberData, email: e.target.value})}
                type="email"
              />
              <div style={{ marginTop: '16px', color: '#666' }}>
                <Text type="secondary">Un email dactivation sera envoyé à ce membre</Text>
              </div>
            </Modal>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ManageMember;