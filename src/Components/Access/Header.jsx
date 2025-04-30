import React from 'react';
import { FiMenu } from 'react-icons/fi';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">EasyApp</div>
      <nav className="nav">
        <a href="#features">Fonctionnalités</a>
        <a href="#contact">Contact</a>
        <FiMenu className="menu-icon" />
      </nav>
    </header>
  );
};

export default Header;