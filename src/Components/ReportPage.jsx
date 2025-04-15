import { useEffect, useState } from 'react';
import axios from 'axios';

const ReportPage = ({ tenantId }) => {
  const [reportUrl, setReportUrl] = useState('');

  useEffect(() => {
    axios.get(`/api/tenant-report/${tenantId}`).then(res => {
      setReportUrl(res.data.reportUrl);
    }).catch(err => {
      console.error('Erreur :', err);
    });
  }, [tenantId]);

  return (
    <div>
      {reportUrl ? (
        <iframe
          title="Rapport utilisateur"
          width="100%"
          height="800"
          src={reportUrl}
          frameBorder="0"
          allowFullScreen
          style={{ border: 0 }}
        />
      ) : (
        <p>Chargement du rapport...</p>
      )}
    </div>
  );
};

export default ReportPage;
