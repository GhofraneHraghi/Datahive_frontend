import React from 'react';
import { Card, Typography, Steps, Button, Space } from 'antd';
import { 
  PlayCircleOutlined, CloudOutlined, 
  ApiOutlined, CloseOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Step } = Steps;

const Guide = ({ onClose }) => {
  return (
    <div className="guide-panel">
      <Card 
        variant="outlined"
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>Guide de Configuration</Title>
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={onClose}
              className="close-guide-btn"
            />
          </Space>
        }
        bordered={false}
        className="guide-card"
      >
        <Steps direction="vertical" current={-1} className="guide-steps">
          <Step
            title="Inviter un Compte"
            icon={<ApiOutlined />}
            description={
              <div className="step-description">
                <Text strong>1. Accéder à la Console Play</Text>
                <Text>Connectez-vous à votre compte Google Play Console</Text>
                
                <Text strong>2. Accéder aux Utilisateurs</Text>
                <Text>Allez dans la section Utilisateurs et permissions</Text>
                
                <Text strong>3. Inviter le Compte de Service</Text>
                <Text>Utilisez l'email : test-google-play-console@pc-api-4722596725443039036-6</Text>
                
                <Text strong>4. Définir les Permissions</Text>
                <Text>Accordez les droits d'accès Administrateur</Text>
              </div>
            }
          />
          
          <Step
            title="Configurer GCS"
            icon={<CloudOutlined />}
            description={
              <div className="step-description">
                <Text strong>1. Créer un Bucket</Text>
                <Text>Dans la console Google Cloud Storage</Text>
                
                <Text strong>2. Générer une Clé</Text>
                <Text>Créez une clé de compte de service avec le rôle Storage Admin</Text>
                
                <Text strong>3. Téléverser le JSON</Text>
                <Text>Fournissez le fichier de clé dans le formulaire</Text>
              </div>
            }
          />
          
          <Step
            title="Nommer la Source"
            icon={<PlayCircleOutlined />}
            description={
              <div className="step-description">
                <Text strong>1. Choisir un Identifiant</Text>
                <Text>Utilisez un nom significatif pour votre source de données</Text>
                
                <Text strong>2. Démarrer la Synchronisation</Text>
                <Text>Lancez la première synchronisation</Text>
              </div>
            }
          />
        </Steps>
        
        <div className="support-section">
          <Text strong>Besoin d'aide ?</Text>
          <Text>Contactez support@bigdeal.com</Text>
        </div>
      </Card>
    </div>
  );
};

export default Guide;