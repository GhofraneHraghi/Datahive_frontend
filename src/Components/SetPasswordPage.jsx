import { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { TextField, Button, Typography, Box } from '@mui/material';

const SetPasswordPage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
 

   // Récupération de l'URL de base depuis les variables d'environnement Vite
   const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      const response = await axios.post(`${VITE_BACKEND_BASE_URL}/api/set-password`, {
        token,
        password,
      });
      setMessage(response.data.message);
      setError('');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Une erreur s\'est produite.');
      setError('');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Box sx={{ width: 300 }}>
        <Typography variant="h5" gutterBottom>
          Définir votre mot de passe
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nouveau mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Confirmer le mot de passe"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Définir le mot de passe
          </Button>
        </form>
        {message && <Typography color="textSecondary">{message}</Typography>}
      </Box>
    </Box>
  );
};

export default SetPasswordPage;