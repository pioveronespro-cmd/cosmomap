const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ paid: false, error: 'session_id manquant' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === 'paid') {
      return res.status(200).json({ paid: true });
    }
    res.status(200).json({ paid: false });
  } catch (error) {
    console.error('Erreur Stripe:', error);
    res.status(400).json({ paid: false, error: 'Session invalide' });
  }
};
