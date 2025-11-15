// routes/payments.js
import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import auth from "../middleware/auth.js"; // seu middleware de auth

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });

// 1) Criar Checkout Session (recebe priceId no body)
router.post("/create-checkout-session", auth, async (req, res) => {
  try {
    const { priceId } = req.body;
    if (!priceId) return res.status(400).json({ error: "priceId required" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // criar/recuperar customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user._id.toString() }
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"], // se seu Stripe tem PIX, pode incluir 'pix'
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 30 },
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`
    });

    return res.json({ url: session.url, id: session.id });
  } catch (err) {
    console.error("create-checkout-session error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// 2) Checar status de assinatura do usuário (usado pelo frontend)
router.post("/check-subscription", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Se tiver subscriptionId podemos checar no Stripe (opcional)
    let stripeInfo = null;
    if (user.subscriptionId) {
      try {
        stripeInfo = await stripe.subscriptions.retrieve(user.subscriptionId);
      } catch (e) {
        // ignore
      }
    }

    const now = new Date();
    const inTrial = user.trialEndsAt && new Date(user.trialEndsAt) > now;
    const active = user.isSubscriber || (stripeInfo && stripeInfo.status === "active") || inTrial;

    return res.json({
      active,
      subscriptionStatus: user.subscriptionStatus || (stripeInfo && stripeInfo.status) || "inactive",
      trialEndsAt: user.trialEndsAt,
      subscriptionId: user.subscriptionId
    });
  } catch (err) {
    console.error("check-subscription error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// 3) Cancelar assinatura (opcional)
router.post("/cancel-subscription", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.subscriptionId) return res.status(400).json({ error: "No subscription to cancel" });

    await stripe.subscriptions.del(user.subscriptionId);
    user.isSubscriber = false;
    user.subscriptionId = null;
    user.subscriptionStatus = "canceled";
    await user.save();

    return res.json({ ok: true });
  } catch (err) {
    console.error("cancel-subscription error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
