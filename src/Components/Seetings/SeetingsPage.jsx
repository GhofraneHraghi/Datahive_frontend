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
  Space
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined,
  MailOutlined,
  EditOutlined,
  CameraOutlined 
} from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || '';

const SettingsPage = () => {
  const [form] = Form.useForm();
  const [profileForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const employeeId = localStorage.getItem('employeeId');
      
      if (!token || !employeeId) {
        message.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      console.log('Trying to fetch data for employee:', employeeId);
      console.log('Using token:', token ? `${token.substring(0, 10)}...` : 'No token');
      
      const response = await axios.get(`${VITE_BACKEND_BASE_URL}/api/employee/${employeeId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('User data received:', response.data);
      setUserData(response.data);
      
      // Adaptation des noms de champs pour le formulaire
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
      console.error('Response:', error.response);
      
      if (error.response?.status === 403) {
        message.error('Accès non autorisé. Vos droits sont insuffisants ou votre session a expiré.');
      } else if (error.response?.status === 401) {
        message.error('Session expirée. Veuillez vous reconnecter.');
        // Rediriger vers la page de connexion si nécessaire
        // window.location.href = '/login';
      } else {
        message.error('Erreur lors du chargement des données utilisateur');
      }
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
      
      // Adaptation des noms de champs pour l'API
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

  return (
    <div className="settings-page">
      <Title level={2} style={{ marginBottom: 24 }}>Paramètres du compte</Title>
      
      <Card title="Informations du profil" style={{ marginBottom: 24 }}>
        <Space size="large" align="start">
          <div style={{ textAlign: 'center' }}>
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleImageUpload}
            >
              <Avatar
                size={128}
                icon={<UserOutlined />}
                src={imageUrl}
                style={{ cursor: 'pointer' }}
              />
              <div style={{ marginTop: 8 }}>
                <Button icon={<CameraOutlined />} type="link">
                  Changer la photo
                </Button>
              </div>
            </Upload>
          </div>
          
          <Form
            form={profileForm}
            onFinish={handleProfileUpdate}
            layout="vertical"
            style={{ flex: 1 }}
          >
            <Form.Item
              name="firstName"
              label="Prénom"
              rules={[{ required: true, message: 'Veuillez entrer votre prénom' }]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>
            
            <Form.Item
              name="lastName"
              label="Nom"
              rules={[{ required: true, message: 'Veuillez entrer votre nom' }]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Veuillez entrer votre email' },
                { type: 'email', message: 'Email invalide' }
              ]}
            >
              <Input prefix={<MailOutlined />} />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={profileLoading}
                icon={<EditOutlined />}
              >
                Mettre à jour le profil
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
      
      <Card title="Changer le mot de passe">
        <Form
          form={form}
          onFinish={handlePasswordChange}
          layout="vertical"
        >
          <Form.Item
            name="currentPassword"
            label="Mot de passe actuel"
            rules={[{ required: true, message: 'Veuillez entrer votre mot de passe actuel' }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          
          <Form.Item
            name="newPassword"
            label="Nouveau mot de passe"
            rules={[
              { required: true, message: 'Veuillez entrer un nouveau mot de passe' },
              { min: 8, message: 'Le mot de passe doit contenir au moins 8 caractères' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
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
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<LockOutlined />}
            >
              Changer le mot de passe
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SettingsPage;