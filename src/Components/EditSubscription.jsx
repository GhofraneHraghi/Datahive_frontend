import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  Box,
  Fade,
  Slide,
  useTheme,
  InputAdornment,
  Snackbar,
  Alert
} from '@mui/material';
import {
  AccountBox as AccountBoxIcon,
  Payment as PaymentIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const EditSubscription = ({ subscriptionId }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState({
    name: '',
    plan: '',
    price: '',
    startDate: '',
    endDate: ''
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Charger les données existantes de l'abonnement
  useEffect(() => {
    fetch(`http://localhost:3001/subscriptions/${subscriptionId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des données");
        }
        return response.json();
      })
      .then((data) => {
        setSubscription({
          name: data.name,
          plan: data.type, // Correspond à 'type' dans le backend
          price: data.amount, // Correspond à 'amount' dans le backend
          startDate: data.start_date,
          endDate: data.end_date
        });
      })
      .catch((error) => console.error(error.message));
  }, [subscriptionId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSubscription((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!subscription.userId) {
      setErrorMessage("L'ID de l'utilisateur est manquant");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:3001/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: subscription.userId,
          type: subscription.plan,
          start_date: subscription.startDate,
          end_date: subscription.endDate,
          amount: subscription.price
        })
      });
  
      if (response.ok) {
        setOpenSnackbar(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setErrorMessage("Erreur lors de la mise à jour de l'abonnement");
      }
    } catch (error) {
      setErrorMessage("Erreur de connexion au serveur");
    }
  };

  return (
    <Fade in={true} timeout={500}>
      <Box sx={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <Paper elevation={3} sx={{ padding: '20px', borderRadius: '10px' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
            Modifier lAbonnement
          </Typography>

          <Slide in={true} direction="up" timeout={700}>
            <Box sx={{ marginBottom: '30px' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AccountBoxIcon color="primary" /> Informations de lAbonnement
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nom de labonnement"
                    name="name"
                    value={subscription.name}
                    onChange={handleInputChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountBoxIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Plan dabonnement"
                    name="plan"
                    value={subscription.plan}
                    onChange={handleInputChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PaymentIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Prix"
                    name="price"
                    value={subscription.price}
                    onChange={handleInputChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PaymentIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Slide>

          <Slide in={true} direction="up" timeout={900}>
            <Box sx={{ marginBottom: '30px' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CalendarTodayIcon color="primary" /> Dates de lAbonnement
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date de début"
                    type="date"
                    name="startDate"
                    value={subscription.startDate}
                    onChange={handleInputChange}
                    required
                    InputLabelProps={{
                      shrink: true
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date de fin"
                    type="date"
                    name="endDate"
                    value={subscription.endDate}
                    onChange={handleInputChange}
                    required
                    InputLabelProps={{
                      shrink: true
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Slide>

          <Slide in={true} direction="up" timeout={1100}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="outlined" color="secondary" onClick={() => navigate('/dashboard')}>
                Annuler
              </Button>
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Enregistrer
              </Button>
            </Box>
          </Slide>
        </Paper>

        {/* Snackbar pour afficher le message de validation */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={2000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setOpenSnackbar(false)} severity="success">
            Abonnement mis à jour avec succès !
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default EditSubscription;
