import { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { TextField, Button, Typography, Box } from '@mui/material';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/reset-password', {
        token,
        password,
      });
      setMessage(response.data.message);
      setError(''); // Effacer l'erreur si la soumission réussit
    } catch (error) {
      setMessage(error.response?.data?.error || 'Une erreur s\'est produite.');
      setError(''); // Effacer l'erreur en cas d'échec
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
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Définir le mot de passe
          </Button>
        </form>
        {message && (
          <Typography color="textSecondary" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ResetPassword;