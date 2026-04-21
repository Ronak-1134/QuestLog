export const success = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({ status: 'success', data });
};

export const paginated = (res, data, total, page, limit) => {
  return res.status(200).json({
    status: 'success',
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
    data,
  });
};