import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Drawer, Divider, Space, Popconfirm } from 'antd';
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined,
  UserOutlined,
  TeamOutlined,
  AppstoreOutlined,
  CreditCardOutlined,
  MenuOutlined,
  LeftOutlined,
  DashboardOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './NavbarAdmin.css';

const { Sider } = Layout;
const { Title } = Typography;

const NavbarAdmin = ({ title = "Data Hive", onCollapse, onPageChange }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('employee');
    sessionStorage.removeItem('currentEmployee');
    navigate('/loginAdmin');
    window.location.reload();
  };

  const handleMenuClick = (key, page) => {
    if (onPageChange) onPageChange(page);
    if (isMobile) setDrawerOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setDrawerOpen(false);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (onCollapse) {
      onCollapse(collapsed);
    }
  }, [collapsed, onCollapse]);

  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    if (onCollapse) {
      onCollapse(newState);
    }
  };

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  const getItemStyle = (key) => {
    return location.pathname === key ? { 
      backgroundColor: '#e6f7ff', 
      color: '#1890ff',
      borderRight: '3px solid #1890ff'
    } : {};
  };

  const menuItems = (
    <Menu 
      theme="dark" 
      mode="inline" 
      selectedKeys={[location.pathname]}
      className="navbar-menu"
      style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px 0'
      }}
    >
      <Menu.Item 
        key="/dashboard-admin"
        icon={<DashboardOutlined />}
        onClick={() => handleMenuClick('/dashboard-admin', 'dashboard-admin')}
        className={location.pathname === '/dashboard-admin' ? 'menu-item-selected' : ''}
        style={getItemStyle('/dashboard-admin')}
      >
        <Link to="/dashboard-admin" className="nav-link">Tableau de bord</Link>
      </Menu.Item>
      
      <Menu.Item 
        key="/subscription-admin"
        icon={<CreditCardOutlined />}
        onClick={() => handleMenuClick('/subscription-admin', 'subscription-admin')}
        className={location.pathname === '/subscription-admin' ? 'menu-item-selected' : ''}
        style={getItemStyle('/subscription-admin')}
      >
        <Link to="/subscription-admin" className="nav-link">Abonnement</Link>
      </Menu.Item>
      
      <Menu.Item 
        key="/users"
        icon={<TeamOutlined />}
        onClick={() => handleMenuClick('/users', 'users')}
        className={location.pathname === '/users' ? 'menu-item-selected' : ''}
        style={getItemStyle('/users')}
      >
        <Link to="/users" className="nav-link">Employés</Link>
      </Menu.Item>
      
      <Menu.Item 
        key="/settings"
        icon={<AppstoreOutlined />}
        onClick={() => handleMenuClick('/settings', 'settings')}
        className={location.pathname === '/settings' ? 'menu-item-selected' : ''}
        style={getItemStyle('/settings')}
      >
        <Link to="/settings" className="nav-link">Paramètres</Link>
      </Menu.Item>
    </Menu>
  );

  if (isMobile) {
    return (
      <>
        <header className="mobile-header">
          <Space align="left">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={toggleDrawer}
              className="menu-button"
              style={{ color: '#fff' }}
            />
            <Title level={4} className="mobile-title" style={{ color: '#fff', margin: 0 }}>
              {title}
            </Title>
          </Space>
          <Popconfirm
            title="Êtes-vous sûr de vouloir vous déconnecter?"
            onConfirm={handleSignOut}
            okText="Oui"
            cancelText="Non"
          >
            <Button 
              type="text" 
              danger 
              icon={<LogoutOutlined />} 
              style={{ color: '#fff' }}
            />
          </Popconfirm>
        </header>

        <Drawer
          title={
            <div className="logo-container drawer-logo">
              <div className="logo">
                {title}
              </div>
            </div>
          }
          placement="left"
          onClose={toggleDrawer}
          open={drawerOpen}
          closable={false}
          className="navbar-drawer"
          extra={
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={toggleDrawer}
              className="close-button"
              style={{ color: '#000' }}
            />
          }
        >
          <Divider className="drawer-divider" />
          {menuItems}
          <Divider className="drawer-divider" />
          <Button 
            block
            danger
            icon={<LogoutOutlined />}
            onClick={handleSignOut}
            style={{ marginTop: '16px' }}
          >
            Déconnexion
          </Button>
        </Drawer>
      </>
    );
  }

  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={toggleCollapsed}
      width={250}
      collapsedWidth={80}
      className="navbar-sider"
      trigger={null}
      theme="dark"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 10
      }}
    >
      <div className="logo-container">
        <div className="logo">
          {collapsed ? title.charAt(0) : title}
        </div>
        <Button 
          type="text" 
          onClick={toggleCollapsed}
          className="collapse-button"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          style={{ color: '#fff' }}
        />
      </div>
      
      <Divider className="sider-divider" style={{ backgroundColor: 'rgba(255,255,255,0.2)', margin: '16px 0' }} />
      {menuItems}
      <Divider className="sider-divider" style={{ backgroundColor: 'rgba(255,255,255,0.2)', margin: '16px 0' }} />
      <div style={{ padding: '0 16px 16px' }}>
        <Popconfirm
          title="Êtes-vous sûr de vouloir vous déconnecter?"
          onConfirm={handleSignOut}
          okText="Oui"
          cancelText="Non"
          placement={collapsed ? 'right' : 'top'}
        >
          <Button 
            type="text"
            block
            icon={<LogoutOutlined />}
            style={{ 
              color: 'rgba(255, 255, 255, 0.65)',
              textAlign: 'left',
              height: 48,
              padding: '0 16px'
            }}
          > 
            {!collapsed && 'Déconnexion'}
          </Button>
        </Popconfirm>
      </div>
    </Sider>
  );
};

export default NavbarAdmin;