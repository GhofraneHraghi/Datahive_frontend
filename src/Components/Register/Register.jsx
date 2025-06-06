import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Row, Col, Select, message as antMessage } from 'antd';
import { UserOutlined, MailOutlined, IdcardOutlined, GoogleOutlined } from '@ant-design/icons';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Link } from 'react-router-dom';
import Axios from 'axios';
import i18n from 'i18n-iso-countries';
import fr from 'i18n-iso-countries/langs/fr.json';
import { signInWithGoogle } from "../../Components/firebase";
import './Register.css';

i18n.registerLocale(fr);

const { Title, Text } = Typography;
const { Option } = Select;

const Register = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('TN');
  const [googleSignIn, setGoogleSignIn] = useState(false);
  const [formComplete, setFormComplete] = useState(false);

  // Récupération de l'URL de base depuis les variables d'environnement Vite
  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  useEffect(() => {
    const checkFormComplete = () => {
      try {
        const values = form.getFieldsValue();
        const requiredFields = [
          'email', 
          'firstName', 
          'lastName', 
          'companyName', 
          'country', 
          'numberOfEmployees'
        ];
        
        const isComplete = requiredFields.every(field => 
          values[field] !== undefined && 
          values[field] !== null && 
          values[field] !== ''
        ) && phone !== '';
        
        setFormComplete(isComplete);
      } catch (e) {
        setFormComplete(false);
      }
    };

    const formValues = form.getFieldsValue();
    form.setFieldsValue(formValues);
    checkFormComplete();

    const subscription = form.getFieldsValue(true);
    subscription && checkFormComplete();

    return () => {
      // Cleanup if needed
    };
  }, [form, phone]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log("Submitting form with data:", {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        companyName: values.companyName,
        country: values.country,
        numberOfEmployees: values.numberOfEmployees,
        phoneNumber: phone,
      });
      
      const response = await Axios.post(`${VITE_BACKEND_BASE_URL}/api/register`, {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        companyName: values.companyName,
        country: values.country,
        numberOfEmployees: values.numberOfEmployees,
        phoneNumber: phone,
      });

      if (response.status === 201) {
        antMessage.success('Inscription réussie! Un email a été envoyé pour définir votre mot de passe.');
        form.resetFields();
        setPhone('');
        setGoogleSignIn(false);
      }
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      if (error.response) {
        console.error("Réponse d'erreur:", error.response.data);
        antMessage.error(error.response.data.message || "Registration error, please try again.");
      } else if (error.request) {
        console.error("Erreur de requête:", error.request);
        antMessage.error("Problème de connexion au serveur. Aucune réponse reçue.");
      } else {
        antMessage.error("Problème de connexion au serveur.");
      }
    } finally {
      setLoading(false);
    }
  };

  const validateAndSubmitForm = () => {
    form.validateFields().then(values => {
      if (!phone) {
        antMessage.error("Veuillez entrer un numéro de téléphone");
        return;
      }
      form.submit();
    }).catch(errorInfo => {
      console.log('Validation failed:', errorInfo);
      const errorFields = errorInfo.errorFields.map(field => field.name[0]);
      if (errorFields.length > 0) {
        antMessage.error(`Veuillez remplir les champs suivants: ${errorFields.join(', ')}`);
      } else {
        antMessage.error("Veuillez remplir tous les champs obligatoires");
      }
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        const [firstName, ...lastNameParts] = user.displayName.split(" ");
        const lastName = lastNameParts.join(" ");
        const phoneNumber = user.phoneNumber || '';
        
        let userCountry = 'TN';
        if (user.locale) {
          const locale = user.locale.split('_')[1] || user.locale.split('-')[1];
          if (locale && locale.length === 2) {
            userCountry = locale;
          }
        }
        
        form.setFieldsValue({
          email: user.email,
          firstName: firstName || "",
          lastName: lastName || "",
          country: userCountry,
        });
        
        if (phoneNumber) {
          setPhone(phoneNumber);
        }
        
        setCountry(userCountry);
        setGoogleSignIn(true);
        antMessage.info(`Veuillez compléter les champs requis : Nom de l'entreprise et Nombre d'employés.`);
      } else {
        antMessage.error("L'authentification Google a échoué.");
      }
    } catch (error) {
      console.error("Google Auth error:", error);
      antMessage.error("Une erreur s'est produite lors de l'authentification Google.");
    }
  };



return (
    <div className="register-container">
      <div className="register-background"></div>
      
      <Card className="register-card">
        <div className="register-header">
          <Title level={2} className="register-title">Créer votre compte</Title>
          <Text className="register-subtitle">Rejoignez notre communauté</Text>
        </div>

        <Form form={form} onFinish={onFinish} layout="vertical" className="register-form">
          {/* Email */}
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Veuillez entrer un email valide!' }]}
          >
            <Input 
              prefix={<MailOutlined className="input-icon" />} 
              placeholder="Entrez votre email" 
              size="large"
            />
          </Form.Item>

          {/* Prénom et Nom */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="Prénom"
                rules={[{ required: true, message: 'Veuillez entrer votre prénom!' }]}
              >
                <Input 
                  prefix={<UserOutlined className="input-icon" />} 
                  placeholder="Prénom" 
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Nom"
                rules={[{ required: true, message: 'Veuillez entrer votre nom!' }]}
              >
                <Input 
                  prefix={<UserOutlined className="input-icon" />} 
                  placeholder="Nom" 
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Nom de l'entreprise et Nombre d'employés */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="companyName"
                label="Nom de l'entreprise"
                rules={[{ required: true, message: "Veuillez entrer le nom de l'entreprise!" }]}
              >
                <Input 
                  prefix={<IdcardOutlined className="input-icon" />} 
                  placeholder="Nom de l'entreprise" 
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="numberOfEmployees"
                label="Nombre d'employés"
                rules={[{ required: true, message: "Veuillez sélectionner le nombre d'employés!" }]}
              >
                <Select 
                  placeholder="Sélectionnez une option" 
                  size="large"
                >
                  <Option value="0-10">0-10</Option>
                  <Option value="10-100">10-100</Option>
                  <Option value="+100">+100</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Pays */}
          <Form.Item
            name="country"
            label="Pays"
            rules={[{ required: true, message: 'Veuillez sélectionner votre pays!' }]}
          >
            <Select
              showSearch
              placeholder="Sélectionnez votre pays"
              optionFilterProp="children"
              onChange={(value) => setCountry(value)}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              size="large"
            >
              {Object.entries(i18n.getNames('fr')).map(([code, name]) => (
                <Option key={code} value={code}>
                  {name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Numéro de téléphone */}
          <Form.Item
            label="Numéro de téléphone"
            rules={[{ required: true, message: 'Veuillez entrer votre numéro de téléphone!' }]}
          >
            <PhoneInput
              international
              defaultCountry={country}
              value={phone}
              onChange={setPhone}
              placeholder="Entrez votre numéro de téléphone"
              className="custom-phone-input"
            />
          </Form.Item>

          {/* Bouton d'inscription */}
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block
              size="large"
              className="submit-btn"
            >
              S'inscrire
            </Button>
          </Form.Item>

          {/* Bouton Google */}
          <Form.Item>
            <Button 
              type="default"
              icon={<GoogleOutlined />}
              onClick={handleGoogleSignIn}
              loading={loading}
              block
              size="large"
              className="google-btn"
            >
              S'inscrire avec Google
            </Button>
          </Form.Item>

          {/* Bouton de completion */}
          {googleSignIn && (
            <Form.Item>
              <Button 
                type="primary"
                onClick={validateAndSubmitForm}
                loading={loading}
                disabled={!formComplete}
                block
                size="large"
                className="complete-btn"
              >
                Compléter linscription
              </Button>
            </Form.Item>
          )}
        </Form>

        <div className="register-footer">
          <Text>Vous avez déjà un compte? <Link to="/login" className="login-link">Se connecter</Link></Text>
        </div>
      </Card>
    </div>
);

};

export default Register;
