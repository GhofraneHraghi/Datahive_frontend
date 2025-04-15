import React, { useState } from "react";
import { Box, List, ListItem, ListItemText, Button, Typography, Divider, Card, CardContent, IconButton, Snackbar } from "@mui/material";
import { Delete as DeleteIcon, Markunread as MarkunreadIcon } from "@mui/icons-material";
import { useSnackbar } from 'notistack'; // Utilisation de Snackbar pour les feedbacks visuels

const NotificationsPage = () => {
  const { enqueueSnackbar } = useSnackbar(); // Snackbar pour les notifications
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Rappel de paiement pour le plan Premium", date: "2025-02-01", read: false },
    { id: 2, message: "Changement de plan vers Basic", date: "2025-02-05", read: false },
    { id: 3, message: "Mise à jour importante de l'abonnement", date: "2025-02-03", read: true },
  ]);

  // Fonction pour marquer une notification comme lue
  const markAsRead = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    enqueueSnackbar('Notification marquée comme lue', { variant: 'success' }); // Affichage d'un feedback
  };

  // Fonction pour supprimer une notification
  const deleteNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notif) => notif.id !== id)
    );
    enqueueSnackbar('Notification supprimée', { variant: 'error' }); // Affichage d'un feedback
  };

  return (
    <Box sx={{ paddingTop: "80px", padding: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", textAlign: "center" }}>
        Notifications de labonnement
      </Typography>

      {/* Liste des notifications */}
      <List>
        {notifications.map((notif) => (
          <Card
            key={notif.id}
            sx={{
              marginBottom: 2,
              backgroundColor: notif.read ? "#fff" : "#f4f4f4", // Highlight unread notifications
              boxShadow: 3,
              '&:hover': { boxShadow: 6, cursor: 'pointer' }, // Ajout de l'effet hover
              transition: 'box-shadow 0.3s ease-in-out',
            }}
          >
            <CardContent>
              <ListItem>
                <ListItemText
                  primary={notif.message}
                  secondary={`Date: ${notif.date}`}
                  sx={{
                    textDecoration: notif.read ? "none" : "underline", // Décoration pour notifications non lues
                    fontWeight: notif.read ? "normal" : "bold",
                  }}
                />
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {/* Bouton Marquer comme lue */}
                  {!notif.read && (
                    <IconButton
                      color="primary"
                      onClick={() => markAsRead(notif.id)}
                      sx={{ marginRight: 1 }}
                    >
                      <MarkunreadIcon />
                    </IconButton>
                  )}
                  {/* Bouton Supprimer */}
                  <IconButton
                    color="secondary"
                    onClick={() => deleteNotification(notif.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItem>
            </CardContent>
          </Card>
        ))}
      </List>
    </Box>
  );
};

export default NotificationsPage;
