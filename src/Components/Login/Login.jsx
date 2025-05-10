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
      console.error("Error fetching subscription info:", error);
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
  
      if (response.data.token) {
        await processUserData(response.data);
        message.success("Connexion Google réussie !");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Échec Google");
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
            <Title level={2} className="login-title">Welcome Back</Title>
            <Text className="login-subtitle">Sign in to continue to your account</Text>
          </div>
          
          <Form
            form={form}
            onFinish={handleLogin}
            layout="vertical"
            className="login-form"
          >
            <Form.Item
              name="email"
              label="Email Address"
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

            <div className="forgot-password-container">
              <Button 
                type="link" 
                onClick={() => setResetModalVisible(true)}
                className="forgot-password-btn"
              >
                Forgot password?
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

          <div className="login-footer">
            <Text className="footer-text">
              Dont have an account?{" "}
              <Link to="/register" className="register-link">
                Sign up
              </Link>
            </Text>
          </div>
        </Card>
      </div>

      {/* Reset Password Modal (identique) */}
      <Modal
        title="Reset Password"
        open={resetModalVisible}
        onCancel={() => setResetModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setResetModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={resetLoading}
            onClick={handleResetPasswordRequest}
          >
            Send Reset Link
          </Button>,
        ]}
      >
        <p>Enter your email address to receive a password reset link</p>
        <Input
          prefix={<MailOutlined />}
          placeholder="Your email address"
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