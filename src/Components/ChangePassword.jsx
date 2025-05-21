import { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Space, 
  Alert, 
  Spin,
  theme 
} from 'antd';
import { 
  LockOutlined, 
  KeyOutlined, 
  LoadingOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { useToken } = theme;

const ChangePassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { token: themeToken } = useToken();
  const [form] = Form.useForm();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  const handleSubmit = async (values) => {
    setLoading(true);

    if (values.newPassword !== values.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${VITE_BACKEND_BASE_URL}/api/change-password`, {
        token,
        newPassword: values.newPassword,
      });

      setMessage(response.data.message);
      setError('');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
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
            <LockOutlined 
              style={{ 
                fontSize: '48px', 
                color: themeToken.colorPrimary,
                marginBottom: '16px'
              }} 
            />
            <Title level={3} style={{ margin: 0 }}>
              Modifier votre mot de passe
            </Title>
            <Text type="secondary">
              Entrez votre nouveau mot de passe ci-dessous
            </Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Form.Item
              name="newPassword"
              rules={[
                { required: true, message: 'Veuillez entrer votre nouveau mot de passe' },
                { min: 8, message: 'Le mot de passe doit contenir au moins 8 caractères' }
              ]}
            >
              <Input.Password
                prefix={<KeyOutlined />}
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
                    if (!value || getFieldValue('newPassword') === value) {
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
                icon={<CheckCircleOutlined />}
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
                {loading ? 'Modification en cours...' : 'Modifier le mot de passe'}
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default ChangePassword;