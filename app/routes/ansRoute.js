import {
  createUser, logIn, getProfile, updateProfile, updateName,
} from '../controllers/ansController';


export default function ansRoute(app) {
  app.post('api/v1/answers', createUser);

  app.put('/api/v1/answers/:ans_id', logIn);

  app.put('/api/v1/answeraccepted/:ans_id', getProfile);


}
