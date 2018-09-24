import {
  createUser, logIn, getProfile, updateProfile, updateDisplayName,
} from '../controllers/usersController';

import verifyAuth from '../middlewares/verifyAuth';

export default function usersRoute(app) {
  app.post('/api/v1/signup', createUser);

  app.post('/api/v1/login', logIn);

  app.get('/api/v1/user/profile', verifyAuth, getProfile);

  app.put('/api/v1/user/profile', verifyAuth, updateProfile);

  app.put('/api/v1/user/updatename', verifyAuth, updateDisplayName);
}
