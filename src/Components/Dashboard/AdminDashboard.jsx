import { useEffect, useState } from 'react';
import axios from 'axios';
import { Layout, Typography, Card, Table, Spin } from 'antd';
import NavbarAdmin from '../NavbarAdmin';
import './AdminDashboard.css';

const { Content } = Layout;
const { Title } = Typography;

const AdminDashboard = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalClients, setTotalClients] = useState(0);
  const [navbarCollapsed, setNavbarCollapsed] = useState(false);

  // Récupération de l'URL de base depuis les variables d'environnement
  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${VITE_BACKEND_BASE_URL}/api/clients`);
      setClients(response.data.clients || []);
      setTotalClients(response.data.totalClients || 0);
    } catch (error) {
      console.error('Erreur lors de la récupération des clients :', error);
      // Gestion des erreurs améliorée
      setClients([]);
      setTotalClients(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Nom complet', dataIndex: 'fullname', key: 'fullname' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Type d\'abonnement', dataIndex: 'subscriptionType', key: 'subscriptionType' },
    { title: 'Date de début', dataIndex: 'startDate', key: 'startDate' },
    { title: 'Date de fin', dataIndex: 'endDate', key: 'endDate' },
    { title: 'Statut', dataIndex: 'subscriptionStatus', key: 'subscriptionStatus' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <NavbarAdmin 
        onCollapse={(collapsed) => setNavbarCollapsed(collapsed)}
      />
      
      <Layout 
        className="site-layout"
        style={{ 
          marginLeft: navbarCollapsed ? 80 : 250,
          transition: 'margin-left 0.2s cubic-bezier(0.2, 0, 0, 1)'
        }}
      >
        <Content 
          style={{ 
            margin: '24px 16px', 
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: 8
          }}
        >
          <Title level={3}>Utilisateurs et abonnements</Title>
          <Title level={4}>Nombre total dutilisateurs : {totalClients}</Title>
          
          <Card>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={clients}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                scroll={{ x: true }}
              />
            )}
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;