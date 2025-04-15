import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Row, Col, Select, message as antMessage } from 'antd';
import { UserOutlined, MailOutlined, IdcardOutlined, GoogleOutlined } from '@ant-design/icons';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Link } from 'react-router-dom';
import Axios from 'axios';
import i18n from 'i18n-iso-countries';
import fr from 'i18n-iso-countries/langs/fr.json';
import { signInWithGoogle } from "../../components/firebase";

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

  // Monitor form fields to check completeness
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

    // Set up a listener for form values
    const formValues = form.getFieldsValue();
    form.setFieldsValue(formValues);
    checkFormComplete();

    // Watch for form field changes
    const subscription = form.getFieldsValue(true);
    subscription && checkFormComplete();

    return () => {
      // Cleanup if needed
    };
  }, [form, phone]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Log data being sent for debugging
      console.log("Submitting form with data:", {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        companyName: values.companyName,
        country: values.country,
        numberOfEmployees: values.numberOfEmployees,
        phoneNumber: phone,
      });
      
      const response = await Axios.post('http://localhost:3001/register', {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        companyName: values.companyName,
        country: values.country,
        numberOfEmployees: values.numberOfEmployees,
        phoneNumber: phone,
      });

      if (response.status === 201) {
        antMessage.success('Inscription réussie ! Un email a été envoyé pour définir votre mot de passe.');
        form.resetFields();
        setPhone('');
        setGoogleSignIn(false);
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        antMessage.error(error.response.data.message || "Erreur d'inscription, veuillez réessayer.");
      } else if (error.request) {
        console.error("Error request:", error.request);
        antMessage.error("Problème de connexion au serveur. Aucune réponse reçue.");
      } else {
        antMessage.error("Problème de connexion au serveur.");
      }
    } finally {
      setLoading(false);
    }
  };

  const validateAndSubmitForm = () => {
    // Validate all fields
    form.validateFields().then(values => {
      // Check if phone is set
      if (!phone) {
        antMessage.error("Veuillez entrer un numéro de téléphone");
        return;
      }
      
      // All fields are valid, submit the form
      form.submit();
    }).catch(errorInfo => {
      console.log('Validation failed:', errorInfo);
      
      // Provide specific error messages
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
        // Extract name parts
        const [firstName, ...lastNameParts] = user.displayName.split(" ");
        const lastName = lastNameParts.join(" ");
        
        // Get user phone from providerData if available
        const phoneNumber = user.phoneNumber || '';
        
        // Try to parse country from user locale if available
        let userCountry = 'TN'; // Default
        if (user.locale) {
          const locale = user.locale.split('_')[1] || user.locale.split('-')[1];
          if (locale && locale.length === 2) {
            userCountry = locale;
          }
        }
        
        // Set available fields
        form.setFieldsValue({
          email: user.email,
          firstName: firstName || "",
          lastName: lastName || "",
          country: userCountry,
        });
        
        // Set phone if available
        if (phoneNumber) {
          setPhone(phoneNumber);
        }
        
        // Update country state for phone input
        setCountry(userCountry);
        setGoogleSignIn(true);
        
        // IMPORTANT: Alert user about missing fields
        antMessage.info(`Veuillez compléter les champs obligatoires: Nom d'entreprise et Nombre d'employés.`);
      } else {
        antMessage.error("Échec de l'authentification avec Google.");
      }
    } catch (error) {
      console.error("Erreur Google Auth:", error);
      antMessage.error("Une erreur s'est produite lors de l'authentification Google.");
    }
  };

  return (
    <div className="registerPage">
      <Card className="registerCard">
        <Title level={2} className="registerTitle">Let Us Know You!</Title>
        <Form form={form} onFinish={onFinish} layout="vertical">
          {/* Email */}
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Veuillez entrer un email valide!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Enter email" />
          </Form.Item>

          {/* First Name et Last Name sur la même ligne */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'Veuillez entrer votre prénom!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Enter First Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Veuillez entrer votre nom de famille!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Enter Last Name" />
              </Form.Item>
            </Col>
          </Row>

          {/* Company Name et Role sur la même ligne */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="companyName"
                label="Company Name"
                rules={[{ required: true, message: 'Veuillez entrer le nom de votre entreprise!' }]}
              >
                <Input prefix={<IdcardOutlined />} placeholder="Enter Company Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="numberOfEmployees"
                label="Number of employees"
                rules={[{ required: true, message: 'Veuillez sélectionner le nombre d\'employés!' }]}
              >
                <Select placeholder="Select number of employees">
                  <Option value="0-10">0-10</Option>
                  <Option value="10-100">10-100</Option>
                  <Option value="+100">+100</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Sélection du pays */}
          <Form.Item
            name="country"
            label="Country"
            rules={[{ required: true, message: 'Veuillez sélectionner votre pays!' }]}
          >
            <Select
              showSearch
              placeholder="Select a country"
              optionFilterProp="children"
              onChange={(value) => setCountry(value)}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {Object.entries(i18n.getNames('fr')).map(([code, name]) => (
                <Option key={code} value={code}>
                  {name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Numéro de téléphone avec drapeau */}
          <Form.Item
            label="Phone Number"
            rules={[{ required: true, message: 'Veuillez entrer votre numéro de téléphone!' }]}
          >
            <PhoneInput
              international
              defaultCountry={country}
              value={phone}
              onChange={setPhone}
              placeholder="Enter phone number"
            />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Register
            </Button>
          </Form.Item>

          {/* Google Sign-In Button */}
          <Form.Item>
            <Button 
              type="primary" 
              icon={<GoogleOutlined />}
              onClick={handleGoogleSignIn}
              loading={loading}
              block
              style={{ backgroundColor: '#4285F4', borderColor: '#4285F4' }}
            >
              Register with Google
            </Button>
          </Form.Item>

          {/* Completion Button (appears after Google Sign-in) */}
          {googleSignIn && (
            <Form.Item>
              <Button 
                type="primary"
                onClick={validateAndSubmitForm}
                loading={loading}
                disabled={!formComplete}
                block
                style={{ 
                  backgroundColor: '#34A853', 
                  borderColor: '#34A853', 
                  marginTop: '10px',
                  opacity: formComplete ? 1 : 0.5
                }}
              >
                Complete Registration
              </Button>
            </Form.Item>
          )}
        </Form>
        <Text>
          Have an account? <Link to="/login">Login</Link>
        </Text>
      </Card>
    </div>
  );
};

export default Register;