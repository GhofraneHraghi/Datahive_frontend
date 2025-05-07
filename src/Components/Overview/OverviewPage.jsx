import { useState, useEffect } from "react";
import { Table, Card, Typography, Spin, Alert, Layout } from "antd";
import axios from "axios";
import Navbar from "../Dashboard/Navbar"; // Import de la Navbar
import "./OverviewPage.css";

const { Title, Text } = Typography;
const { Content } = Layout;

const OverviewPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  
   // Récupération de l'URL de base depuis les variables d'environnement Vite
   const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  // Liste des rapports à vérifier
  const reportTypes = [
    "reviews_reviews_files",
    "stats_stats_installs",
    "stats_stats_ratings",
    "stats_stats_ratings_v2",
    "stats_stats_crashes",
    "stats_stats_store_performance",
    "acquisition_acquisition_buyers_7d",
    "acquisition_acquisition_retained_installers"
  ];

  const handleCollapse = (isCollapsed) => {
    setCollapsed(isCollapsed);
  };

  useEffect(() => {
    const fetchReportsStatus = async () => {
      try {
        setLoading(true);
        
        // Récupérer les informations utilisateur du localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("authToken");
        
        if (!user || !token) {
          throw new Error("Utilisateur non connecté");
        }
        
        // Récupérer les informations du tenant de l'utilisateur
        const tenantResponse = await axios.get(`${VITE_BACKEND_BASE_URL}/api/client/tenant`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const tenantData = tenantResponse.data;
        
        if (!tenantData) {
          throw new Error("Aucun tenant trouvé pour cet utilisateur");
        }
        
        // Récupérer le statut de chaque rapport pour ce tenant
        const reportsStatusResponse = await axios.get(`${VITE_BACKEND_BASE_URL}/api/reports/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Formater les données pour le tableau
        const formattedReports = reportTypes.map(reportType => {
          const reportStatus = reportsStatusResponse.data.find(r => r.report_name === reportType);
          
          return {
            report: reportType,
            status: reportStatus?.exists ? "OK" : "NO",
            lastSyncedAt: tenantData.last_synced_at ? new Date(tenantData.last_synced_at).toLocaleString() : "N/A",
            details: reportStatus?.exists 
              ? "Report OK." 
              : "Report not found within this account."
          };
        });
        
        setReports(formattedReports);
      } catch (error) {
        console.error("Erreur lors de la récupération des statuts des rapports:", error);
        setError(error.message || "Une erreur s'est produite");
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportsStatus();
  }, []);
  
  const columns = [
    {
      title: "Reports",
      dataIndex: "report",
      key: "report",
      render: (text) => <Text strong>{text.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</Text>
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Text
          className={`status-badge ${status === "OK" ? "status-ok" : "status-non"}`}
        >
          {status}
        </Text>
      )
    },
    {
      title: "Most recent data available on this report",
      dataIndex: "lastSyncedAt",
      key: "lastSyncedAt",
    },
    {
      title: "Details",
      dataIndex: "details",
      key: "details",
      render: (text, record) => (
        <Text type={record.status === "OK" ? "success" : "warning"}>
          {text}
        </Text>
      )
    }
  ];

  const contentStyles = {
    transition: 'margin-left 0.2s',
    marginLeft: collapsed ? '80px' : '250px',
    padding: '24px',
    minHeight: '100vh',
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <Spin size="large" />
          <Text>Chargement des rapports...</Text>
        </div>
      );
    }

    if (error) {
      return (
        <Alert
          message="Erreur"
          description={error}
          type="error"
          showIcon
        />
      );
    }

    return (
      <div className="overview-container">
        <Card className="overview-card">
          <Title level={2}>Rapports Disponibles</Title>
          <Text type="secondary" className="overview-subtitle">
            Statut des rapports pour votre compte
          </Text>
          
          <Table
            dataSource={reports}
            columns={columns}
            rowKey="report"
            pagination={false}
            className="reports-table"
          />
        </Card>
      </div>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar title="BigDeal Analytics" onCollapse={handleCollapse} />
      <Content style={contentStyles}>
        {renderContent()}
      </Content>
    </Layout>
  );
};

export default OverviewPage;