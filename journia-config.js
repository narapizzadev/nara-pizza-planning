/* =====================================================================
   JOURNIA — réglages de l'établissement
   Ce fichier est le seul à changer d'une maison à l'autre. Il se dépose
   à côté de stock.html.
   ===================================================================== */
window.JOURNIA = {
  // Le nom affiché en haut de l'écran et sur les commandes aux fournisseurs.
  etablissement: "Nara Pizza",
  // L'adresse ajoutée en bas des commandes. Laisser vide pour ne rien mettre.
  adresse: "",
  // Où mène « ← Journia » : la page de Journia Planning.
  retour: "./",

  // La connexion à Firebase : la même que celle de Journia Planning.
  // Mettre null pour essayer sans rien enregistrer en ligne (mode local).
  firebase: {
    apiKey: "AIzaSyB337El2PUsl00uRTBK30H55-5oSCwCmzg",
    authDomain: "nara-pizza-planning.firebaseapp.com",
    projectId: "nara-pizza-planning",
    storageBucket: "nara-pizza-planning.firebasestorage.app",
    messagingSenderId: "446901439990",
    appId: "1:446901439990:web:7688317ee81a0d1a3e8bd7"
  },

  stock: {
    // Les rayons proposés dans la fiche d'un article. « Autre » est toujours ajouté.
    categories: ["Pâtes et farines", "Fromages et charcuterie", "Légumes et sauces", "Boissons", "Emballages", "Entretien"],
    // Une liste de départ, importable en un geste quand le stock est vide.
    // Chaque ligne : [rayon, unité, [articles]]. C'est un exemple : adaptez-le ou videz-le.
    depart: [
      ["Pâtes et farines", "sac", ["Farine", "Semoule", "Levure"]],
      ["Fromages et charcuterie", "kg", ["Mozzarella", "Jambon", "Salami piquant", "Gorgonzola"]],
      ["Légumes et sauces", "boîte", ["Sauce tomate", "Champignons", "Olives", "Artichauts"]],
      ["Boissons", "carton", ["Eau plate", "Eau gazeuse", "Coca-Cola", "Bière"]],
      ["Emballages", "paquet", ["Cartons à pizza 33 cm", "Cartons à pizza 40 cm", "Sacs de livraison", "Serviettes"]]
    ]
  }
};
