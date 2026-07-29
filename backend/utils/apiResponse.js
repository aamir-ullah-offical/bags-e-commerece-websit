export const success = (res, data = {}, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, ...data });
};

export const created = (res, data = {}, message = "Created successfully") => {
  return success(res, data, message, 201);
};

export const paginated = (res, data, total, page, limit, message = "Success") => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  });
};

export const error = (res, message = "Something went wrong", statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};
