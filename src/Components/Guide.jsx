import React, { useState } from 'react';
import { 
  Modal, 
  Steps, 
  Card, 
  Typography, 
  Alert, 
  Button,
  Space
} from 'antd';
import { 
  QuestionCircleOutlined,
  DashboardOutlined,
  PlayCircleOutlined,
  ApiOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import templatePreconfigure from '../assets/template-preconfigure.png';
import templateVierge from '../assets/template-vierge.png';
import connectorImage from '../assets/connector.png';

const { Title, Text, Paragraph } = Typography;

// Configuration des couleurs
const BLUE_COLOR = '#1890ff';

// Données du guide avec la nouvelle section 3
const GUIDE_STEPS = [
  {
    title: "Navigation et Sélection",
    icon: <DashboardOutlined />,
    content: {
      title: "Navigation et Sélection",
      description: "Parcourez les templates et choisissez-en un.",
      details: [
        "Utilisez les flèches pour naviguer entre les templates disponibles.",
        "Cliquez sur 'Looker Studio' pour ouvrir le template choisi dans un nouvel onglet.",
        "Ou sélectionnez 'Template vierge' pour partir de zéro avec un rapport vide."
      ],
      tips: "Prenez le temps d'explorer chaque template pour comprendre les métriques disponibles."
    }
  },
  {
    title: "Redirection vers Looker Studio",
    icon: <PlayCircleOutlined />,
    content: {
      title: "Redirection vers Looker Studio",
      description: "Votre template s'ouvre automatiquement dans Looker Studio.",
      details: [
        {
          text: "• Préconfiguré : Rapport immédiatement utilisable avec des données d'exemple et des visualisations prêtes.",
          image: templatePreconfigure
        },
        {
          text: "• Vierge : Espace de travail vide à personnaliser selon vos besoins spécifiques.",
          image: templateVierge
        }
      ],
      tips: "Les templates préconfigurés vous font gagner du temps, tandis que les templates vierges offrent plus de flexibilité."
    }
  },
  {
    title: "Utilisation du Connecteur DataHive",
    icon: <ApiOutlined />,
    content: {
      title: "Utilisation du Connecteur DataHive",
      description: "Connectez vos données personnalisées via notre connecteur DataHive_Connector.",
      details: [
        "Dans Looker Studio, recherchez et sélectionnez le connecteur 'DataHive_Connector' dans la liste des connecteurs disponibles.",
        "Saisissez votre email et votre mot de passe pour vous authentifier sur la plateforme DataHive.",
        "Parcourez la liste des sources de données disponibles et sélectionnez celle que vous souhaitez analyser.",
        "Cliquez sur 'Ajouter' pour récupérer automatiquement vos données dans Looker Studio.",
        {
          text: "• Interface du connecteur DataHive avec les champs d'authentification et la sélection des données :",
          image: connectorImage
        },
        "Une fois connecté, vos données seront automatiquement synchronisées et prêtes à être utilisées dans vos rapports."
      ],
      tips: "Assurez-vous d'avoir les bonnes permissions pour accéder aux données que vous souhaitez analyser."
    }
  }
];

// Composant pour afficher les étapes du guide
const GuideStep = ({ step }) => {
  return (
    <div className="guide-step">
      <div style={{ marginBottom: 20 }}>
        {step.content.details.map((detail, index) => {
          // Vérifier si detail est un objet avec texte et image
          if (typeof detail === 'object' && detail.text && detail.image) {
            return (
              <div key={index} className="detail-with-image" style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 14, display: 'block', marginBottom: 15 }}>
                  {detail.text}
                </Text>
                <div style={{ textAlign: 'center' }}>
                  <img 
                    src={detail.image} 
                    alt={`Guide ${index + 1}`}
                    className="template-image"
                    style={{ 
                      maxWidth: '100%', 
                      width: step.title === "Utilisation du Connecteur DataHive" ? '500px' : '300px',
                      height: 'auto', 
                      margin: '10px 0',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease-in-out'
                    }}
                    onClick={() => {
                      // Ouvrir l'image dans une modal pour un affichage plus grand
                      Modal.info({
                        title: 'Aperçu de l\'image',
                        content: (
                          <div style={{ textAlign: 'center' }}>
                            <img 
                              src={detail.image} 
                              alt="Aperçu agrandi"
                              style={{ 
                                maxWidth: '100%', 
                                width: '100%',
                                height: 'auto'
                              }}
                            />
                          </div>
                        ),
                        width: '80%',
                        maskClosable: true,
                        centered: true
                      });
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  />
                  <div style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
                    Cliquez sur l'image pour l'agrandir
                  </div>
                </div>
              </div>
            );
          } else {
            // Rendu normal pour les détails textuels
            return (
              <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
                <div style={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: '50%', 
                  backgroundColor: BLUE_COLOR,
                  marginTop: 8,
                  flexShrink: 0
                }} />
                <Text style={{ fontSize: 14, lineHeight: 1.6 }}>{detail}</Text>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

// Composant Guide principal
const Guide = ({ visible, onClose }) => {
  const [currentGuideStep, setCurrentGuideStep] = useState(0);

  const nextGuideStep = () => {
    if (currentGuideStep < GUIDE_STEPS.length - 1) {
      setCurrentGuideStep(currentGuideStep + 1);
    }
  };

  const prevGuideStep = () => {
    if (currentGuideStep > 0) {
      setCurrentGuideStep(currentGuideStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentGuideStep(0); // Reset to first step when closing
    onClose();
  };

  const currentStep = GUIDE_STEPS[currentGuideStep];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <QuestionCircleOutlined style={{ color: BLUE_COLOR, fontSize: 24 }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>Guide dutilisation MagicTemplate</span>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      width={1000}
      footer={null}
      style={{ top: 20 }}
    >
      <div style={{ marginBottom: 24 }}>
        <Steps
          current={currentGuideStep}
          size="small"
          items={GUIDE_STEPS.map((step, index) => ({
            title: step.title,
            icon: step.icon,
            status: index === currentGuideStep ? 'process' : 
                   index < currentGuideStep ? 'finish' : 'wait'
          }))}
        />
      </div>

      <Card 
        style={{ 
          minHeight: 450,
          border: `1px solid ${BLUE_COLOR}20`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ 
            background: `${BLUE_COLOR}15`, 
            padding: 8, 
            borderRadius: 8, 
            marginRight: 12,
            color: BLUE_COLOR,
            fontSize: 20
          }}>
            {currentStep.icon}
          </div>
          <Title level={3} style={{ margin: 0, color: BLUE_COLOR }}>
            {currentStep.content.title}
          </Title>
        </div>

        <Paragraph style={{ fontSize: 16, marginBottom: 20, color: '#555' }}>
          {currentStep.content.description}
        </Paragraph>

        <div style={{ marginBottom: 20 }}>
          <Title level={5} style={{ marginBottom: 12 }}>Points clés :</Title>
          <GuideStep step={currentStep} />
        </div>

        {currentStep.content.tips && (
          <Alert
            message="Conseil pratique"
            description={currentStep.content.tips}
            type="info"
            showIcon
            style={{ 
              background: `${BLUE_COLOR}08`,
              border: `1px solid ${BLUE_COLOR}30`
            }}
          />
        )}
      </Card>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: 24,
        paddingTop: 16,
        borderTop: '1px solid #f0f0f0'
      }}>
        <Button 
          onClick={prevGuideStep}
          disabled={currentGuideStep === 0}
          icon={<LeftOutlined />}
        >
          Précédent
        </Button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text type="secondary">
            Étape {currentGuideStep + 1} sur {GUIDE_STEPS.length}
          </Text>
          <div style={{ display: 'flex', gap: 4 }}>
            {GUIDE_STEPS.map((_, index) => (
              <div
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: index === currentGuideStep ? BLUE_COLOR : '#d9d9d9',
                  cursor: 'pointer'
                }}
                onClick={() => setCurrentGuideStep(index)}
              />
            ))}
          </div>
        </div>

        {currentGuideStep === GUIDE_STEPS.length - 1 ? (
          <Button type="primary" onClick={handleClose}>
            Terminer
          </Button>
        ) : (
          <Button 
            type="primary"
            onClick={nextGuideStep}
            icon={<RightOutlined />}
            iconPosition="end"
          >
            Suivant
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default Guide;