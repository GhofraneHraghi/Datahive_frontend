import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Layout, 
  Typography, 
  Card, 
  Row, 
  Col, 
  Modal, 
  Form, 
  Input, 
  Button, 
  message, 
  Space 
} from "antd";
import { 
  PlusCircleOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from "@ant-design/icons";
import NavbarAdmin from "./NavbarAdmin";

const { Content } = Layout;
const { Title, Text } = Typography;

const SubscriptionAdmin = () => {
  const [plans, setPlans] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [form] = Form.useForm();

  // Gestion du collapse de la barre latérale
  const handleSiderCollapse = (collapsed) => {
    setSiderCollapsed(collapsed);
  };

  // Charger les abonnements au montage du composant
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/plans");
        setPlans(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des abonnements :", error);
        message.error("Une erreur s'est produite lors du chargement des abonnements.");
      }
    };

    fetchPlans();
  }, []);

  const handleAddOrUpdatePlan = async (values) => {
    try {
      if (editPlan) {
        const response = await axios.put(`http://localhost:3001/api/plans/${editPlan.id}`, {
          ...values,
          features: values.features.split('\n')
        });
        setPlans(plans.map((p) => (p.id === editPlan.id ? response.data : p)));
      } else {
        const response = await axios.post("http://localhost:3001/api/plans", {
          ...values,
          features: values.features.split('\n')
        });
        setPlans([...plans, response.data]);
      }
      setOpenDialog(false);
      setEditPlan(null);
      form.resetFields();
      message.success("Abonnement enregistré avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'ajout ou de la mise à jour de l'abonnement:", error);
      message.error("Une erreur s'est produite. Veuillez réessayer.");
    }
  };

  const handleDeletePlan = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/plans/${id}`);
      setPlans(plans.filter((plan) => plan.id !== id));
      message.success("Abonnement supprimé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'abonnement :", error);
      message.error("Une erreur s'est produite lors de la suppression de l'abonnement.");
    }
  };

  const showAddPlanModal = () => {
    setEditPlan(null);
    form.resetFields();
    setOpenDialog(true);
  };

  const showEditPlanModal = (plan) => {
    setEditPlan(plan);
    form.setFieldsValue({
      ...plan,
      features: plan.features.join('\n')
    });
    setOpenDialog(true);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Intégration de la NavbarAdmin */}
      <NavbarAdmin  onCollapse={handleSiderCollapse} />

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
            <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
              Gestion des Abonnements
            </Title>

            <Row gutter={[16, 16]} justify="center">
              {/* Carte d'ajout d'abonnement */}
              <Col xs={24} sm={12} md={8}>
                <Card
                  hoverable
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 250,
                    textAlign: "center",
                  }}
                  onClick={showAddPlanModal}
                >
                  <div>
                    <PlusCircleOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                    <Title level={4} style={{ color: '#1890ff', marginTop: 16 }}>
                      Ajouter un Abonnement
                    </Title>
                  </div>
                </Card>
              </Col>

              {/* Abonnements existants */}
              {plans.map((plan) => (
                <Col key={plan.id} xs={24} sm={12} md={8}>
                  <Card
                    title={plan.title}
                    extra={
                      <Space>
                        <Button 
                          icon={<EditOutlined />} 
                          type="text" 
                          onClick={() => showEditPlanModal(plan)}
                        />
                        <Button 
                          icon={<DeleteOutlined />} 
                          type="text" 
                          danger 
                          onClick={() => handleDeletePlan(plan.id)}
                        />
                      </Space>
                    }
                  >
                    <div style={{ textAlign: 'center' }}>
                      <Title level={2} style={{ color: '#1890ff' }}>
                        {plan.price}€/mois
                      </Title>
                      <ul style={{ 
                        listStyle: "none", 
                        padding: 0, 
                        textAlign: 'left',
                        margin: '16px 0'
                      }}>
                        {plan.features.map((feature, i) => (
                          <li key={i} style={{ marginBottom: "10px" }}>
                            • {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Content>
      </Layout>

      <Modal
        title={editPlan ? "Modifier un Abonnement" : "Ajouter un Abonnement"}
        visible={openDialog}
        onCancel={() => {
          setOpenDialog(false);
          setEditPlan(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddOrUpdatePlan}
        >
          <Form.Item
            name="title"
            label="Titre"
            rules={[{ required: true, message: 'Veuillez saisir un titre' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="price"
            label="Prix"
            rules={[{ required: true, message: 'Veuillez saisir un prix' }]}
          >
            <Input type="number" addonAfter="€/mois" />
          </Form.Item>
          
          <Form.Item
            name="features"
            label="Fonctionnalités (une par ligne)"
            rules={[{ required: true, message: 'Veuillez saisir des fonctionnalités' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
              <Button type="primary" htmlType="submit">
                Sauvegarder
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default SubscriptionAdmin;