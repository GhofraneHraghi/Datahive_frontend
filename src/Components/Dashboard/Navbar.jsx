import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Drawer, Divider, Space } from 'antd';
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined,
  UserOutlined,
  TeamOutlined,
  AppstoreOutlined,
  CreditCardOutlined,
  MenuOutlined,
  LeftOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom'; // Import useLocation pour obtenir le chemin actuel
import './Navbar.css';

const { Sider } = Layout;
const { Title } = Typography;

const Navbar = ({ title = "BigDeal Analytics", onCollapse, onPageChange }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [roleId, setRoleId] = useState(null);

  const location = useLocation(); // Utilisation de useLocation pour obtenir le chemin actuel

  const handleMenuClick = (key, page) => {
    if (onPageChange) onPageChange(page);
    if (isMobile) setDrawerOpen(false);
  };

  useEffect(() => {
    // Function to load user data including permissions
    const loadUserData = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          if (parsedUserData.permissions) {
            setPermissions(parsedUserData.permissions);
            setRoleId(parsedUserData.role_id);
            console.log('Permissions loaded:', parsedUserData.permissions);
            console.log('Role ID:', parsedUserData.role_id);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          setPermissions([]);
          setRoleId(null);
        }
      }
    };

    // Load user data on mount
    loadUserData();

    // Listen for storage changes
    window.addEventListener('storage', loadUserData);
    
    // Cleanup
    return () => window.removeEventListener('storage', loadUserData);
  }, []);

  // Utility function to check permissions
  const hasPermission = (perm) => permissions.includes(perm);
  
  // Function to check if user is an owner (role_id = 1)
  const isOwner = () => roleId === 1;

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
      selectedKeys={[location.pathname]} // Utilisation de location.pathname pour la surbrillance
      className="navbar-menu"
      style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px 0'
      }}
    >
    <Menu.Item 
    key="/dashboard" // Utilisation du chemin comme clé
    icon={<DashboardOutlined />}
    onClick={() => handleMenuClick('/dashboard', 'dashboard')}
    className={location.pathname === '/dashboard' ? 'menu-item-selected' : ''}
    style={getItemStyle('/dashboard')}
  >
  <Link to="/dashboard" className="nav-link">Dashboard</Link>
  </Menu.Item>
      {/* Profile: Everyone can edit their own profile */}
      {hasPermission('EDIT_PROFILE') && (
        <Menu.Item 
          key="/profile" // Utilisation du chemin comme clé
          icon={<UserOutlined />}
          onClick={() => handleMenuClick('/profile', 'profile')}
          className={location.pathname === '/profile' ? 'menu-item-selected' : ''}
          style={getItemStyle('/profile')}
        >
          <Link to="/profile" className="nav-link">Profile</Link>
        </Menu.Item>
      )}
      
      {/* Manage Members: Only owners can manage members */}
      {hasPermission('ADD_MEMBER') && (
        <Menu.Item 
          key="/manage-member" // Utilisation du chemin comme clé
          icon={<TeamOutlined />}
          onClick={() => handleMenuClick('/manage-member', 'manage-member')}
          className={location.pathname === '/manage-member' ? 'menu-item-selected' : ''}
          style={getItemStyle('/manage-member')}
        >
          <Link to="/manage-member" className="nav-link">Manage Members</Link>
        </Menu.Item>
      )}
      
      {/* Magic Template: Available to all users */}
      <Menu.Item 
        key="/magic-template" // Utilisation du chemin comme clé
        icon={<AppstoreOutlined />}
        onClick={() => handleMenuClick('/magic-template', 'magic-template')}
        className={location.pathname === '/magic-template' ? 'menu-item-selected' : ''}
        style={getItemStyle('/magic-template')}
      >
        <Link to="/magic-template" className="nav-link">Magic Template</Link>
      </Menu.Item>
      
      {/* Overview: Available to all users */}
      <Menu.Item 
        key="/overview" // Utilisation du chemin comme clé
        icon={<AppstoreOutlined />}
        onClick={() => handleMenuClick('/overview', 'overview')}
        className={location.pathname === '/overview' ? 'menu-item-selected' : ''}
        style={getItemStyle('/overview')}
      >
        <Link to="/overview" className="nav-link">Overview</Link>
      </Menu.Item>
      
      {/* Subscription: Only owners can edit subscriptions */}
      {hasPermission('EDIT_SUBSCRIPTION') && (
        <Menu.Item 
          key="/subscription-plans" // Utilisation du chemin comme clé
          icon={<CreditCardOutlined />}
          onClick={() => handleMenuClick('/subscription-plans', 'subscription')}
          className={location.pathname === '/subscription-plans' ? 'menu-item-selected' : ''}
          style={getItemStyle('/subscription-plans')}
        >
          <Link to="/subscription-plans" className="nav-link">Subscription</Link>
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
    </Sider>
  );
};

export default Navbar;