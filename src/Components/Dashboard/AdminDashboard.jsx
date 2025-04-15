import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
    Layout, 
    Typography, 
    Card, 
    Row, 
    Col, 
    Spin, 
    Menu, 
    Button, 
    Table, 
    Modal, 
    Form, 
    Input, 
    DatePicker, 
    message, 
    Space 
} from 'antd';
import NavbarAdmin from "../NavbarAdmin";
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text } = Typography;

const AdminDashboard = () => {
    const [adminData, setAdminData] = useState(null);
    const [subscribedUsers, setSubscribedUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [siderCollapsed, setSiderCollapsed] = useState(false);
    
    // Gestion du collapse de la barre latérale
    const handleSiderCollapse = (collapsed) => {
        setSiderCollapsed(collapsed);
    };
    
    // Fonction pour modifier l'abonnement
    const toggleSubscriptionStatus = async (userId, currentStatus) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            message.error('Token non trouvé.');
            return;
        }

        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

        try {
            await axios.patch(
                `http://localhost:3001/api/subscription/${userId}`, 
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            fetchSubscribedUsers(); // Recharger la liste des utilisateurs
            message.success(`Statut changé en "${newStatus}"`);
        } catch (error) {
            message.error(error.response ? error.response.data.message : 'Erreur de modification du statut.');
        }
    };

    const handleUpdateSubscription = async () => {
        try {
            const values = await form.validateFields();
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                message.error('Token non trouvé.');
                return;
            }
            
            // Formater les dates avant de les envoyer
            const formattedStartDate = values.startDate.format('YYYY-MM-DD');
            const formattedEndDate = values.endDate.format('YYYY-MM-DD');

            await axios.patch(
                `http://localhost:3001/api/subscription/${editingUser.id}`,
                {
                    subscriptionType: values.subscriptionType,
                    start_date: formattedStartDate,
                    end_date: formattedEndDate,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            fetchSubscribedUsers(); // Recharger les utilisateurs abonnés
            setModalVisible(false);
            message.success('Abonnement mis à jour avec succès!');
        } catch (error) {
            message.error(error.response ? error.response.data.message : 'Erreur de mise à jour des informations.');
        }
    };

    // Fonction pour récupérer les données du dashboard
    const fetchAdminData = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Token non trouvé.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get('http://localhost:3001/api/admin-data', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAdminData(response.data);
            setLoading(false);
        } catch (error) {
            setError(error.response ? error.response.data.message : 'Erreur de récupération des données.');
            setLoading(false);
        }
    };

    // Fonction pour récupérer les utilisateurs avec abonnement
    const fetchSubscribedUsers = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Token non trouvé.');
            return;
        }

        try {
            const response = await axios.get('http://localhost:3001/api/subscribed-users', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSubscribedUsers(response.data);
        } catch (error) {
            setError(error.response ? error.response.data.message : 'Erreur de récupération des utilisateurs.');
        }
    };

    useEffect(() => {
        fetchAdminData();
        fetchSubscribedUsers();
    }, []);

    const handleEditClick = (user) => {
        setEditingUser(user);
        form.setFieldsValue({
            subscriptionType: user.subscriptionType,
            startDate: user.startDate ? dayjs(user.startDate) : null,
            endDate: user.endDate ? dayjs(user.endDate) : null,
        });
        setModalVisible(true);
    };

    // Colonnes pour le tableau des utilisateurs avec abonnement
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
        { title: 'Nom complet', dataIndex: 'fullname', key: 'fullname', width: 180 },
        { title: 'Email', dataIndex: 'email', key: 'email', width: 180 },
        { title: 'Type d\'abonnement', dataIndex: 'subscriptionType', key: 'subscriptionType', width: 150 },
        { title: 'Date de début', dataIndex: 'startDate', key: 'startDate', width: 120 },
        { title: 'Date de fin', dataIndex: 'endDate', key: 'endDate', width: 120 },
        { title: 'Statut', dataIndex: 'subscriptionStatus', key: 'subscriptionStatus', width: 100 },
        {
            title: 'Action',
            key: 'action',
            width: 250,
            render: (_, record) => (
                <Space>
                    <Button
                        type={record.subscriptionStatus === 'active' ? 'danger' : 'primary'}
                        onClick={() => toggleSubscriptionStatus(record.id, record.subscriptionStatus)}
                    >
                        {record.subscriptionStatus === 'active' ? 'Désactiver' : 'Activer'}
                    </Button>
                    <Button
                        type="default"
                        onClick={() => handleEditClick(record)}
                    >
                        Modifier
                    </Button>
                    <Button 
                        type="primary"
                        onClick={() => handleAddUserToSubscription(record.id)}
                    >
                        Ajouter
                    </Button>
                </Space>
            ),
        },
    ];

    // Cette fonction semble être manquante dans le code original, mais est appellée dans un bouton
    const handleAddUserToSubscription = (userId) => {
        message.info(`Fonction d'ajout pour utilisateur ID: ${userId} non implémentée`);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Intégration de la NavbarAdmin */}
            <NavbarAdmin title="Administration" onCollapse={handleSiderCollapse} />

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
                        <Title level={3}>Bienvenue, {adminData?.name || "Admin"}</Title>

                        {/* Statistiques Admin */}
                        <Card title="Statistiques générales" style={{ marginBottom: 24 }}>
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Text strong>Utilisateurs : </Text>
                                    <Text>{adminData?.totalUsers}</Text>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Text strong>Abonnements actifs : </Text>
                                    <Text>{adminData?.totalSubscriptions}</Text>
                                </Col>
                            </Row>
                        </Card>

                        {/* Tableau des utilisateurs avec abonnement */}
                        <Card title="Utilisateurs avec abonnement" style={{ marginBottom: 24 }}>
                            <Table
                                columns={columns}
                                dataSource={subscribedUsers}
                                rowKey="id"
                                pagination={{ pageSize: 5 }}
                                scroll={{ x: 1100 }}
                            />
                        </Card>
                    </div>
                </Content>
            </Layout>

            {/* Formulaire d'édition dans une modal */}
            <Modal
                title="Modifier l'abonnement"
                open={modalVisible}
                onOk={handleUpdateSubscription}
                onCancel={() => setModalVisible(false)}
                okText="Mettre à jour"
                cancelText="Annuler"
            >
                <Form
                    form={form}
                    layout="vertical"
                    style={{ maxWidth: 600 }}
                >
                    <Form.Item
                        name="subscriptionType"
                        label="Type d'abonnement"
                        rules={[{ required: true, message: 'Veuillez saisir le type d\'abonnement' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="startDate"
                        label="Date de début"
                        rules={[{ required: true, message: 'Veuillez sélectionner une date de début' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="endDate"
                        label="Date de fin"
                        rules={[{ required: true, message: 'Veuillez sélectionner une date de fin' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default AdminDashboard;