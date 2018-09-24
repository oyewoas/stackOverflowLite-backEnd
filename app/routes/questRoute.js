import {
  createUser, logIn, getProfile, updateProfile, updateName,
} from '../controllers/questController';


export default function questRoute(app) {
  app.get('/api/v1/questions', createUser);

  app.get('/api/v1/questions/:quest_id', logIn);

  app.post('/api/v1/questions', getProfile);

  app.delete('/api/v1/questions/:quest_id', updateProfile);

}