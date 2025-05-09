import React, { useState } from "react";
import { Button, Card, Form, Input, Typography, message as antMessage } from "antd";
import { MailOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import Axios from "axios";
import { signInWithGoogle } from "../firebase";

const { Title, Text } = Typography;

const LoginAdmin = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  // Récupération de l'URL de base depuis les variables d'environnement Vite
  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  // Fonction pour gérer l'envoi du formulaire classique (email et mot de passe)
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await Axios.post(`${VITE_BACKEND_BASE_URL}/api/loginAdmin`, values);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("employeeId", response.data.employeeId);
        sessionStorage.setItem("currentemployee", JSON.stringify({
          id: response.data.employeeId,
          subscriptionStatus: null,
        }));

        antMessage.success("Connexion réussie !");
        navigate("/dashboard-admin");
      }
    } catch (err) {
      antMessage.error(err.response?.data?.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour gérer la connexion via Google
  const handleGoogleLogin = async () => {
    const user = await signInWithGoogle();
    if (user) {
      try {
        const response = await Axios.post(`${VITE_BACKEND_BASE_URL}/api/google-login`, {
          email: user.email,
        });

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("employeeId", response.data.employeeId);
          sessionStorage.setItem("currentemployee", JSON.stringify({
            id: response.data.employeeId,
            subscriptionStatus: null,
          }));

          antMessage.success("Connexion avec Google réussie !");
          navigate("/dashboard-admin");
        }
      } catch (err) {
        antMessage.error(
          err.response?.data?.message || "Erreur lors de la connexion avec Google"
        );
      }
    }
  };

  return (
    <div className="loginPage">
      <Card className="loginCard">
        <Title level={2} className="loginTitle">Welcome Back!</Title>

        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email", message: "Veuillez entrer un email valide!" }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[{ required: true, message: "Veuillez entrer votre mot de passe!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Enter password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Se connecter
            </Button>
          </Form.Item>
        </Form>

        <Button
          type="default"
          icon={<GoogleOutlined />}
          onClick={handleGoogleLogin}
          block
        >
          Se connecter avec Google
        </Button>

        <Text>
          Vous navez pas de compte ? <Link to="/register">Sinscrire</Link>
        </Text>
      </Card>
    </div>
  );
};

export default LoginAdmin;
