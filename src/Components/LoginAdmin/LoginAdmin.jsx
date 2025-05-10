import React, { useState } from "react";
import { Button, Card, Form, Input, Typography, message as antMessage, Divider } from "antd";
import { MailOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import { signInWithGoogle } from "../firebase";
import "./Login.css"; // Utilisez le même fichier CSS que votre page Login

const { Title, Text } = Typography;

const LoginAdmin = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
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
      } finally {
        setGoogleLoading(false);
      }
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