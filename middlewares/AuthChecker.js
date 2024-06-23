/**
 * Промежуточное ПО для проверки авторизации пользователя
 */

class AuthChecker {
  static async run(req, res, next) {
    if(req.path != '/login') {
      return (
        req.cookies['role'] &&
        req.cookies['role'] == 'администратор' ||
        req.cookies['role'] == 'директор'
      ) ? next() : res.redirect('/login');
    } else {
      return next();
    }
  }
}

export default AuthChecker;