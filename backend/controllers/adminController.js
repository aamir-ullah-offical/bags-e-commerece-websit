import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import * as R from "../utils/apiResponse.js";

export const getDashboardStats = async (req, res) => {
  const [
    totalProducts,
    totalOrders,
    totalCustomers,
    revenueAgg,
    recentOrders,
    topProducts,
    ordersByStatus,
    monthlySales,
  ] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    User.countDocuments({ role: "customer" }),
    Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.find()
      .populate("user", "fullName email avatar")
      .sort("-createdAt")
      .limit(10)
      .lean(),
    Product.find()
      .sort("-soldCount")
      .limit(5)
      .select("name images price soldCount category")
      .lean(),
    Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]),
  ]);

  const totalRevenue = revenueAgg[0]?.total || 0;

  const statusMap = ordersByStatus.reduce((acc, cur) => {
    acc[cur._id] = cur.count;
    return acc;
  }, {});

  R.success(res, {
    stats: {
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
    },
    recentOrders,
    topProducts,
    ordersByStatus: statusMap,
    monthlySales: monthlySales.reverse(),
  });
};

export const getAllUsers = async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort("-createdAt").skip(skip).limit(Number(limit)).select("-password"),
    User.countDocuments(filter),
  ]);

  R.paginated(res, users, total, page, limit);
};

export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return R.error(res, "User not found", 404);

  const orders = await Order.find({ user: req.params.id }).sort("-createdAt").limit(10);

  R.success(res, { user, orders });
};

export const updateUser = async (req, res) => {
  const { fullName, email, phone, role, isActive } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) return R.error(res, "User not found", 404);

  if (fullName !== undefined) user.fullName = fullName;
  if (email !== undefined) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();

  const updated = await User.findById(user._id).select("-password");
  R.success(res, { user: updated }, "User updated");
};

export const updateUserStatus = async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true }
  ).select("-password");
  if (!user) return R.error(res, "User not found", 404);
  R.success(res, { user }, `User ${isActive ? "activated" : "suspended"}`);
};

export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return R.error(res, "User not found", 404);
  if (user.role === "admin") return R.error(res, "Cannot delete an admin account", 403);

  await User.findByIdAndDelete(req.params.id);
  R.success(res, {}, "User deleted successfully");
};

export const resetUserPassword = async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return R.error(res, "Password must be at least 6 characters", 400);
  }

  const user = await User.findById(req.params.id).select("+password");
  if (!user) return R.error(res, "User not found", 404);

  user.password = newPassword;
  await user.save();

  R.success(res, {}, "Password reset successfully");
};
