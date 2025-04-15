import React, { useState } from "react";
import { Box, Typography, TextField, Button, Grid, Card, CardContent, Divider } from "@mui/material";
import { Email as EmailIcon, Phone as PhoneIcon } from "@mui/icons-material";

const SupportPage = () => {
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactInfo({
      ...contactInfo,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted", contactInfo);
    // Ajoutez ici la logique pour envoyer le message au support
  };

  return (
    <Box sx={{ padding: 3 }}>
      {/* Titre de la page */}
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
        Support Client
      </Typography>

      {/* Formulaire de contact */}
      <Card sx={{ marginBottom: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Contactez-nous
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom"
                  name="name"
                  value={contactInfo.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={contactInfo.email}
                  onChange={handleChange}
                  type="email"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  name="message"
                  value={contactInfo.message}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="submit" variant="contained" color="primary">
                  Envoyer
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Informations sur le support */}
      <Card sx={{ marginBottom: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Informations de support
          </Typography>
          <Typography variant="body1" sx={{ display: "flex", alignItems: "center" }}>
            <EmailIcon sx={{ marginRight: 1 }} />
            support@example.com
          </Typography>
          <Typography variant="body1" sx={{ display: "flex", alignItems: "center" }}>
            <PhoneIcon sx={{ marginRight: 1 }} />
            +1 (123) 456-7890
          </Typography>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Foire aux Questions (FAQ)
          </Typography>
          <Divider sx={{ marginBottom: 2 }} />
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            1. Comment puis-je modifier mon abonnement ?
          </Typography>
          <Typography variant="body2" paragraph>
            Vous pouvez modifier votre abonnement en accédant à la page "Mes abonnements" dans votre compte.
          </Typography>

          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            2. Que faire si je rencontre un problème de paiement ?
          </Typography>
          <Typography variant="body2" paragraph>
            Si vous rencontrez un problème de paiement, veuillez contacter notre support à ladresse email ou numéro ci-dessus.
          </Typography>

          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            3. Comment annuler mon abonnement ?
          </Typography>
          <Typography variant="body2" paragraph>
            Pour annuler votre abonnement, veuillez accéder à la page "Mes abonnements" et cliquez sur "Annuler l'abonnement".
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SupportPage;
