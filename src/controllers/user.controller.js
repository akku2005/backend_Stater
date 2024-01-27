const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  try {
    const userDetails = req.body;
    const userId = req.params.userId;

    const user = await userService.updateUserById(userId, userDetails);

    if (user) {
      res.status(httpStatus.OK).json({ success: true, message: 'User details updated successfully.' });
    } else {
      res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'User not found.' });
    }
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error updating user details.' });
  }
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
