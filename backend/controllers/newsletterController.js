import Newsletter from "../models/Newsletter.js";
import * as R from "../utils/apiResponse.js";

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const subscribe = async (req, res) => {
  const { email, source = "website" } = req.body;

  if (!email?.trim()) return R.error(res, "Email address is required", 400);
  if (!EMAIL_RE.test(email.trim())) return R.error(res, "Please provide a valid email address", 400);

  const existing = await Newsletter.findOne({ email: email.trim().toLowerCase() });
  if (existing) {
    if (existing.isActive) return R.error(res, "Email already subscribed", 409);
    existing.isActive = true;
    await existing.save();
    return R.success(res, {}, "Subscription reactivated");
  }

  await Newsletter.create({ email: email.trim().toLowerCase(), source });
  R.created(res, {}, "Subscribed successfully");
};

export const unsubscribe = async (req, res) => {
  const { email } = req.body;
  const subscriber = await Newsletter.findOneAndUpdate(
    { email },
    { isActive: false },
    { new: true }
  );

  if (!subscriber) return R.error(res, "Email not found", 404);
  R.success(res, {}, "Unsubscribed successfully");
};

export const getSubscribers = async (req, res) => {
  const { page = 1, limit = 50, active } = req.query;
  const filter = {};
  if (active !== undefined) filter.isActive = active === "true";

  const skip = (Number(page) - 1) * Number(limit);
  const [subscribers, total] = await Promise.all([
    Newsletter.find(filter).sort("-subscribedAt").skip(skip).limit(Number(limit)),
    Newsletter.countDocuments(filter),
  ]);

  R.paginated(res, subscribers, total, page, limit);
};
