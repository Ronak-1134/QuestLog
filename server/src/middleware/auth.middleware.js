import { auth } from '../config/firebase.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';

export const protect = catchAsync(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new ApiError(401, 'No token provided');

  const token = header.split(' ')[1];
  const decoded = await auth.verifyIdToken(token);

  req.user = { uid: decoded.uid, email: decoded.email };
  next();
});