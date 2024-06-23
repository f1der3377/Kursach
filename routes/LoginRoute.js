/**
 * Роутинг для авторизации
 */

import {
  UserModel
} from './../database/index.js';

class LoginRoute {
  constructor(app) {
    app.route('/login')
      .get(this.loginPage)
      .post(this.login)

    app.get('/logout', this.logout);
  }

  async loginPage(req, res) {
    const User = new UserModel();
    const userList = await User.getAll();

    res.render('login', {
      title: 'Авторизация',
      isNotShowMenu: true,
      userList
    });
  }

  async login(req, res) {
    const { user_id } = req.body;

    const User = new UserModel();
    const user = await User.getByID(user_id);
    if(user) {
      res.cookie('role', user.role);
      res.sendStatus(200);
    } else {
      res.status(401).send('Ошибка, пользователь не найден');
    }
  }

  logout(req, res) {
    const cookies = Object.keys(req.cookies);
    cookies.forEach(cookie => {
        res.clearCookie(cookie);
    });

    return res.redirect('/login');
  }
}

export default LoginRoute;