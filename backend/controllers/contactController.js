import ContactMessage from "../models/ContactMessage.js";
import * as R from "../utils/apiResponse.js";

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const submitContact = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name?.trim()) return R.error(res, "Full name is required", 400);
  if (!email?.trim()) return R.error(res, "Email address is required", 400);
  if (!EMAIL_RE.test(email.trim())) return R.error(res, "Please provide a valid email address", 400);
  if (!message?.trim()) return R.error(res, "Message is required", 400);
  if (message.trim().length < 10) return R.error(res, "Message must be at least 10 characters", 400);

  const contact = await ContactMessage.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject?.trim() || "General Enquiry",
    message: message.trim(),
  });
  R.created(res, { contact }, "Message received — our team will be in touch shortly");
};

export const getContactMessages = async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();
  R.success(res, { messages, total: messages.length }, "Contact messages fetched");
};

export const markAsRead = async (req, res) => {
  const msg = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );
  if (!msg) return R.error(res, "Message not found", 404);
  R.success(res, { message: msg }, "Marked as read");
};

export const deleteMessage = async (req, res) => {
  const msg = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!msg) return R.error(res, "Message not found", 404);
  R.success(res, {}, "Message deleted");
};
