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
  InputNumber,
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
const { Title } = Typography;

const SubscriptionAdmin = () => {
  const [plans, setPlans] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Récupération de l'URL de base depuis les variables d'environnement Vite
  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const apiPlanUrl = `${VITE_BACKEND_BASE_URL}/api/plan`;

  const handleSiderCollapse = (collapsed) => {
    setSiderCollapsed(collapsed);
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await axios.get(apiPlanUrl);
        setPlans(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Erreur lors de la récupération des plans :", error);
        message.error("Erreur lors du chargement des plans.");
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [apiPlanUrl]);

  const handleAddOrUpdatePlan = async (values) => {
    try {
      setLoading(true);
      if (editPlan) {
        const response = await axios.put(`${apiPlanUrl}/${editPlan.plan_id}`, values);
        setPlans(plans.map((p) => (p.id === editPlan.id ? response.data : p)));
        message.success("Plan mis à jour avec succès !");
      } else {
        const response = await axios.post(apiPlanUrl, values);
        setPlans([...plans, response.data]);
        message.success("Plan ajouté avec succès !");
      }
      setOpenDialog(false);
      setEditPlan(null);
      form.resetFields();
    } catch (error) {
      console.error("Erreur lors de l'ajout ou de la mise à jour :", error);
      message.error(error.response?.data?.message || "Une erreur s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${apiPlanUrl}/${id}`);
      setPlans(plans.filter((plan) => plan.id !== id));
      message.success("Plan supprimé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      message.error(error.response?.data?.message || "Erreur lors de la suppression.");
    } finally {
      setLoading(false);
    }
  };

  const showAddPlanModal = () => {
    setEditPlan(null);
    form.resetFields();
    setOpenDialog(true);
  };

  const showEditPlanModal = (plan) => {
    setEditPlan(plan);
    form.setFieldsValue(plan);
    setOpenDialog(true);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <NavbarAdmin onCollapse={handleSiderCollapse} />

      <Layout style={{
        marginLeft: window.innerWidth < 768 ? 0 : (siderCollapsed ? 80 : 250),
        transition: "margin-left 0.3s",
        background: "#f0f2f5"
      }}>
        <Content style={{
          margin: window.innerWidth < 768 ? "64px 16px 0" : "24px 16px 0",
          overflow: "initial"
        }}>
          <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
            <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
              Gestion des Plans
            </Title>

            <Row gutter={[16, 16]} justify="center">
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
                      Ajouter un Plan
                    </Title>
                  </div>
                </Card>
              </Col>

              {plans.map((plan) => (
                <Col key={plan.id} xs={24} sm={12} md={8}>
                  <Card
                    title={plan.name}
                    extra={
                      <Space>
                        <Button 
                          icon={<EditOutlined />} 
                          type="text" 
                          onClick={() => showEditPlanModal(plan)}
                          disabled={loading}
                        />
                        <Button 
                          icon={<DeleteOutlined />} 
                          type="text" 
                          danger 
                          onClick={() => handleDeletePlan(plan.id)}
                          disabled={loading}
                        />
                      </Space>
                    }
                  >
                    <div style={{ textAlign: 'center' }}>
                      <Title level={2} style={{ color: '#1890ff' }}>
                        {plan.price}€
                      </Title>
                      <p><strong>Quota :</strong> {plan.quota_limit}</p>
                      <p><strong>Durée :</strong> {plan.duration_days} jours</p>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Content>
      </Layout>

      <Modal
        title={editPlan ? "Modifier un Plan" : "Ajouter un Plan"}
        open={openDialog}
        onCancel={() => {
          setOpenDialog(false);
          setEditPlan(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddOrUpdatePlan}
        >
          <Form.Item
            name="name"
            label="Nom du Plan"
            rules={[{ required: true, message: 'Veuillez saisir un nom' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="price"
            label="Prix"
            rules={[{ required: true, message: 'Veuillez saisir un prix' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} addonAfter="€" />
          </Form.Item>

          <Form.Item
            name="quota_limit"
            label="Quota (nombre max d'utilisateurs, etc.)"
            rules={[{ required: true, message: 'Veuillez saisir un quota' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="duration_days"
            label="Durée (en jours)"
            rules={[{ required: true, message: 'Veuillez saisir une durée' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setOpenDialog(false)} disabled={loading}>
                Annuler
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
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