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
  const [employees, setEmployees] = useState([]);
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

  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  const handleSiderCollapse = (collapsed) => {
    setSiderCollapsed(collapsed);
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, limit]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${VITE_BACKEND_BASE_URL}/api/employee`);
      setEmployees(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des employés:", error);
      setLoading(false);
    }
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    editForm.setFieldsValue({
      first_name: employee.first_name_employee,
      last_name: employee.last_name_employee,
      email: employee.email_employee
    });
    setIsEditModalVisible(true);
  };

  const handleUpdateEmployee = async (values) => {
  try {
    await axios.patch(`${VITE_BACKEND_BASE_URL}/api/employee/${editingEmployee.employee_id}`, {
      first_name_employee: values.first_name,
      last_name_employee: values.last_name,
      email_employee: values.email
    });
    message.success("Employé mis à jour avec succès !");
    setIsEditModalVisible(false);
    fetchEmployees();
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'employé:", error);
    message.error(error.response?.data?.error || "Erreur lors de la mise à jour.");
  }
};

 const handleDeleteEmployee = async (employeeId) => {
  try {
    if (!employeeId) {
      message.error("ID de l'employé manquant");
      return;
    }
    
    await axios.delete(`${VITE_BACKEND_BASE_URL}/api/employee/${employeeId}`);
    message.success("Employé supprimé avec succès !");
    fetchEmployees();
  } catch (error) {
    console.error("Erreur lors de la suppression de l'employé:", error);
    message.error(error.response?.data?.error || "Erreur lors de la suppression.");
  }
};

  const handleAddEmployee = async (values) => {
  try {
    await axios.post(`${VITE_BACKEND_BASE_URL}/api/employee`, {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email
    });
    message.success("Employé ajouté avec succès. Un email a été envoyé avec les informations de connexion.");
    addForm.resetFields();
    setIsAddModalVisible(false);
    fetchEmployees();
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'employé:", error);
    message.error(error.response?.data?.error || "Erreur lors de l'ajout.");
  }
};

  const filteredEmployees = employees.filter((employee) =>
    employee.first_name_employee?.toLowerCase().includes(searchQuery.toLowerCase())
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

            <Table dataSource={filteredEmployees} loading={loading} rowKey="id">
              <Column title="ID" dataIndex="id" key="id" />
              <Column title="Prénom" dataIndex="first_name_employee" key="first_name_employee" />
              <Column title="Nom" dataIndex="last_name_employee" key="last_name_employee" />
              <Column title="Email" dataIndex="email_employee" key="email_employee" />
              <Column
                title="Actions"
                key="actions"
                render={(_, record) => (
                  <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEditClick(record)} />
                    <Button icon={<DeleteOutlined />} onClick={() => handleDeleteEmployee(record.employee_id)} danger />
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