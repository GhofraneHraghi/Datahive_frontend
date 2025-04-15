import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaUserShield } from "react-icons/fa";
import { MdEmail, MdSave, MdCancel } from "react-icons/md";
import Image from "../../LoginAssets/club.png";

const EditProfile = () => {
  const { id } = useParams(); // Récupère l'ID de l'utilisateur
  const [user, setUser] = useState({
    username: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Récupère les informations de l'utilisateur pour l'afficher dans le formulaire
    fetch(`http://localhost/backend/getUserDetails.php?id=${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setUser({
            username: data.username,
            email: data.email || "",
          });
          setIsLoading(false);
        } else {
          console.log("Utilisateur non trouvé");
          navigate("/"); // Redirige si l'utilisateur n'est pas trouvé
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des données:", error);
      });
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Mettre à jour l'utilisateur via l'API
    fetch(`http://localhost/backend/updateUser.php?id=${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Réponse de l'API:", data); // Vérifie la réponse de l'API
        if (data.success) {
          console.log("Mise à jour réussie");
          // Rediriger vers la page de profil après la mise à jour
          navigate(`/profile/${id}`);
        } else {
          alert("Une erreur est survenue lors de la mise à jour.");
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour:", error);
      });
  };
  

  if (isLoading) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="EditProfilePage flex">
      <div className="container flex">
        <div className="imgDiv">
          <img src={Image} alt="Club Logo" className="club-image" />
          <div className="textDiv">
            <h2 className="title">Modifier le profil</h2>
          </div>
        </div>

        <div className="formDiv flex">
          <div className="headerDiv">
            <h3>Vos informations</h3>
          </div>

          <form className="form grid" onSubmit={handleSubmit}>
            <div className="inputDiv">
              <label htmlFor="username">Nom dutilisateur</label>
              <div className="input flex">
                <FaUserShield className="icon" />
                <input
                  type="text"
                  name="username"
                  id="username"
                  placeholder="Entrer le nom d'utilisateur"
                  value={user.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="inputDiv">
              <label htmlFor="email">Email</label>
              <div className="input flex">
                <MdEmail className="icon" />
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Entrer l'email"
                  value={user.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="formActions">
              <button type="submit" className="btn save flex">
                <span>Enregistrer</span>
                <MdSave className="icon" />
              </button>

              <button
                type="button"
                className="btn cancel flex"
                onClick={() => navigate(`/profile/${id}`)}
              >
                <span>Annuler</span>
                <MdCancel className="icon" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
