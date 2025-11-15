// backend/middleware/isSubscribed.js
import User from "../models/User.js";

export default async function isSubscribed(req, res, next) {
  try {
    const userId = req.userId; // seu auth middleware deve preencher req.userId
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const now = new Date();

    // condição 1: marca explícita de assinante
    if (user.isSubscriber) return next();

    // condição 2: status ativo no Stripe (se estiver salvando subscriptionStatus)
    if (user.subscriptionStatus && user.subscriptionStatus === "active") return next();

    // condição 3: ainda está no trial
    if (user.trialEndsAt && new Date(user.trialEndsAt) > now) return next();

    // se chegou aqui, não tem acesso
    return res.status(403).json({ message: "Subscription required" });
  } catch (err) {
    console.error("isSubscribed middleware error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
