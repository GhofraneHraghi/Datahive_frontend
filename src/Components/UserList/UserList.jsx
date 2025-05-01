import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Input, message, Space, Layout } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import NavbarAdmin from "../NavbarAdmin";

const { Content } = Layout;
const { Column } = Table;

const UsersList = () => {
  const [employee, setEmployee] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [siderCollapsed, setSiderCollapsed] = useState(false);

  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const [editForm] = Form.useForm();
  const [addForm] = Form.useForm();

  const handleSiderCollapse = (collapsed) => {
    setSiderCollapsed(collapsed);
  };

  useEffect(() => {
    fetchEmployee();
  }, [page, limit]);

  const fetchEmployee = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/employee`, {
        params: { page, limit },
      });
      setEmployee(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des employés:", error);
      setLoading(false);
    }
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    editForm.setFieldsValue({ ...employee });
    setIsEditModalVisible(true);
  };

  const handleUpdateEmployee = async (values) => {
    try {
      await axios.patch(`http://localhost:3001/api/employee/${editingEmployee.id}`, values);
      message.success("Employé mis à jour avec succès !");
      setIsEditModalVisible(false);
      fetchEmployee();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'employé:", error);
      message.error("Erreur lors de la mise à jour.");
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await axios.delete(`http://localhost:3001/api/employee/${employeeId}`);
      message.success("Employé supprimé avec succès !");
      fetchEmployee();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'employé:", error);
      message.error("Erreur lors de la suppression.");
    }
  };

  const handleAddEmployee = async (values) => {
    try {
      await axios.post(`http://localhost:3001/api/employee`, values);
      message.success("Employé ajouté avec succès. Un email a été envoyé avec les informations de connexion.");
      addForm.resetFields();
      setIsAddModalVisible(false);
      fetchEmployee();
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'employé:", error);
      message.error("Erreur lors de l'ajout.");
    }
  };

  const filteredEmployee = employee.filter((employee) =>
    employee.first_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <NavbarAdmin onCollapse={handleSiderCollapse} />

      <Layout
        style={{
          marginLeft: window.innerWidth < 768 ? 0 : siderCollapsed ? 80 : 250,
          transition: "margin-left 0.3s",
          background: "#f0f2f5",
        }}
      >
        <Content style={{ margin: "24px 16px", overflow: "initial" }}>
          <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
            <Space style={{ marginBottom: 16 }}>
              <Input
                placeholder="Rechercher par prénom"
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalVisible(true)}>
                Ajouter un employé
              </Button>
            </Space>

            <Table dataSource={filteredEmployee} loading={loading} rowKey="id">
              <Column title="ID" dataIndex="id" key="id" />
              <Column title="Prénom" dataIndex="first_name" key="first_name" />
              <Column title="Nom" dataIndex="last_name" key="last_name" />
              <Column title="Email" dataIndex="email" key="email" />
              <Column
                title="Actions"
                key="actions"
                render={(_, record) => (
                  <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEditClick(record)} />
                    <Button icon={<DeleteOutlined />} onClick={() => handleDeleteEmployee(record.id)} danger />
                  </Space>
                )}
              />
            </Table>
          </div>
        </Content>
      </Layout>

      {/* Modal Modifier */}
      <Modal
        title="Modifier l'employé"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={() => editForm.submit()}
      >
        <Form form={editForm} onFinish={handleUpdateEmployee} layout="vertical">
          <Form.Item name="first_name" label="Prénom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="last_name" label="Nom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Ajouter */}
      <Modal
        title="Ajouter un employé"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onOk={() => addForm.submit()}
      >
        <Form form={addForm} onFinish={handleAddEmployee} layout="vertical">
          <Form.Item name="first_name" label="Prénom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="last_name" label="Nom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default UsersList;
