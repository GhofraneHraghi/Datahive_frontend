import React from 'react';
import { MdAnalytics, MdCloudUpload, MdSecurity } from 'react-icons/md';

const Features = () => {
  const features = [
    { icon: <MdAnalytics />, title: "Analytique en temps réel", description: "Suivi détaillé de vos métriques clés" },
    { icon: <MdCloudUpload />, title: "Synchronisation cloud", description: "Accès à vos données depuis n'importe où" },
    { icon: <MdSecurity />, title: "Sécurité renforcée", description: "Chiffrement AES-256 de vos données" }
  ];

  return (
    <section className="features-section" id="features">
      <h2>Fonctionnalités clés</h2>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div className="feature-card" key={index}>
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;