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
  Layout,
  Divider,
  Spin
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined,
  MailOutlined,
  CameraOutlined,
  SaveOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Ajout de l'import manquant
import NavbarAdmin from '../NavbarAdmin';
import './SeetingsPage.css';

const { Title } = Typography;
const { Content } = Layout;
const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3000';

const SeetingsPage = () => {
  const [form] = Form.useForm();
  const [profileForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate(); // Ajout du hook navigate

  useEffect(() => {
    fetchUserData();
  }, []);

 // 2. Amélioration de fetchUserData pour mieux gérer les images
const fetchUserData = async () => {
  setPageLoading(true);
  try {
    const token = localStorage.getItem('token');
    const employeeId = localStorage.getItem('employeeId');

    if (!token || !employeeId) {
      throw new Error('Authentification requise');
    }

    const response = await axios.get(
      `${VITE_BACKEND_BASE_URL}/api/employee/${employeeId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Réponse brute de l\'API:', response.data);

    const employeeData = {
      id: response.data.id,
      firstName: response.data.firstName || '',
      lastName: response.data.lastName || '',
      email: response.data.email || '',
      profileImage: response.data.profileImage
    };

    console.log('Données employé:', employeeData);
    setUserData(employeeData);
    
    // Mise à jour du formulaire
    profileForm.setFieldsValue({
      firstName: employeeData.firstName,
      lastName: employeeData.lastName,
      email: employeeData.email
    });

    // Gestion améliorée de l'image de profil
    if (employeeData.profileImage) {
      let imageUrl;
      
      if (employeeData.profileImage.startsWith('http')) {
        imageUrl = employeeData.profileImage;
      } else {
        // Nettoyage du chemin pour enlever tout préfixe indésirable
        const cleanPath = employeeData.profileImage.replace(/^.*uploads\//, '');
        imageUrl = `${VITE_BACKEND_BASE_URL}/uploads/${cleanPath}`;
      }
      
      console.log('Image URL construite:', imageUrl);
      setImageUrl(imageUrl);
    } else {
      setImageUrl(null);
    }

  } catch (error) {
    console.error('Erreur complète:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.response?.status === 401) {
      localStorage.clear();
      navigate('/login');
    } else {
      message.error(error.response?.data?.message || 'Erreur de chargement des données');
    }
  } finally {
    setPageLoading(false);
  }
};

  const handleProfileUpdate = async (values) => {
    setProfileLoading(true);
    try {
      const token = localStorage.getItem('token');
      const employeeId = localStorage.getItem('employeeId');
      
      if (!token || !employeeId) {
        message.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }
      
      const response = await axios.put(
        `${VITE_BACKEND_BASE_URL}/api/employee/${employeeId}`,
        {
          first_name: values.firstName,
          last_name: values.lastName
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      message.success('Profil mis à jour avec succès');
      await fetchUserData(); // Recharger les données
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        message.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
      }
    } finally {
      setProfileLoading(false);
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
    
    // Add debugging
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('Employee ID:', employeeId);
    console.log('Backend URL:', VITE_BACKEND_BASE_URL);
    
    if (!token || !employeeId) {
      message.error('Session expirée. Veuillez vous reconnecter.');
      return;
    }
    
    const response = await axios.put(
      `${VITE_BACKEND_BASE_URL}/api/employee/${employeeId}/password`,
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      }, 
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    message.success('Mot de passe mis à jour avec succès');
    form.resetFields();
  } catch (error) {
    console.error('Full error object:', error);
    console.error('Error response:', error.response);
    
    if (error.response?.status === 401) {
      message.error('Mot de passe actuel incorrect ou session expirée');
      // Consider redirecting to login if token is invalid
      // localStorage.clear();
      // navigate('/login');
    } else if (error.response?.status === 403) {
      localStorage.clear();
      navigate('/login');
    } else {
      message.error(error.response?.data?.message || 'Erreur lors de la mise à jour du mot de passe');
    }
  } finally {
    setLoading(false);
  }
};

const handleImageUpload = async (file) => {
  console.log('=== FRONTEND IMAGE UPLOAD DEBUG ===');
  console.log('File details:', {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  });

  // Validation du fichier
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    console.log('File is not an image:', file.type);
    message.error('Vous ne pouvez télécharger que des fichiers image!');
    return false;
  }

  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    console.log('File too large:', file.size / 1024 / 1024, 'MB');
    message.error('L\'image doit être inférieure à 2MB!');
    return false;
  }

  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const token = localStorage.getItem('token');
    const employeeId = localStorage.getItem('employeeId');
    
    console.log('Auth details:', {
      token: token ? 'Present' : 'Missing',
      employeeId: employeeId,
      backendUrl: VITE_BACKEND_BASE_URL
    });
    
    if (!token || !employeeId) {
      message.error('Session expirée. Veuillez vous reconnecter.');
      return false;
    }
    
    const uploadUrl = `${VITE_BACKEND_BASE_URL}/api/employee/${employeeId}/upload-image`;
    console.log('Upload URL:', uploadUrl);
    
    console.log('Making upload request...');
    const response = await axios.post(uploadUrl, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Upload successful! Response:', response.data);
    
    if (response.data.imagePath) {
      let newImageUrl;
      
      if (response.data.imagePath.startsWith('http')) {
        newImageUrl = response.data.imagePath;
      } else {
        const cleanPath = response.data.imagePath.replace(/^.*uploads\//, '');
        newImageUrl = `${VITE_BACKEND_BASE_URL}/uploads/${cleanPath}`;
      }
      
      console.log('New image URL:', newImageUrl);
      setImageUrl(newImageUrl);
      message.success('Photo de profil mise à jour');
      
      // Rafraîchir les données
      await fetchUserData();
    }
  } catch (error) {
    console.error('=== UPLOAD ERROR DETAILS ===');
    console.error('Error object:', error);
    console.error('Response status:', error.response?.status);
    console.error('Response data:', error.response?.data);
    console.error('Response headers:', error.response?.headers);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.clear();
      navigate('/login');
    } else {
      const errorMessage = error.response?.data?.message || 'Erreur lors du téléchargement de l\'image';
      const errorDetails = error.response?.data?.details;
      
      message.error(`${errorMessage}${errorDetails ? ` (${errorDetails})` : ''}`);
    }
  }
  return false;
};

// Fonction pour tester la structure de la base de données (temporaire)
const testDatabaseStructure = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${VITE_BACKEND_BASE_URL}/api/debug/employee-structure`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Database structure:', response.data);
  } catch (error) {
    console.error('Error fetching DB structure:', error);
  }
};

// Fonction pour tester les données employé (temporaire)
const testEmployeeData = async () => {
  try {
    const token = localStorage.getItem('token');
    const employeeId = localStorage.getItem('employeeId');
    const response = await axios.get(`${VITE_BACKEND_BASE_URL}/api/debug/employee/${employeeId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Employee raw data:', response.data);
  } catch (error) {
    console.error('Error fetching employee data:', error);
  }
};

  const handleCollapse = (collapsed) => {
    setCollapsed(collapsed);
  };

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
          <div className="loading-container" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '60vh' 
          }}>
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
        <Title level={2} className="page-header">Paramètres du compte</Title>
        
        <Card 
          title="Informations du profil" 
          className="profile-card" 
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
                  placeholder="Entrez votre prénom"
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
                  placeholder="Entrez votre nom"
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
                placeholder="Mot de passe actuel"
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
                placeholder="Nouveau mot de passe"
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
                placeholder="Confirmer le nouveau mot de passe"
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

export default SeetingsPage;