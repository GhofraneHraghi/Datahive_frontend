import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  message,
  Avatar,
  Upload,
  Space,
  Layout,
  Divider,
  Spin
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined,
  MailOutlined,
  EditOutlined,
  CameraOutlined,
  SaveOutlined
} from '@ant-design/icons';
import axios from 'axios';
import NavbarAdmin from '../NavbarAdmin';
import './SeetingsPage.css';

const { Title } = Typography;
const { Content } = Layout;
const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || '';

const SettingsPage = () => {
  const [form] = Form.useForm();
  const [profileForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setPageLoading(true);
    try {
      // Get authentication data from localStorage
      const token = localStorage.getItem('token');
      const employeeId = localStorage.getItem('employeeId');
      
      // Debug logs
      console.log('Token available:', !!token);
      console.log('Employee ID:', employeeId);
      
      if (!token || !employeeId) {
        message.error('Session expirée. Veuillez vous reconnecter.');
        setPageLoading(false);
        // Redirect to login page would be helpful here
        // window.location.href = '/login-admin';
        return;
      }
       
      // Make sure the URL is constructed correctly
      const apiUrl = `${VITE_BACKEND_BASE_URL}/api/employee/${employeeId}`;
      console.log('API URL:', apiUrl);
      
      const response = await axios.get(apiUrl, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response:', response.data);
      setUserData(response.data);
      
      // Set form fields
      profileForm.setFieldsValue({
        firstName: response.data.firstName || response.data.first_name,
        lastName: response.data.lastName || response.data.last_name,
        email: response.data.email
      });

      if (response.data.profileImage) {
        setImageUrl(response.data.profileImage);
      }
    } catch (error) {
      console.error('Erreur fetch data:', error);
      
      // Handle different error types
      if (error.response) {
        console.log('Error response status:', error.response.status);
        console.log('Error response data:', error.response.data);
        
        if (error.response.status === 403) {
          message.error('Accès non autorisé. Vos droits sont insuffisants ou votre session a expiré.');
          // Consider clearing local storage and redirecting to login
          localStorage.removeItem('token');
          localStorage.removeItem('employeeId');
          // window.location.href = '/login-admin';
        } else if (error.response.status === 401) {
          message.error('Session expirée. Veuillez vous reconnecter.');
          // window.location.href = '/login-admin';
        } else {
          message.error('Erreur lors du chargement des données utilisateur');
        }
      } else {
        message.error('Erreur de connexion au serveur');
      }
    } finally {
      setPageLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const employeeId = localStorage.getItem('employeeId');
      
      if (!token || !employeeId) {
        message.error('Session expirée. Veuillez vous reconnecter.');
        setLoading(false);
        return;
      }
      
      await axios.put(`${VITE_BACKEND_BASE_URL}/api/employee/${employeeId}/password`, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      message.success('Mot de passe mis à jour avec succès');
      form.resetFields();
    } catch (error) {
      console.error('Erreur password change:', error);
      if (error.response?.status === 401) {
        message.error('Mot de passe actuel incorrect');
      } else {
        message.error(error.response?.data?.message || 'Erreur lors de la mise à jour du mot de passe');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (values) => {
    setProfileLoading(true);
    try {
      const token = localStorage.getItem('token');
      const employeeId = localStorage.getItem('employeeId');
      
      if (!token || !employeeId) {
        message.error('Session expirée. Veuillez vous reconnecter.');
        setProfileLoading(false);
        return;
      }
      
      await axios.put(`${VITE_BACKEND_BASE_URL}/api/employee/${employeeId}`, {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      message.success('Profil mis à jour avec succès');
      fetchUserData();
    } catch (error) {
      console.error('Erreur profile update:', error);
      message.error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const token = localStorage.getItem('token');
      const employeeId = localStorage.getItem('employeeId');
      
      if (!token || !employeeId) {
        message.error('Session expirée. Veuillez vous reconnecter.');
        return false;
      }
      
      const response = await axios.post(
        `${VITE_BACKEND_BASE_URL}/api/employee/${employeeId}/upload-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Mettre à jour l'URL de l'image avec le chemin renvoyé par le backend
      if (response.data.imagePath) {
        setImageUrl(`${VITE_BACKEND_BASE_URL}/uploads/${response.data.imagePath}`);
      }
      message.success('Photo de profil mise à jour');
    } catch (error) {
      console.error('Erreur image upload:', error);
      message.error('Erreur lors du téléchargement de l\'image');
    }
    return false; // Empêche le comportement par défaut de l'upload
  };

  const handleCollapse = (collapsed) => {
    setCollapsed(collapsed);
  };

  // Calculer la marge gauche dynamiquement en fonction de l'état du collapse
  const contentStyle = {
    marginLeft: collapsed ? '80px' : '250px',
    transition: 'all 0.2s ease',
    padding: '24px',
    minHeight: '100vh',
    background: '#f0f2f5'
  };

  if (pageLoading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <NavbarAdmin onCollapse={handleCollapse} />
        <Content style={contentStyle} className="settings-content">
          <div className="loading-container">
            <Spin size="large" tip="Chargement des données..." />
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <NavbarAdmin onCollapse={handleCollapse} />
      
      <Content style={contentStyle} className="settings-content">
        
          <Title className="page-header">Paramètres du compte</Title>
        
        
        <Card 
          title="Informations du profil" 
          className="profile-card" 
          variant="bordered"
          style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
        >
          <div className="profile-container-centered">
            <div className="avatar-section">
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={handleImageUpload}
              >
                <div className="avatar-upload">
                  <Avatar
                    size={130}
                    icon={<UserOutlined />}
                    src={imageUrl}
                    className="profile-avatar"
                  />
                  <div className="avatar-overlay">
                    <CameraOutlined className="camera-icon" />
                  </div>
                </div>
              </Upload>
              <Button 
                type="text" 
                icon={<CameraOutlined />}
                className="change-photo-btn"
              >
                Changer la photo
              </Button>
            </div>
            
            <Form
              form={profileForm}
              onFinish={handleProfileUpdate}
              layout="vertical"
              className="profile-form"
            >
              <Form.Item
                name="firstName"
                label="Prénom"
                rules={[{ required: true, message: 'Veuillez entrer votre prénom' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  className="modern-input" 
                />
              </Form.Item>
              
              <Form.Item
                name="lastName"
                label="Nom"
                rules={[{ required: true, message: 'Veuillez entrer votre nom' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  className="modern-input" 
                />
              </Form.Item>
              
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Veuillez entrer votre email' },
                  { type: 'email', message: 'Email invalide' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  className="modern-input" 
                  disabled
                  style={{ backgroundColor: '#f5f5f5', color: '#666' }}
                />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={profileLoading}
                  icon={<SaveOutlined />}
                  className="submit-button"
                >
                  Enregistrer les modifications
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Card>
        
        <Card 
          title="Sécurité" 
          className="password-card" 
          variant="bordered"
          style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
        >
          <Form
            form={form}
            onFinish={handlePasswordChange}
            layout="vertical"
            className="password-form"
          >
            <Form.Item
              name="currentPassword"
              label="Mot de passe actuel"
              rules={[{ required: true, message: 'Veuillez entrer votre mot de passe actuel' }]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                className="modern-input" 
              />
            </Form.Item>
            
            <Form.Item
              name="newPassword"
              label="Nouveau mot de passe"
              rules={[
                { required: true, message: 'Veuillez entrer un nouveau mot de passe' },
                { min: 8, message: 'Le mot de passe doit contenir au moins 8 caractères' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                className="modern-input" 
              />
            </Form.Item>
            
            <Form.Item
              name="confirmPassword"
              label="Confirmer le nouveau mot de passe"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Veuillez confirmer votre nouveau mot de passe' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                className="modern-input" 
              />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<LockOutlined />}
                className="submit-button"
              >
                Mettre à jour le mot de passe
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default SettingsPage;