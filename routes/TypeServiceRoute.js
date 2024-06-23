/**
 * Роутинг для списка вид услуг
 */

import {
  TypeServiceModel
} from './../database/index.js';

class TypeServiceRoute {
  constructor(app) {
    app.route('/type_service')
      .get(this.indexPage)
      .post(this.editOrCreate)
      .delete(this.delete)

    app.get('/type_service/create', this.createPage);
    app.get('/type_service/edit/:id', this.editPage);
  }

  async indexPage(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const TypeServices = new TypeServiceModel();
    const typeServices = await TypeServices.getAll();


    res.render('type_service/index', { typeServices });
  }

  async createPage(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    res.render('type_service/create');
  }

  async editPage(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const { id } = req.params;
    const TypeServices = new TypeServiceModel();
    const typeService = await TypeServices.getByID(id);

    res.render('type_service/edit', { typeService })
  }

  async editOrCreate(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const { _method, id, name } = req.body;
    const TypeService = new TypeServiceModel();

    if(_method == 'PUT') {
      await TypeService.update(id, { name });
    } else if(_method == 'POST') {
      await TypeService.create({ name });
    }

    return res.redirect('/type_service');
  }

  async delete(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const { id } = req.body;
    const TypeService = new TypeServiceModel();
    await TypeService.delete(id);

    return res.send('OK');
  }
}

export default TypeServiceRoute;