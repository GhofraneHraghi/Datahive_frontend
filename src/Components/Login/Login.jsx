import { useState } from "react";
import { Form, Input, Button, Card, Typography, Row, Col, message as antMessage, Divider } from "antd";
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
  const navigate = useNavigate();
  
  // Récupération de l'URL de base depuis les variables d'environnement Vite
  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const fetchSubscriptionInfo = async (userId, token) => {
    try {
      const response = await axios.get(`${VITE_BACKEND_BASE_URL}/api/user-subscription/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.subscription;
    } catch (error) {
      console.error("Error fetching subscription info:", error);
      return null;
    }
  };

  const processUserData = async (responseData) => {
    const { user, token } = responseData;
    
    // Always fetch subscription info for all users
    const subscriptionInfo = await fetchSubscriptionInfo(user.id, token);
    
    // Create unified user data object
    const userData = {
      id: user.id,
      role_id: user.role_id,
      email: user.email,
      permissions: user.permissions,
      subscription_id: user.subscription_id || null,
      has_active_subscription: subscriptionInfo?.status === 'active'
    };

    // Store user data and token in localStorage
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("authToken", token);
    
    // Navigate to dashboard
    navigate("/dashboard");
  };

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(`${VITE_BACKEND_BASE_URL}/api/login`, {
        email: values.email,
        password: values.password,
      });
  
      if (response.data.token) {
        await processUserData(response.data);
        antMessage.success("Connexion réussie !");
      }
    } catch (error) {
      antMessage.error(error.response?.data?.message || "Échec de la connexion");
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
  
      if (response.data.token) {
        await processUserData(response.data);
        antMessage.success("Connexion Google réussie !");
      }
    } catch (error) {
      antMessage.error(error.response?.data?.message || "Échec Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      <Card className="login-card">
        <div className="login-header">
          <Title level={2} className="login-title">Sign In to Your Account</Title>
          <Text className="login-subtitle">Welcome back! Please enter your details.</Text>
        </div>
        <Form
          form={form}
          onFinish={handleLogin}
          layout="vertical"
          className="login-form"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                message: "Please enter your email!",
              },
              {
                type: "email",
                message: "Invalid email address!",
              }
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
              {
                required: true,
                message: "Please enter your password!",
              }
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

        <Divider plain>Or</Divider>

        <Button
          icon={<GoogleOutlined />}
          onClick={handleGoogleLogin}
          loading={googleLoading}
          block
          size="large"
          className="google-btn"
        >
          Sign in with Google
        </Button>

        <div className="login-footer">
          <Text>
            Dont have an account?{" "}
            <Link to="/register" className="register-link">
              Register
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;