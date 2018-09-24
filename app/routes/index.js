import usersRoute from './usersRoute';
import ansRoute from './ansRoute';
import questRoute from './questRoute';
import commentRoute from './commentRoute';



export default function router(app) {
  usersRoute(app);
  ansRoute(app);
  questRoute(app);
  commentRoute(app);

  // Other route groups could go here, in the future
}
