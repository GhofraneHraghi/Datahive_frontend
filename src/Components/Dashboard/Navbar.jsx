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
import './Navbar.css';

const { Sider } = Layout;
const { Title } = Typography;

const Navbar = ({ title = "Data Hive", onCollapse, onPageChange }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [roleId, setRoleId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  };

  const handleMenuClick = (key, page) => {
    if (onPageChange) onPageChange(page);
    if (isMobile) setDrawerOpen(false);
  };

  useEffect(() => {
    const loadUserData = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          if (parsedUserData.permissions) {
            setPermissions(parsedUserData.permissions);
            setRoleId(parsedUserData.role_id);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          setPermissions([]);
          setRoleId(null);
        }
      }
    };

    loadUserData();
    window.addEventListener('storage', loadUserData);
    
    return () => window.removeEventListener('storage', loadUserData);
  }, []);

  const hasPermission = (perm) => permissions.includes(perm);
  //const isOwner = () => roleId === 1;

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
        key="/dashboard"
        icon={<DashboardOutlined />}
        onClick={() => handleMenuClick('/dashboard', 'dashboard')}
        className={location.pathname === '/dashboard' ? 'menu-item-selected' : ''}
        style={getItemStyle('/dashboard')}
      >
        <Link to="/dashboard" className="nav-link">Tableau de bord</Link>
      </Menu.Item>
      
      {hasPermission('EDIT_PROFILE') && (
        <Menu.Item 
          key="/profile"
          icon={<UserOutlined />}
          onClick={() => handleMenuClick('/profile', 'profile')}
          className={location.pathname === '/profile' ? 'menu-item-selected' : ''}
          style={getItemStyle('/profile')}
        >
          <Link to="/profile" className="nav-link">Profil</Link>
        </Menu.Item>
      )}
      
      {hasPermission('ADD_MEMBER') && (
        <Menu.Item 
          key="/manage-member"
          icon={<TeamOutlined />}
          onClick={() => handleMenuClick('/manage-member', 'manage-member')}
          className={location.pathname === '/manage-member' ? 'menu-item-selected' : ''}
          style={getItemStyle('/manage-member')}
        >
          <Link to="/manage-member" className="nav-link">Gestion des membres</Link>
        </Menu.Item>
      )}
      
      <Menu.Item 
        key="/magic-template"
        icon={<AppstoreOutlined />}
        onClick={() => handleMenuClick('/magic-template', 'magic-template')}
        className={location.pathname === '/magic-template' ? 'menu-item-selected' : ''}
        style={getItemStyle('/magic-template')}
      >
        <Link to="/magic-template" className="nav-link">Template magique</Link>
      </Menu.Item>
      
      <Menu.Item 
        key="/overview"
        icon={<AppstoreOutlined />}
        onClick={() => handleMenuClick('/overview', 'overview')}
        className={location.pathname === '/overview' ? 'menu-item-selected' : ''}
        style={getItemStyle('/overview')}
      >
        <Link to="/overview" className="nav-link">Vue d'ensemble</Link>
      </Menu.Item>
      
      {hasPermission('EDIT_SUBSCRIPTION') && (
        <Menu.Item 
          key="/subscription-plans"
          icon={<CreditCardOutlined />}
          onClick={() => handleMenuClick('/subscription-plans', 'subscription')}
          className={location.pathname === '/subscription-plans' ? 'menu-item-selected' : ''}
          style={getItemStyle('/subscription-plans')}
        >
          <Link to="/subscription-plans" className="nav-link">Abonnement</Link>
        </Menu.Item>
      )}
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

export default Navbar;