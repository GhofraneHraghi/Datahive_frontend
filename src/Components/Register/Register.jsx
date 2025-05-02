vim src/Components/Register/Register.jsx
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
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
      
      const response = await Axios.post(`${API_BASE_URL}/register`, {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        companyName: values.companyName,
        country: values.country,
        numberOfEmployees: values.numberOfEmployees,
        phoneNumber: phone,
      });

      if (response.status === 201) {
        antMessage.success('Registration successful! An email has been sent to set your password.');
        form.resetFields();
        setPhone('');
        setGoogleSignIn(false);
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        antMessage.error(error.response.data.message || "Registration error, please try again.");
      } else if (error.request) {
        console.error("Error request:", error.request);
        antMessage.error("Server connection problem. No response received.");
      } else {
        antMessage.error("Server connection problem.");
      }
    } finally {
      setLoading(false);
    }
  };

  const validateAndSubmitForm = () => {
    form.validateFields().then(values => {
      if (!phone) {
        antMessage.error("Please enter a phone number");
        return;
      }
      form.submit();
    }).catch(errorInfo => {
      console.log('Validation failed:', errorInfo);
      const errorFields = errorInfo.errorFields.map(field => field.name[0]);
      if (errorFields.length > 0) {
        antMessage.error(`Please fill the following fields: ${errorFields.join(', ')}`);
      } else {
        antMessage.error("Please fill all required fields");
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
        antMessage.info(`Please complete the required fields: Company Name and Number of employees.`);
      } else {
        antMessage.error("Google authentication failed.");
      }
    } catch (error) {
      console.error("Google Auth error:", error);
      antMessage.error("An error occurred during Google authentication.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-background"></div>
      
      <Card className="register-card">
        <div className="register-header">
          <Title level={2} className="register-title">Create Your Account</Title>
          <Text className="register-subtitle">Join our community today</Text>
        </div>

        <Form form={form} onFinish={onFinish} layout="vertical" className="register-form">
          {/* Email */}
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Please enter a valid email!' }]}
          >
            <Input 
              prefix={<MailOutlined className="input-icon" />} 
              placeholder="Enter your email" 
              size="large"
            />
          </Form.Item>

          {/* First Name and Last Name */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'Please enter your first name!' }]}
              >
                <Input 
                  prefix={<UserOutlined className="input-icon" />} 
                  placeholder="First name" 
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Please enter your last name!' }]}
              >
                <Input 
                  prefix={<UserOutlined className="input-icon" />} 
                  placeholder="Last name" 
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Company Name and Employees */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="companyName"
                label="Company Name"
                rules={[{ required: true, message: 'Please enter your company name!' }]}
              >
                <Input 
                  prefix={<IdcardOutlined className="input-icon" />} 
                  placeholder="Company name" 
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="numberOfEmployees"
                label="Number of employees"
                rules={[{ required: true, message: 'Please select number of employees!' }]}
              >
                <Select 
                  placeholder="Select an option" 
                  size="large"
                >
                  <Option value="0-10">0-10</Option>
                  <Option value="10-100">10-100</Option>
                  <Option value="+100">+100</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Country */}
          <Form.Item
            name="country"
            label="Country"
            rules={[{ required: true, message: 'Please select your country!' }]}
          >
            <Select
              showSearch
              placeholder="Select your country"
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

          {/* Phone Number */}
          <Form.Item
            label="Phone Number"
            rules={[{ required: true, message: 'Please enter your phone number!' }]}
          >
            <PhoneInput
              international
              defaultCountry={country}
              value={phone}
              onChange={setPhone}
              placeholder="Enter phone number"
              className="custom-phone-input"
            />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block
              size="large"
              className="submit-btn"
            >
              Register
            </Button>
          </Form.Item>

          {/* Google Sign-In Button */}
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
              Register with Google
            </Button>
          </Form.Item>

          {/* Completion Button */}
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
                Complete Registration
              </Button>
            </Form.Item>
          )}
        </Form>

        <div className="register-footer">
          <Text>Already have an account? <Link to="/login" className="login-link">Login</Link></Text>
        </div>
      </Card>
    </div>
  );
};

export default Register;
