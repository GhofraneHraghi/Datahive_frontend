import { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Space, 
  Alert,
  theme 
} from 'antd';
import { 
  LockOutlined, 
  KeyOutlined,
  SafetyOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { useToken } = theme;

const ResetPassword = () => {
  const { token } = useParams();
  const [form] = Form.useForm();
  const { token: themeToken } = useToken();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(`${VITE_BACKEND_BASE_URL}/api/reset-password`, {
        token,
        password: values.password,
      });
      setMessage(response.data.message);
      setError('');
    } catch (error) {
      setError(error.response?.data?.error || 'Une erreur s\'est produite.');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <Card
        style={{
          width: 400,
          padding: '24px',
          borderRadius: '15px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }}
        bordered={false}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <SafetyOutlined 
              style={{ 
                fontSize: '48px', 
                color: themeToken.colorPrimary,
                marginBottom: '16px'
              }} 
            />
            <Title level={3} style={{ margin: 0 }}>
              Réinitialisation du mot de passe
            </Title>
            <Text type="secondary">
              Créez un nouveau mot de passe sécurisé
            </Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Veuillez entrer votre nouveau mot de passe' },
                { min: 8, message: 'Le mot de passe doit contenir au moins 8 caractères' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nouveau mot de passe"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              rules={[
                { required: true, message: 'Veuillez confirmer votre mot de passe' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<KeyOutlined />}
                placeholder="Confirmer le mot de passe"
                size="large"
              />
            </Form.Item>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            {message && (
              <Alert
                message={message}
                type="success"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{
                  height: '48px',
                  borderRadius: '8px',
                }}
              >
                Réinitialiser le mot de passe
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default ResetPassword;