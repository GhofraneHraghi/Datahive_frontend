import { useEffect, useState } from 'react';
import axios from 'axios';
import { Layout, Typography, Card, Button, Modal, Input, Spin, Table, notification, Space } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import NavbarUser from "../NavbarUser";

const { Content } = Layout;
const { Title } = Typography;

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [additionalUsers, setAdditionalUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(null);
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [additionalUsersLoading, setAdditionalUsersLoading] = useState(true);

  const navigate = useNavigate();
 // Vérifier si l'utilisateur a un abonnement actif
 const hasActiveSubscription = userData?.subscriptions?.some(sub => sub.status === 'active');
  // Gestion du collapse de la barre latérale
  const handleSiderCollapse = (collapsed) => {
    setSiderCollapsed(collapsed);
  };

  // 1. Fonction pour récupérer les données de l'utilisateur
  const fetchUserData = async () => {
    const token = localStorage.getItem('authToken');
    console.log('Token:', token); // Ajoutez cette ligne pour vérifier le token
    if (!token) {
      notification.error({ message: 'Token non trouvé.' });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('http://localhost:3001/api/user-data', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data.user);
      setLoading(false);
    } catch (error) {
      notification.error({ message: 'Erreur de récupération des données utilisateur.' });
      setLoading(false);
    }
  };

  // 2. Fonction pour récupérer les utilisateurs supplémentaires
  const fetchAdditionalUsers = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      setAdditionalUsersLoading(true);
      const response = await axios.get('http://localhost:3001/api/additional-users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setAdditionalUsers(response.data.additionalUsers);
      setAdditionalUsersLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs supplémentaires:', error);
      notification.error({ message: 'Erreur lors de la récupération des utilisateurs supplémentaires.' });
      setAdditionalUsersLoading(false);
    }
  };

  // 3. useEffect pour charger les données au chargement du composant
  useEffect(() => {
    fetchUserData();
    fetchAdditionalUsers();
  }, []);

  const handleAddUser = async () => {
    if (!selectedSubscriptionId) {
      notification.warning({ message: "Veuillez sélectionner un abonnement." });
      return;
    }

    const selectedSubscription = userData.subscriptions.find(sub => sub.id === selectedSubscriptionId);
    const maxAdditionalUsers = selectedSubscription.type === 'premium' ? 5 : 2;
    const currentAdditionalUsers = additionalUsers.filter(user => user.subscriptionId === selectedSubscriptionId).length;

    if (currentAdditionalUsers >= maxAdditionalUsers) {
      notification.warning({ message: `Limite atteinte (${maxAdditionalUsers} utilisateurs).` });
      return;
    }

    if (!newUserEmail) {
      notification.warning({ message: "Veuillez entrer un email valide." });
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:3001/api/add-additional-user',
        {
          parentUserId: userData.id,
          email: newUserEmail,
          subscriptionId: selectedSubscriptionId,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        }
      );
      notification.success({ message: response.data.message });
      
      // Actualiser la liste des utilisateurs supplémentaires après l'ajout
      fetchAdditionalUsers();
      
      setNewUserEmail('');
      setModalVisible(false);
    } catch (error) {
      notification.error({ message: 'Une erreur s\'est produite lors de l\'ajout de l\'utilisateur.' });
    }
  };

  // Fonction pour rediriger vers la page des plans d'abonnement (activation)
  const handleActivatePlan = () => {
    navigate('/subscription-plans');
  };

  // Fonction pour rediriger vers la page des plans d'abonnement (changement)
  const handleChangeSubscription = () => {
    const currentSubscriptionType = userData.subscriptions.find(sub => sub.status === 'active')?.type;
    navigate("/subscription-plans", { state: { isChangingSubscription: true, currentSubscriptionType } });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Colonnes pour le tableau des utilisateurs supplémentaires
  const additionalUsersColumns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Statut d\'abonnement',
      dataIndex: 'subscriptionStatus',
      key: 'subscriptionStatus',
    },
    {
      title: 'Type d\'abonnement',
      dataIndex: 'subscriptionType',
      key: 'subscriptionType',
    },
    {
      title: 'Role',
      dataIndex: 'role',  // Ajoutez cette ligne pour afficher le rôle
      key: 'role',
    },
    {
      title: 'Date de début',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (text) => new Date(text).toLocaleDateString('fr-FR')
    },
    {
      title: 'Date de fin',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (text) => new Date(text).toLocaleDateString('fr-FR')
    }
  ];

  // Colonnes pour le tableau des abonnements
  const subscriptionColumns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Type d\'abonnement',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Role',
    dataIndex: 'role',  // Mettez à jour cette ligne pour afficher le rôle
    key: 'role',
  },
    {
      title: 'Date de début',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'Date de fin',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle" direction="vertical">
          {record.status === 'active' && (
            <>
              {record.type !== 'basic' && (
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => {
                    setSelectedSubscriptionId(record.key);
                    setModalVisible(true);
                  }}
                >
                  Ajouter un utilisateur
                </Button>
              )}
              <Button
                type="primary"
                onClick={handleChangeSubscription}
              >
                Changer votre Abonnement
              </Button>
            </>
          )}
          {record.status !== 'active' && (
            <Button type="primary" onClick={handleActivatePlan}>
              Activer votre plan
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Données pour le tableau des abonnements
  const subscriptionData = userData?.subscriptions?.map(subscription => ({
    key: subscription.id,
    name: userData.name,
    email: userData.email,
    type: subscription.type,
    status: subscription.status,
    role: userData.role,  // Ajoutez cette ligne pour inclure le rôle
    startDate: subscription.startDate || 'Aucun',
    endDate: subscription.endDate || 'Aucun',
  })) || [];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <NavbarUser onCollapse={handleSiderCollapse} />

      <Layout style={{ 
        marginLeft: window.innerWidth < 768 ? 0 : (siderCollapsed ? 80 : 200), 
        transition: "margin-left 0.3s",
        background: "#f0f2f5" 
      }}>
        <Content style={{ 
          margin: window.innerWidth < 768 ? "64px 16px 0" : "24px 16px 0", 
          overflow: "initial" 
        }}>
          <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
            <Title level={3}>Bienvenue, {userData?.name || "Utilisateur"}</Title>
            
            {/* Tableau des utilisateurs supplémentaires - Placé AVANT le tableau des abonnements */}
            {hasActiveSubscription && (
            <Card 
              title="Utilisateurs supplémentaires" 
              style={{ marginBottom: 24 }}
              extra={
                additionalUsersLoading ? (
                  <Spin size="small" />
                ) : (
                  <Button onClick={fetchAdditionalUsers} type="link">
                    Actualiser
                  </Button>
                )
              }
            >
              <Table
                loading={additionalUsersLoading}
                columns={additionalUsersColumns}
                dataSource={additionalUsers.map((user, index) => ({ ...user, key: index }))}
                pagination={false}
                locale={{ emptyText: "Aucun utilisateur supplémentaire trouvé" }}
              />
            </Card>
          )}
            {/* Tableau des abonnements */}
            <Card title="Mes abonnements" style={{ marginBottom: 24 }}>
              <Table
                columns={subscriptionColumns}
                dataSource={subscriptionData}
                pagination={false}
              />
            </Card>

            {/* Modal pour ajouter un utilisateur supplémentaire */}
            <Modal
              title="Ajouter un utilisateur supplémentaire"
              open={modalVisible}
              onCancel={() => setModalVisible(false)}
              onOk={handleAddUser}
              okText="Ajouter"
              cancelText="Annuler"
            >
              <Input
                placeholder="Email de l'utilisateur"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </Modal>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;