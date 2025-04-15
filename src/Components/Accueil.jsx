import { useEffect, useState } from 'react';
import { Card, Steps, Button, Input, Upload, message, Form, Row, Col, Typography } from 'antd';
import { CopyOutlined, UploadOutlined } from '@ant-design/icons';
//import { Navigate } from 'react-router-dom';
import axios from 'axios';

const { Step } = Steps;
const { Title, Text } = Typography;

const InvitationStep = () => {
  const handleCopy = () => {
    navigator.clipboard.writeText('test-google-play-console@pc-api-4722596725443039036-6');
    message.success('Email copié !', 2);
  };

  return (
    <Card title="Étape 1 - Invitation" style={{ marginBottom: 24 }}>
      <Text>
        Sur votre Play Console, commencez par ouvrir le menu Utilisateurs et permissions. Voir l exemple
      </Text>
      <Form.Item label="Email d'invitation" style={{ marginTop: 16 }}>
        <Input.Group compact>
          <Input
            style={{ width: 'calc(100% - 100px)' }}
            defaultValue="test-google-play-console@pc-api-4722596725443039036-6"
            readOnly
          />
          <Button icon={<CopyOutlined />} onClick={handleCopy}>
            Copier
          </Button>
        </Input.Group>
      </Form.Item>
    </Card>
  );
};

const Accueil = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [bucketURI, setBucketURI] = useState('');
  const [keyFile, setKeyFile] = useState(null);
  const [tenantName, setTenantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  

  useEffect(() => {
    const checkSubscription = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }
  
      try {
        const additionalUserId = localStorage.getItem('additionalUserId');
        let hasActivePlan = false;
  
        if (additionalUserId) {
          try {
            const res = await axios.get(`http://localhost:3001/api/additional-users/${additionalUserId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            // Debug: Afficher la réponse complète
            console.log('Réponse utilisateur supplémentaire:', res.data);
            
            // Vérification plus robuste
            const subscriptions = res.data?.subscriptions || res.data?.subscription || [];
            hasActivePlan = subscriptions.some(sub => 
              sub.status?.toLowerCase() === 'active' || 
              sub.subscriptionStatus?.toLowerCase() === 'active'
            );
          } catch (error) {
            console.error('Erreur vérification abonnement supplémentaire:', error);
            hasActivePlan = false;
          }
        } else {
          try {
            const res = await axios.get('http://localhost:3001/api/user-data', {
              headers: { Authorization: `Bearer ${token}` },
            });
            hasActivePlan = res.data?.user?.subscriptions?.some(s => 
              s.status?.toLowerCase() === 'active'
            );
          } catch (error) {
            console.error('Erreur vérification abonnement principal:', error);
            hasActivePlan = false;
          }
        }
  
        if (!hasActivePlan) {
          window.location.href = '/subscription-plans';
        }
      } catch (error) {
        console.error('Erreur générale vérification abonnement:', error);
      }
    };
  
    checkSubscription();
  }, []);
  const handleFileChange = (info) => {
    setKeyFile(info.file);
  };

  const handleBucketURIChange = (e) => {
    setBucketURI(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      if (!bucketURI || !keyFile || !tenantName) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      setLoading(true);
      
      const formData = new FormData();
      formData.append('bucketURI', bucketURI);
      formData.append('sourceName', tenantName);
      formData.append('keyFile', keyFile);

      const response = await fetch('http://localhost:3001/process-bucket', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur de traitement');
      }

      const data = await response.json();
      messageApi.success(`Configuration réussie pour ${tenantName}`);
      
      // Réinitialisation après succès
      form.resetFields();
      setKeyFile(null);
      setCurrentStep(0);
      
    } catch (error) {
      messageApi.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Invitation',
      content: <InvitationStep />,
    },
    {
      title: 'Configuration GCS',
      content: (
        <>
          <Form.Item label="URI GCS" name="bucketURI" rules={[{ required: true }]}>
            <Input
              placeholder="gs://nom-bucket"
              value={bucketURI}
              onChange={handleBucketURIChange}
            />
          </Form.Item>
          <Form.Item 
            label="Fichier d'identification" 
            name="keyFile"
            rules={[{ required: true, message: 'Fichier requis' }]}
          >
            <Upload
              accept=".json"
              beforeUpload={(file) => {
                setKeyFile(file);
                return false;
              }}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>
                {keyFile ? keyFile.name : 'Sélectionner un fichier'}
              </Button>
            </Upload>
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Configuration Tenant',
      content: (
        <>
          <Form.Item 
            label="Nom du Tenant" 
            name="tenantName"
            rules={[{ required: true, message: 'Nom requis' }]}
          >
            <Input
              placeholder="Nom de l'organisation"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              onClick={handleSubmit}
              loading={loading}
              block
            >
              Configurer le tenant
            </Button>
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}
      <Row justify="center">
        <Col span={24} style={{ textAlign: 'center' }}>
          <Title level={2}>Configuration BigDeal</Title>
          <Text type="secondary">Gestion des données multi-tenants</Text>
        </Col>
      </Row>
      
      <Row justify="center" style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Steps current={currentStep}>
            {steps.map((item, index) => (
              <Step 
                key={item.title} 
                title={item.title} 
                onClick={() => setCurrentStep(index)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </Steps>
        </Col>
      </Row>

      <Row justify="center">
        <Col span={16}>
          <Form form={form} layout="vertical">
            {steps[currentStep].content}
            
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
              {currentStep > 0 && (
                <Button onClick={() => setCurrentStep(currentStep - 1)}>
                  Précédent
                </Button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <Button 
                  type="primary" 
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={
                    (currentStep === 1 && (!bucketURI || !keyFile)) ||
                    (currentStep === 2 && !tenantName)
                  }
                >
                  Suivant
                </Button>
              ) : null}
            </div>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default Accueil;