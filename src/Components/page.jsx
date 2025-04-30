// components/page.jsx
import React from 'react';
import Header from './Access/Header';
import HeroSection from './Access/HeroSection';
import Features from './Access/Features';
import Footer from './Access/Footer';  // Avec une majuscule "F"
import Details from './Access/Details';  //

import '../styles.css'; // Chemodifié selon l'emplacement réel


const Page = () => {
  return (
    <div className="app">
      <Header />
      <HeroSection />
      <Features />
      <Details />
      <Footer />
    </div>
  );
};

export default Page;