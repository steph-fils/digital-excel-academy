const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const FICHIER_DONNEES = path.join(__dirname, 'inscriptions.json');

// 1. Configuration du service d'e-mail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'TON_EMAIL@gmail.com',         // Remplace par ton adresse Gmail
        pass: 'MOT_DE_PASSE_D_APPLICATION'  // Remplace par ton mot de passe d'application Google
    }
});

// Function pour envoyer l'e-mail de notification
function envoyerNotificationEmail(donnees) {
    const mailOptions = {
        from: 'TON_EMAIL@gmail.com',
        to: 'TON_EMAIL@gmail.com', // L'adresse qui recevra les alertes
        subject: `🔔 Nouvelle pré-inscription : ${donnees.nom}`,
        text: `Vous avez reçu une nouvelle inscription !\n\nNom: ${donnees.nom}\nTéléphone: ${donnees.telephone}\nFormation: ${donnees.formation}\nVille: ${donnees.ville}\nDate: ${donnees.date}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Erreur d'envoi d'e-mail :", error);
        } else {
            console.log("E-mail de notification envoyé :", info.response);
        }
    });
}

// Function pour lire le fichier JSON
function lireInscriptions() {
    if (!fs.existsSync(FICHIER_DONNEES)) {
        fs.writeFileSync(FICHIER_DONNEES, JSON.stringify([]));
    }
    const contenu = fs.readFileSync(FICHIER_DONNEES, 'utf-8');
    return JSON.parse(contenu || '[]');
}

// 2. Route POST : Recevoir une inscription
app.post('/api/inscription', (req, res) => {
    const nouvelleInscription = req.body;
    nouvelleInscription.id = Date.now();
    nouvelleInscription.date = new Date().toLocaleString('fr-FR');

    // Sauvegarde dans le fichier JSON
    const inscriptions = lireInscriptions();
    inscriptions.push(nouvelleInscription);
    fs.writeFileSync(FICHIER_DONNEES, JSON.stringify(inscriptions, null, 2));

    console.log("Nouvelle inscription enregistrée :", nouvelleInscription);

    // Envoi de la notification e-mail
  // envoyerNotificationEmail(nouvelleInscription);
    res.status(200).json({ 
        message: "Inscription réussie !", 
        data: nouvelleInscription 
    });
});

// 3. Route GET : Récupérer toutes les inscriptions
app.get('/api/inscriptions', (req, res) => {
    const inscriptions = lireInscriptions();
    res.status(200).json(inscriptions);
});

// Démarrage du serveur
// Route PUT : Mettre à jour le statut d'une inscription
app.put('/api/inscription/:id', (req, res) => {
    const { id } = req.params;
    const { statut } = req.body;

    let inscriptions = lireInscriptions();
    const index = inscriptions.findIndex(item => item.id == id);

    if (index !== -1) {
        inscriptions[index].statut = statut;
        fs.writeFileSync(FICHIER_DONNEES, JSON.stringify(inscriptions, null, 2));
        res.status(200).json({ message: "Statut mis à jour !", data: inscriptions[index] });
    } else {
        res.status(404).json({ message: "Inscription non trouvée." });
    }
});
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});