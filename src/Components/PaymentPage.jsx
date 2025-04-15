import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  TextField,
  Button,
  Typography,
  Grid,
  FormControlLabel,
  Checkbox,
  Paper,
  Box,
  MenuItem,
  Select,
} from '@mui/material';

const stripePromise = loadStripe('pk_test_51N...');

const subscriptionOptions = [
  { id: 'basic', name: 'Mensuel', price: 99.9, description: 'Accès de base au service.' },
  { id: 'premium', name: 'Annuel', price: 10000, description: 'Accès premium avec avantages exclusifs.' },
  { id: 'enterprise', name: 'Entreprise', price: 25000, description: 'Solutions personnalisées pour entreprises.' },
];

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(subscriptionOptions[0]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    savePayment: false,
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubscriptionChange = (event) => {
    const selectedPlan = subscriptionOptions.find(option => option.id === event.target.value);
    setSubscription(selectedPlan);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) return;

    const response = await fetch('http://localhost:3001/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: subscription.price, currency: 'eur' }),
    });

    const { clientSecret } = await response.json();

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: formData.fullName,
          email: formData.email,
          address: { line1: formData.address },
        },
      },
    });

    setLoading(false);

    if (stripeError) {
      setError(stripeError.message);
    } else if (paymentIntent.status === 'succeeded') {
      // Enregistrer les informations de paiement dans la base de données
    const paymentResponse = await fetch('http://localhost:3001/save-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: formData.fullName,
        email: formData.email,
        address: formData.address,
        subscriptionId: subscription.id,
        amount: subscription.price,
        paymentStatus: paymentIntent.status,
      }),
    });

    const paymentData = await paymentResponse.json();
    if (paymentData.success) {
      // Redirection vers le dashboard après paiement réussi
      window.location.href = '/dashboard';
    } else {
      setError('Échec de l\'enregistrement du paiement.');
    }
  }
};

  return (
    <Box sx={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <Paper elevation={3} sx={{ padding: '20px' }}>
        <Typography variant="h4" gutterBottom>Paiement</Typography>
        <Select fullWidth value={subscription.id} onChange={handleSubscriptionChange}>
          {subscriptionOptions.map(option => (
            <MenuItem key={option.id} value={option.id}>{option.name} - {(option.price / 100).toFixed(2)} €</MenuItem>
          ))}
        </Select>
        <Typography variant="body1" sx={{ mt: 2 }}>{subscription.description}</Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12}><TextField fullWidth label="Nom complet" name="fullName" value={formData.fullName} onChange={handleChange} required /></Grid>
          <Grid item xs={12}><TextField fullWidth label="E-mail" name="email" type="email" value={formData.email} onChange={handleChange} required /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Adresse" name="address" value={formData.address} onChange={handleChange} required /></Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
        </Box>
        <FormControlLabel
          control={<Checkbox name="savePayment" checked={formData.savePayment} onChange={handleChange} />}
          label="Enregistrer pour les paiements futurs"
        />
        <Button fullWidth variant="contained" color="primary" sx={{ mt: 3 }} onClick={handleSubmit} disabled={!stripe || loading}>
          {loading ? 'Paiement en cours...' : `Payer ${(subscription.price / 100).toFixed(2)} €`}
        </Button>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      </Paper>
    </Box>
  );
};

const PaymentPage = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default PaymentPage;
