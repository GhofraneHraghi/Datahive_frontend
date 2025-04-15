import { useState } from "react";
import { Form, Input, Button, Card, Typography, message as antMessage } from "antd";
import { MailOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import Axios from "axios";
import { auth, googleProvider } from "../firebase"; 
 // Importation de Firebase
import { signInWithPopup } from "firebase/auth";
import "./Login.css";

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Connexion avec email et mot de passe
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await Axios.post("http://localhost:3001/login", {
        email: values.email,
        password: values.password,
      });

      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("userId", response.data.userId);
        //localStorage.setItem('additionalUserId', userData.id);
        antMessage.success("Connexion réussie !");

      
        if (response.data.role === "admin") {
          navigate("/dashboard-admin");
        } else if (response.data.isAdditionalUser) {
          navigate("/dashboard-additional-user");  // Redirection spécifique
        } else {
          navigate("/dashboard-user");
        }
      }
      
    } catch (error) {
      antMessage.error(error.response?.data?.message || "Erreur de connexion, veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Connexion avec Google (récupération de l'email uniquement)
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
  
      if (user) {
        // Envoyer uniquement l'email au backend
        const response = await Axios.post("http://localhost:3001/google-login", {
          email: user.email,
        });
  
        if (response.data.token) {
          // Après une connexion réussie
          localStorage.setItem("authToken", response.data.token);
          localStorage.setItem("userId", response.data.userId);
          sessionStorage.setItem("currentUser", JSON.stringify({
          id: response.data.userId,
          role: response.data.role,
          subscriptionStatus: null // Valeur par défaut
          }));
          antMessage.success("Connexion réussie avec Google !");
          navigate(response.data.role === "admin" ? "/dashboard-admin" : "/dashboard-user");
        }
      }
    } catch (error) {
      // Gérer les erreurs retournées par le backend
      if (error.response && error.response.data.message) {
        antMessage.error(error.response.data.message); // Afficher le message d'erreur du backend
      } else {
        antMessage.error("Échec de l'authentification avec Google.");
      }
    }
  };

  return (
    <div className="loginPage">
      <Card className="loginCard">
        <Title level={2} className="loginTitle">Welcome Back!</Title>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email", message: "Veuillez entrer un email valide!" }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[{ required: true, message: "Veuillez entrer votre mot de passe!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Enter password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Se connecter
            </Button>
          </Form.Item>
        </Form>

        <Button type="default" icon={<GoogleOutlined />} onClick={signInWithGoogle} block>
          Se connecter avec Google
        </Button>

        <Text>
          Vous navez pas de compte ? <Link to="/register">Sinscrire</Link>
        </Text>
      </Card>
    </div>
  );
};

export default Login;
