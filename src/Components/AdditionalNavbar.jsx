import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Layout,
  Menu,
  Button,
  Typography,
  Drawer,
  Divider,
  Space,
} from "antd";
import {
  MenuOutlined,
  LeftOutlined,
  HomeOutlined,
  CreditCardOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

const AdditionalNavbar = ({ title, onCollapse }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // État pour gérer la barre latérale

  // Détecter si l'écran est mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleDrawer = (open) => (event) => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleCollapse = (collapsed) => {
    setCollapsed(collapsed);
    if (onCollapse) {
      onCollapse(collapsed); // Informer le parent de l'état de la barre latérale
    }
  };

  // Menu spécifique pour les utilisateurs supplémentaires
  const menuItems = (
    <Menu theme="light" mode="inline" defaultSelectedKeys={["1"]}>
      <Menu.Item key="1" icon={<HomeOutlined />}>
        <Link to="/Accueil">Accueil</Link>
      </Menu.Item>
      <Menu.Item key="2" icon={<UserOutlined />}>
        <Link to="/additional-profile">Profil</Link>
      </Menu.Item>
      <Menu.Item key="3" icon={<CreditCardOutlined />}>
        <Link to="/subscription-plans">Abonnement</Link>
      </Menu.Item>
      <Menu.Item key="4" icon={<TeamOutlined />}>
        <Link to="/support">Support</Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      {isMobile && (
        <Header style={{ position: "fixed", zIndex: 1, width: "100%", padding: "0 24px", background: "#001529" }}>
          <Space align="center">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={toggleDrawer(true)}
              style={{ color: "#fff", marginRight: "16px" }}
            />
            <Typography.Title level={4} style={{ color: "#fff", margin: 0 }}>
              {title}
            </Typography.Title>
          </Space>
        </Header>
      )}

      {!isMobile && (
        <Sider
          collapsible
          theme="light"
          collapsed={collapsed}
          onCollapse={handleCollapse}
          style={{
            overflow: "auto",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <div style={{ padding: "16px", textAlign: "center" }}>
            <Typography.Title level={4} style={{ color: "#1890ff" }}>
              {title}
            </Typography.Title>
          </div>
          <Divider />
          {menuItems}
        </Sider>
      )}

      {isMobile && (
        <Drawer
          title="Menu"
          placement="left"
          onClose={toggleDrawer(false)}
          open={drawerOpen}
          closable={false}
          extra={
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={toggleDrawer(false)}
            />
          }
        >
          <Divider />
          {menuItems}
        </Drawer>
      )}
    </>
  );
};

export default AdditionalNavbar;