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
            <Title level={4} style={{ margin: 0 }}>Setup Guide</Title>
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
            title="Invite Account"
            icon={<ApiOutlined />}
            description={
              <div className="step-description">
                <Text strong>1. Access Play Console</Text>
                <Text>Log in to your Google Play Console account</Text>
                
                <Text strong>2. Navigate to Users</Text>
                <Text>Go to Users & permissions section</Text>
                
                <Text strong>3. Invite Service Account</Text>
                <Text>Use email: test-google-play-console@pc-api-4722596725443039036-6</Text>
                
                <Text strong>4. Set Permissions</Text>
                <Text>Grant Admin access rights</Text>
              </div>
            }
          />
          
          <Step
            title="Configure GCS"
            icon={<CloudOutlined />}
            description={
              <div className="step-description">
                <Text strong>1. Create Bucket</Text>
                <Text>In Google Cloud Storage console</Text>
                
                <Text strong>2. Generate Key</Text>
                <Text>Create service account key with Storage Admin role</Text>
                
                <Text strong>3. Upload JSON</Text>
                <Text>Provide the key file in the form</Text>
              </div>
            }
          />
          
          <Step
            title="Name Source"
            icon={<PlayCircleOutlined />}
            description={
              <div className="step-description">
                <Text strong>1. Choose Identifier</Text>
                <Text>Use a meaningful name for your data source</Text>
                
                <Text strong>2. Start Sync</Text>
                <Text>Initiate the first synchronization</Text>
              </div>
            }
          />
        </Steps>
        
        <div className="support-section">
          <Text strong>Need Help?</Text>
          <Text>Contact support@bigdeal.com</Text>
        </div>
      </Card>
    </div>
  );
};

export default Guide;