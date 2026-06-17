// Ce fichier crée une "page de paiement Stripe" quand quelqu'un clique sur "Payer"
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { tool, pseudo } = req.body;

  // Prix en centimes (Stripe travaille toujours en centimes)
  const prices = { star: 100, moon: 200, sun: 300 }; // 1€, 2€, 3€
  const names  = { star: 'Étoile ⭐', moon: 'Lune 🌙', sun: 'Soleil ☀️' };

  // Vérification de sécurité : on rejette toute valeur inconnue
  if (!prices[tool] || !pseudo || pseudo.length > 24) {
    return res.status(400).json({ error: 'Requête invalide' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: `${names[tool]} - CosmoMap` },
          unit_amount: prices[tool],
        },
        quantity: 1,
      }],
      mode: 'payment',
      // Après un paiement réussi, Stripe renvoie l'utilisateur ici :
      success_url: `https://cosmomap-iota.vercel.app/?paid=1&tool=${tool}&pseudo=${encodeURIComponent(pseudo)}&session_id={CHECKOUT_SESSION_ID}`,
cancel_url: `https://cosmomap-iota.vercel.app/?canceled=1`,

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Erreur Stripe:', error);
    res.status(500).json({ error: 'Erreur lors de la création du paiement' });
  }
};
