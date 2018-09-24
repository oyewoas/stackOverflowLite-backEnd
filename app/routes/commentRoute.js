import {
  createUser, logIn, getProfile, updateProfile, updateName,
} from '../controllers/commentController';


export default function commentRoute(app) {
  app.post('api/v1/comments', createUser);

  app.put('/api/v1/answers/:comment_id', logIn);

}