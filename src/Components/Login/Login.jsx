import { useState } from "react";
import { Form, Input, Button, Card, Typography, Divider, Modal, message } from "antd";
import { MailOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import "./Login.css";

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();
  
  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  const fetchSubscriptionInfo = async (userId, token) => {
    try {
      const response = await axios.get(`${VITE_BACKEND_BASE_URL}/api/user-subscription/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.subscription;
    } catch (error) {
      console.error("Erreur lors de la récupération des informations d'abonnement:", error);
      return null;
    }
  };

  const processUserData = async (responseData) => {
    const { user, token } = responseData;
    const subscriptionInfo = await fetchSubscriptionInfo(user.id, token);
    
    const userData = {
      id: user.id,
      tenant_id: user.tenant_id,
      role_id: user.role_id,
      email: user.email,
      permissions: user.permissions,
      subscription_id: user.subscription_id || null,
      has_active_subscription: subscriptionInfo?.status === 'active'
    };

    console.log('Données utilisateur stockées:', userData);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    navigate("/dashboard");
  };

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(`${VITE_BACKEND_BASE_URL}/api/login`, {
        email: values.email,
        password: values.password,
      });
      
      console.log('Réponse de connexion:', response.data);
      
      if (response.data.token) {
        await processUserData(response.data);
        message.success("Connexion réussie !");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Échec de la connexion");
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const response = await axios.post(`${VITE_BACKEND_BASE_URL}/api/google-login`, {
        email: result.user.email,
      });
      
      console.log('Réponse de connexion Google:', response.data);
  
      if (response.data.token) {
        await processUserData(response.data);
        message.success("Connexion Google réussie !");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Échec de la connexion Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResetPasswordRequest = async () => {
    if (!resetEmail) {
      message.error("Veuillez entrer votre adresse e-mail");
      return;
    }

    setResetLoading(true);
    try {
      const response = await axios.post(`${VITE_BACKEND_BASE_URL}/api/reset-password-request`, {
        email: resetEmail
      });
      
      message.success(response.data.message || "Un email de réinitialisation a été envoyé");
      setResetModalVisible(false);
    } catch (error) {
      message.error(error.response?.data?.message || "Erreur lors de la demande de réinitialisation");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-content">
        <Card className="login-card">
          <div className="login-header">
            <Title level={2} className="login-title">Bienvenue sur Data Hive</Title>
            <Text className="login-subtitle">Connectez-vous pour accéder à votre compte</Text>
          </div>
          
          <Form
            form={form}
            onFinish={handleLogin}
            layout="vertical"
            className="login-form"
          >
            <Form.Item
              name="email"
              label="Adresse e-mail"
              rules={[
                { required: true, message: "Veuillez saisir votre email" },
                { type: "email", message: "Format d'email invalide" }
              ]}
            >
              <Input
                prefix={<MailOutlined className="input-icon" />}
                placeholder="Entrez votre email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mot de passe"
              rules={[
                { required: true, message: "Veuillez saisir votre mot de passe" }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="input-icon" />}
                placeholder="Entrez votre mot de passe"
                size="large"
              />
            </Form.Item>

            <div className="forgot-password-container">
              <Button 
                type="link" 
                onClick={() => setResetModalVisible(true)}
                className="forgot-password-btn"
              >
                Mot de passe oublié ?
              </Button>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="submit-btn"
              >
                Se connecter
              </Button>
            </Form.Item>
          </Form>

          <Divider className="divider">ou continuer avec</Divider>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              icon={<GoogleOutlined />}
              onClick={handleGoogleLogin}
              loading={googleLoading}
              size="large"
              className="google-btn"
            >
              Se connecter avec Google
            </Button>
          </div>

          <div className="login-footer">
            <Text className="footer-text">
              Vous n'avez pas de compte ?{' '}
              <Link to="/register" className="register-link">
                Créer un compte
              </Link>
            </Text>
          </div>
        </Card>
      </div>

      <Modal
        title="Réinitialisation du mot de passe"
        open={resetModalVisible}
        onCancel={() => setResetModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setResetModalVisible(false)}>
            Annuler
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={resetLoading}
            onClick={handleResetPasswordRequest}
          >
            Envoyer le lien
          </Button>,
        ]}
      >
        <p>Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation</p>
        <Input
          prefix={<MailOutlined />}
          placeholder="Votre adresse e-mail"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          size="large"
          style={{ marginTop: 16 }}
          onPressEnter={handleResetPasswordRequest}
        />
      </Modal>
    </div>
  );
};

export default Login;