import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Input, Select, message, Space, Layout } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import NavbarAdmin from "../NavbarAdmin";

const { Content } = Layout;
const { Column } = Table;
const { Option } = Select;

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [siderCollapsed, setSiderCollapsed] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const [form] = Form.useForm();

  // Gestion du collapse de la barre latérale
  const handleSiderCollapse = (collapsed) => {
    setSiderCollapsed(collapsed);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit, roleFilter]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/users`, {
        params: { page, limit, role: roleFilter },
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
      number_of_employees: user.number_of_employees.toString(), // Convertir en chaîne de caractères si nécessaire
    });
    setIsEditModalVisible(true);
  };

  const handleUpdateUser = async (values) => {
    try {
      await axios.patch(`http://localhost:3001/api/users/${editingUser.id}`, values);
      message.success("Utilisateur modifié avec succès !");
      setIsEditModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      message.error("Erreur lors de la mise à jour de l'utilisateur.");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:3001/api/users/${userId}`);
      message.success("Utilisateur supprimé avec succès !");
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      message.error("Erreur lors de la suppression de l'utilisateur.");
    }
  };

  const handleAddUser = async (values) => {
    try {
      await axios.post(`http://localhost:3001/api/users`, values);
      message.success("Utilisateur ajouté avec succès !");
      setIsAddModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'utilisateur:", error);
      message.error("Erreur lors de l'ajout de l'utilisateur.");
    }
  };

  const handleToggleAccess = async (userId, isActive) => {
    try {
      // Inverser le statut actuel
      const newIsActive = !isActive;
  
      // Appeler l'endpoint backend pour mettre à jour l'accès
      await axios.patch(`http://localhost:3001/api/users/${userId}/access`, {
        isActive: newIsActive,
      });
  
      // Mettre à jour l'état local
      const updatedUsers = users.map((user) =>
        user.id === userId ? { ...user, isActive: newIsActive } : user
      );
      setUsers(updatedUsers);
  
      // Afficher un message de succès
      message.success("Accès utilisateur mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'accès:", error);
      message.error("Erreur lors de la mise à jour de l'accès.");
    }
  };

  const filteredUsers = users.filter((user) =>
    user.first_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Space style={{ marginBottom: 16 }}>
              <Input
                placeholder="Rechercher par nom"
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select
                placeholder="Filtrer par rôle"
                value={roleFilter}
                onChange={(value) => setRoleFilter(value)}
                style={{ width: 150 }}
              >
                <Option value="">Tous</Option>
                <Option value="admin">Admin</Option>
                <Option value="user">Utilisateur</Option>
              </Select>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsAddModalVisible(true)}
              >
                Ajouter un utilisateur
              </Button>
            </Space>

            <Table dataSource={filteredUsers} loading={loading} rowKey="id">
              <Column title="ID" dataIndex="id" key="id" />
              <Column title="Prénom" dataIndex="first_name" key="first_name" />
              <Column title="Nom" dataIndex="last_name" key="last_name" />
              <Column title="Email" dataIndex="email" key="email" />
              <Column title="Rôle" dataIndex="role" key="role" />
              <Column title="Entreprise" dataIndex="company_name" key="company_name" />
              <Column title="Employés" dataIndex="number_of_employees" key="number_of_employees" />
              <Column title="Téléphone" dataIndex="phone_number" key="phone_number" />
              <Column
                title="Actions"
                key="actions"
                render={(_, user) => (
                  <Space>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => handleEditClick(user)}
                    />
                    <Button
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteUser(user.id)}
                      danger
                    />
                    <Button
                      icon={<LockOutlined />}
                      onClick={() => handleToggleAccess(user.id, user.isActive)}
                    />
                  </Space>
                )}
              />
            </Table>
          </div>
        </Content>
      </Layout>

      <Modal
        title="Modifier l'utilisateur"
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleUpdateUser}>
          <Form.Item name="first_name" label="Prénom">
            <Input />
          </Form.Item>
          <Form.Item name="last_name" label="Nom">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Rôle">
            <Select>
              <Option value="admin">Admin</Option>
              <Option value="user">Utilisateur</Option>
            </Select>
          </Form.Item>
          <Form.Item name="company_name" label="Entreprise">
            <Input />
          </Form.Item>
          <Form.Item name="number_of_employees" label="Nombre d'employés">
            <Select>
              <Option value="10">10</Option>
              <Option value="10-100">10-100</Option>
              <Option value="+100">+100</Option>
            </Select>
          </Form.Item>
          <Form.Item name="phone_number" label="Téléphone">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Ajouter un utilisateur"
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleAddUser}>
          <Form.Item name="first_name" label="Prénom">
            <Input />
          </Form.Item>
          <Form.Item name="last_name" label="Nom">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Rôle">
            <Select>
              <Option value="admin">Admin</Option>
              <Option value="user">Utilisateur</Option>
            </Select>
          </Form.Item>
          <Form.Item name="company_name" label="Entreprise">
            <Input />
          </Form.Item>
          <Form.Item name="number_of_employees" label="Nombre d'employés">
            <Select>
              <Option value="10">10</Option>
              <Option value="10-100">10-100</Option>
              <Option value="+100">+100</Option>
            </Select>
          </Form.Item>
          <Form.Item name="phone_number" label="Téléphone">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default UsersList;