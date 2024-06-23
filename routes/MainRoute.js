/**
 * Роутинг для главной страницы
 */

class MainRoute {
  constructor(app) {
    app.get('/', this.indexPage);
  }

  indexPage(req, res) {
    res.render('index', {
      title: 'Главная'
    });
  }
}

export default MainRoute;