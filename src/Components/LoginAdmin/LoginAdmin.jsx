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
  try {
    if (!data?.token || !data?.employeeId) {
      throw new Error("Données d'authentification invalides");
    }

    // Utilisez les mêmes noms de clés partout
    localStorage.setItem("token", data.token);
    localStorage.setItem("employeeId", data.employeeId.toString());
    
    if (data.firstName) localStorage.setItem("firstName", data.firstName);
    if (data.lastName) localStorage.setItem("lastName", data.lastName);
    if (data.email) localStorage.setItem("email", data.email);

    return true;
  } catch (error) {
    console.error("Erreur saveUserData:", error);
    antMessage.error("Erreur de sauvegarde des données");
    return false;
  }
};

const handleGoogleLogin = async () => {
  setGoogleLoading(true);
  try {
    const user = await signInWithGoogle();
    if (!user) throw new Error("Google auth failed");

    const response = await Axios.post(
      `${VITE_BACKEND_BASE_URL}/api/google-loginAdmin`,
      { email: user.email }
    );

    console.log("API Response:", response.data); // Debug

    if (response.data.token) {
      // 1. Sauvegarde synchrone
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("employeeId", response.data.employeeId.toString());

      // 2. Force un re-render avant navigation
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 3. Deux méthodes de redirection (essayez les deux)
      // Méthode A:
      window.location.href = "/dashboard-admin";
      
      // OU Méthode B:
      // navigate("/dashboard-admin", { replace: true, state: { from: "google-login" } });
      
      // 4. Debug supplémentaire
      console.log("Redirection déclenchée vers /dashboard-admin");
    }
  } catch (err) {
    console.error("Google login error:", {
      error: err,
      response: err.response?.data
    });
    antMessage.error(err.response?.data?.message || "Échec de la connexion Google");
  } finally {
    setGoogleLoading(false);
  }
};

const onFinish = async (values) => {
  setLoading(true);
  try {
    const response = await Axios.post(`${VITE_BACKEND_BASE_URL}/api/loginAdmin`, {
      email: values.email,
      password: values.password
    });
    
    if (response.data.token) {
      const userData = {
        token: response.data.token,
        employeeId: response.data.employeeId,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email
      };
      
      if (saveUserData(userData)) {
        antMessage.success("Connexion réussie !");
        navigate("/dashboard-admin");
      }
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 
                        (err.response?.data?.code === "EMPLOYEE_NOT_FOUND" 
                          ? "Compte non trouvé. Contactez l'administrateur." 
                          : "Erreur lors de la connexion");
    antMessage.error(errorMessage);
  } finally {
    setLoading(false);
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