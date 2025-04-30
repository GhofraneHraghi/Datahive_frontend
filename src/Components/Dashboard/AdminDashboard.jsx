import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Layout, Typography, Card, Table, Spin
} from 'antd';
import NavbarAdmin from '../NavbarAdmin';
import './AdminDashboard.css';


const { Content } = Layout;
const { Title } = Typography;

const AdminDashboard = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalClients, setTotalClients] = useState(0); // Total users

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/clients'); 
      setClients(response.data.clients);
      setTotalClients(response.data.totalClients);
    } catch (error) {
      console.error('Erreur lors de la récupération des clients :', error);
    }
    setLoading(false);
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
      <NavbarAdmin title="Administration" />
      <Layout style={{ marginLeft: 200 }}>
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ padding: 24, background: '#fff' }}>
            <Title level={3}>Utilisateurs et abonnements</Title>
            <Title level={4}>Nombre total dutilisateurs : {totalClients}</Title>
            <Card>
              {loading ? <Spin /> : (
                <Table
                  columns={columns}
                  dataSource={clients}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                />
              )}
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
