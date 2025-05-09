import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import './Profile.css';
import {
  Layout,
  Typography,
  Card,
  Form,
  Input,
  Button,
  Select,
  Divider,
  Row,
  Col,
  message,
  Badge,
  Skeleton,
  Space,
  Modal,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  CreditCardOutlined,
  LockOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import i18n from 'i18n-iso-countries';
import fr from 'i18n-iso-countries/langs/fr.json';
import Navbar from "../Dashboard/Navbar"; // Importation du composant Navbar
import axios from "axios";

// Initialiser i18n avec la langue française
i18n.registerLocale(fr);

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companyForm] = Form.useForm();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [editingCompany, setEditingCompany] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [phone, setPhone] = useState(''); // Pour le numéro de téléphone
  const [country, setCountry] = useState('TN'); // Pour le pays
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const navigate = useNavigate();

  // Gestion du collapse de la barre latérale
  const handleSiderCollapse = (collapsed) => {
    setSiderCollapsed(collapsed);
  };

  // Récupération de l'URL de base depuis les variables d'environnement Vite
  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      const userId = JSON.parse(localStorage.getItem('user')).id;

      if (!token || !userId) {
        message.error("Vous n'êtes pas connecté");
        navigate("/login");
        return;
      }

      try {
        const response = await Axios.get(`${VITE_BACKEND_BASE_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserData(response.data);

        // Set initial form values
        companyForm.setFieldsValue({
          company: response.data.company,
          number_of_employees: response.data.number_of_employees,
        });

        profileForm.setFieldsValue({
          email: response.data.email,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          country: response.data.country,
          phone_number: response.data.phone_number,
        });

        // Mettre à jour les états pour le numéro de téléphone et le pays
        setPhone(response.data.phone_number || '');
        setCountry(response.data.country || 'TN');

        setLoading(false);
      } catch (error) {
        message.error("Erreur lors du chargement des données utilisateur");
        console.error(error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, companyForm, profileForm]);

  // Handle company update
  const handleCompanyUpdate = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
  
      if (!token || !user) {
        message.error("Vous n'êtes pas connecté");
        navigate('/login');
        return;
      }
      setLoading(true); // Activez le loading
  
      const response = await axios.put(
        `${VITE_BACKEND_BASE_URL}/api/users/${user.id}/company`,
        {
          company_name: values.company,
          number_of_employees: values.number_of_employees
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data.success) {
        message.success("Informations de l'entreprise mises à jour");
        // Mettre à jour l'état local si nécessaire
        setUserData(prev => ({
          ...prev,
          company: values.company,
          number_of_employees: values.number_of_employees
        }));
        setEditingCompany(false); // Ajoutez cette ligne pour fermer le mode édition
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    }
    setLoading(false); // Désactivez le loading
  };

  // Handle profile update
 // Handle profile update - Version corrigée
const handleProfileUpdate = async (values) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;

  if (!token || !userId) {
    message.error("Session invalide - Veuillez vous reconnecter");
    navigate("/login");
    return;
  }

  setLoading(true);
  try {
    const response = await Axios.put(
      `${VITE_BACKEND_BASE_URL}/api/users/${userId}/profile`,
      { 
        ...values, 
        phone_number: phone,
        country 
      },
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      // Mise à jour complète des données utilisateur
      setUserData(response.data.user);
      
      // Mise à jour du localStorage si nécessaire
      localStorage.setItem('user', JSON.stringify({
        ...user,
        ...response.data.user
      }));

      message.success(response.data.message);
      setEditingProfile(false);
    } else {
      throw new Error(response.data.message || "Mise à jour échouée");
    }
  } catch (error) {
    console.error('Erreur détaillée:', {
      error: error.response?.data || error.message,
      request: error.config
    });

    // Affichage d'un message d'erreur approprié
    const errorMessage = error.response?.data?.message || 
      "Échec de la mise à jour du profil. Veuillez réessayer.";

    message.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  // Handle password update
  const handlePasswordUpdate = async (values) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    setLoading(true);
    try {
      const response = await Axios.put(
        `${VITE_BACKEND_BASE_URL}/api/users/${userId}/password`,
        values,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      message.success("Mot de passe mis à jour avec succès");
      setEditingPassword(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error("Erreur lors de la mise à jour du mot de passe");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    message.success("Vous avez été déconnecté");
    navigate("/login");
  };

  // Handle reset password request
  const handleResetPasswordRequest = async () => {
    if (!userData || !userData.email) {
      message.error("Adresse e-mail non disponible");
      return;
    }

    setLoading(true);
    try {
      const response = await Axios.post(
        `${VITE_BACKEND_BASE_URL}/api/reset-password-request`,
        { email: userData.email }
      );

      message.success("Un e-mail de réinitialisation de mot de passe a été envoyé à votre adresse e-mail");
      setIsResetModalVisible(false);
    } catch (error) {
      message.error("Erreur lors de l'envoi de l'e-mail de réinitialisation");
      console.error('Axios error details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="profile-container">
      {/* Intégration de la Navbar */}
      <Navbar onCollapse={handleSiderCollapse} />

      <Layout style={{ 
        marginLeft: window.innerWidth < 768 ? 0 : (siderCollapsed ? 80 : 250), 
        transition: "margin-left 0.2s",
        
      }}>
        <Content style={{ 
          margin: window.innerWidth < 768 ? "64px 16px 0" : "24px 16px 0", 
          overflow: "initial" 
        }}>
          <div style={{ padding: 24 }}>
            <div className="profile-header">
              
                <Title level={2} className="profile-title">Mon Profil</Title>
                <Button 
                  danger 
                  icon={<LogoutOutlined />} 
                  onClick={handleLogout}
                >
                  Déconnexion
                </Button>
            </div>

            {loading ? (
              <Skeleton active paragraph={{ rows: 10 }} />
            ) : (
              <>
                {/* Company Details Section */}
                <Card
                   className="profile-card"
                  title={
                    <Title level={4}>
                      <BankOutlined /> Détails de lentreprise
                    </Title>
                  }
                  extra={
                    editingCompany ? (
                      <Space>
                        <Button
                          icon={<CloseOutlined />}
                          onClick={() => {
                            setEditingCompany(false);
                            companyForm.resetFields();
                          }}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="primary"
                          icon={<SaveOutlined />}
                          onClick={() => companyForm.submit()}
                        >
                          Enregistrer
                        </Button>
                      </Space>
                    ) : (
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => setEditingCompany(true)}
                      >
                        Modifier
                      </Button>
                    )
                  }
                  style={{ marginBottom: 24 }}
                >
                  <Form
                    form={companyForm}
                    layout="vertical"
                    onFinish={handleCompanyUpdate}
                    disabled={!editingCompany}
                  >
                    <Row gutter={24}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="company"
                          label="Nom de l'entreprise"
                          rules={[
                            { required: true, message: "Le nom de l'entreprise est requis" },
                          ]}
                        >
                          <Input prefix={<BankOutlined />} placeholder="Nom de l'entreprise" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="number_of_employees"
                          label="Nombre d'employés"
                          rules={[
                            { required: true, message: "Le nombre d'employés est requis" },
                          ]}
                        >
                          <Select placeholder="Sélectionnez le nombre d'employés">
                            <Option value="0-10">0-10</Option>
                            <Option value="10-100">10-100</Option>
                            <Option value="+100">+100</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </Card>

                {/* Profile Information Section */}
                <Card
                  className="profile-card"
                  title={
                    <Title level={3}>
                      <UserOutlined /> Informations du profil
                    </Title>
                  }
                  extra={
                    editingProfile ? (
                      <Space>
                        <Button
                          icon={<CloseOutlined />}
                          onClick={() => {
                            setEditingProfile(false);
                            profileForm.resetFields();
                          }}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="primary"
                          icon={<SaveOutlined />}
                          onClick={() => profileForm.submit()}
                        >
                          Enregistrer
                        </Button>
                      </Space>
                    ) : (
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => setEditingProfile(true)}
                      >
                        Modifier
                      </Button>
                    )
                  }
                  style={{ marginBottom: 24 }}
                >
                  <Form className="profile-form"
                    form={profileForm}
                    layout="vertical"
                    onFinish={handleProfileUpdate}
                    disabled={!editingProfile}
                  >
                    <Row gutter={24}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="email"
                          label="Email"
                          
                          rules={[
                            { required: true, type: "email", message: "Veuillez entrer un email valide" },
                          ]}
                        >
                          <Input
                            prefix={<MailOutlined />}
                            readOnly  
                            placeholder="Email"
                            
                            disabled={!userData?.role} // Désactiver le champ e-mail si l'utilisateur n'est pas admin
                            style={{
                              color: '#888',  // Texte gris
                              backgroundColor: '#f5f5f5',  // Fond gris clair
                              cursor: 'not-allowed'  // Curseur 
                            }}/>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="phone_number"
                          label="Numéro de téléphone"
                          rules={[
                            { required: true, message: "Veuillez entrer un numéro de téléphone valide" },
                          ]}
                        >
                          <PhoneInput
                            international
                            defaultCountry={country}
                            value={phone}
                            onChange={setPhone}
                            placeholder="Entrez votre numéro de téléphone"
                            disabled={!editingProfile} // Désactiver le champ si le formulaire est en mode lecture
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={24}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="first_name"
                          label="Prénom"
                          rules={[
                            { required: true, message: "Le prénom est requis" },
                          ]}
                        >
                          <Input prefix={<UserOutlined />} placeholder="Prénom" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="last_name"
                          label="Nom"
                          rules={[
                            { required: true, message: "Le nom est requis" },
                          ]}
                        >
                          <Input prefix={<UserOutlined />} placeholder="Nom" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      name="country"
                      label="Pays"
                      rules={[
                        { required: true, message: "Veuillez sélectionner un pays" },
                      ]}
                    >
                      <Select
                        showSearch
                        placeholder="Sélectionnez un pays"
                        optionFilterProp="children"
                        onChange={(value) => setCountry(value)}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().includes(input.toLowerCase())
                        }
                      >
                        {Object.entries(i18n.getNames('fr')).map(([code, name]) => (
                          <Option key={code} value={code}>
                            {name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Form>
                </Card>

                {/* Password Update Section - Now with button in the section */}
                <Card
                    className="profile-card password-section"
                  title={
                    <Title level={3}>
                      <LockOutlined /> Mot de passe
                    </Title>
                  }
                  style={{ marginBottom: 24 }}
                >
                  <Row gutter={24} align="middle">
                    <Col xs={24} sm={16}>
                      <Text>Pour des raisons de sécurité, vous pouvez changer votre mot de passe en cliquant sur le bouton "Changer mot de passe". Un lien de réinitialisation vous sera envoyé par e-mail.</Text>
                    </Col>
                    <Col xs={24} sm={8} style={{ textAlign: 'right', marginTop: window.innerWidth < 768 ? 16 : 0 }}>
                      <Button 
                        type="primary" 
                        icon={<LockOutlined />} 
                        onClick={() => setIsResetModalVisible(true)}
                      >
                        Changer mot de passe
                      </Button>
                    </Col>
                  </Row>
                </Card>

                {/* Subscription Section */}
                <Card
                  
                  className="profile-card"
                  title={
                    <Title level={3}>
                      <CreditCardOutlined /> Abonnement
                    </Title>
                  }
                >
                  <Row gutter={24} align="middle">
                    <Col xs={24} sm={12}>
                      <Text strong>Statut : </Text>
                      {userData?.subscription?.status=== "active" ? (
                        <Badge 
                        className="subscription-badge-inactive"
                        status="success" text="Actif" />
                      ) : (
                        <Badge 
                        className="subscription-badge-inactive"
                        status="error" text="Inactif" />
                      )}
                    </Col>
                    <Col xs={24} sm={12}>
                      <Text strong>Plan : </Text>
                      <Text>{userData?.subscription?.plan_name || "Aucun plan actif"}</Text>
                    </Col>
                    {userData?.subscription?.expiration_date && (
                      <Col xs={24} style={{ marginTop: 12 }}>
                        <Text strong>Date dexpiration : </Text>
                        <Text>{new Date(userData.subscription.expiration_date).toLocaleDateString()}</Text>
                      </Col>
                    )}
                    <Col xs={24} style={{ marginTop: 20 }}>
                      <Button type="primary" href="/subscription-plans">
                        Gérer mon abonnement
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </>
            )}
          </div>
        </Content>
      </Layout>

      {/* Modal for Password Reset Request */}
      <Modal
        title="Réinitialisation du mot de passe"
        visible={isResetModalVisible}
        onCancel={() => setIsResetModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsResetModalVisible(false)}>
            Annuler
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={loading} 
            onClick={handleResetPasswordRequest}
          >
            Envoyer le lien de réinitialisation
          </Button>,
        ]}
      >
        <p>Un lien de réinitialisation du mot de passe sera envoyé à votre adresse e-mail : <strong>{userData?.email}</strong></p>
        <p>Ce lien vous permettra de créer un nouveau mot de passe sécurisé.</p>
      </Modal>
    </Layout>
  );
};

export default Profile;