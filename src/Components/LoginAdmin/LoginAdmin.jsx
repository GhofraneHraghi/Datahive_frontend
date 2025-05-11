import React, { useState } from "react";
import { Button, Card, Form, Input, Typography, message as antMessage, Divider } from "antd";
import { MailOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import { signInWithGoogle } from "../firebase";
import "./Login.css";

const { Title, Text } = Typography;

const LoginAdmin = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  // Fonction utilitaire pour gérer la sauvegarde des données utilisateur de manière uniforme
  const saveUserData = (data) => {
    console.log("Données reçues du serveur:", data); // Débugage
    
    // Vérifier que les données essentielles existent
    if (!data.employeeId && !data.token) {
      console.error("ERREUR: Données d'authentification incomplètes", data);
      antMessage.error("Erreur d'authentification: données incomplètes");
      return false;
    }
    
    // Stocker les données importantes dans localStorage (méthode principale)
    localStorage.setItem("token", data.token);
    localStorage.setItem("employeeId", data.employeeId);
    
    if (data.firstName) localStorage.setItem("firstName", data.firstName);
    if (data.lastName) localStorage.setItem("lastName", data.lastName);
    if (data.email) localStorage.setItem("email", data.email);
    
    // Maintenir la compatibilité avec sessionStorage
    const employeeData = {
      id: data.employeeId,
      email: data.email || "",
      firstName: data.firstName || "",
      lastName: data.lastName || "",
    };
    
    sessionStorage.setItem("currentemployee", JSON.stringify(employeeData));
    
    console.log("Authentification réussie - données sauvegardées:", {
      token: data.token ? "présent" : "manquant",
      employeeId: data.employeeId,
      sessionStorage: JSON.stringify(employeeData)
    });
    
    return true;
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await Axios.post(`${VITE_BACKEND_BASE_URL}/api/loginAdmin`, values);
      console.log("Réponse login normal:", response.data);
      
      if (response.data.token) {
        if (saveUserData(response.data)) {
          antMessage.success("Connexion réussie !");
          navigate("/dashboard-admin");
        }
      }
    } catch (err) {
      console.error("Erreur login normal:", err.response?.data || err);
      antMessage.error(err.response?.data?.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        const response = await Axios.post(`${VITE_BACKEND_BASE_URL}/api/google-loginAdmin`, {
          email: user.email,
        });
        
        console.log("Réponse Google login:", response.data);
        
        if (response.data.token) {
          // Structure normalisée pour tous les types de connexion
          const userData = {
            token: response.data.token,
            employeeId: response.data.employeeId || (response.data.user && response.data.user.id),
            firstName: response.data.firstName || (response.data.user && response.data.user.firstName),
            lastName: response.data.lastName || (response.data.user && response.data.user.lastName),
            email: response.data.email || (response.data.user && response.data.user.email) || user.email
          };
          
          if (saveUserData(userData)) {
            antMessage.success("Connexion Google réussie !");
            navigate("/dashboard-admin");
          }
        }
      }
    } catch (err) {
      console.error("Erreur Google login:", err.response?.data || err);
      antMessage.error(
        err.response?.data?.message || "Erreur lors de la connexion avec Google"
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-content">
        <Card className="login-card">
          <div className="login-header">
            <Title level={2} className="login-title">Admin Portal</Title>
            <Text className="login-subtitle">Sign in to access the admin dashboard</Text>
          </div>
          
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            className="login-form"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter your email!" },
                { type: "email", message: "Invalid email address!" }
              ]}
            >
              <Input
                prefix={<MailOutlined className="input-icon" />}
                placeholder="Enter your email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please enter your password!" }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="input-icon" />}
                placeholder="Enter your password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="submit-btn"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <Divider className="divider">or continue with</Divider>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              icon={<GoogleOutlined />}
              onClick={handleGoogleLogin}
              loading={googleLoading}
              size="large"
              className="google-btn"
            >
              Sign in with Google
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginAdmin;