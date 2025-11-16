import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe exige receber o body "raw"
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("❌ Erro no webhook:", err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  // --- EVENTOS IMPORTANTES ---
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const email = session.customer_details.email;
    const subscriptionId = session.subscription;

    if (email) {
      await User.findOneAndUpdate(
        { email },
        { isSubscriber: true, subscriptionId }
      );
      console.log("🚀 Usuário ativado como assinante:", email);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;

    await User.findOneAndUpdate(
      { subscriptionId: subscription.id },
      { isSubscriber: false }
    );

    console.log("⚠️ Assinatura cancelada:", subscription.id);
  }

  res.status(200).send("Webhook recebido");
});

export default router;
