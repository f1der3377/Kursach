/**
 * Роутинг для списка предоставляемых услуг
 */

import {
  ServiceModel, 
  ServicesVW, 
  TypeServiceModel
} from './../database/index.js';

class ServiceRoute {
  constructor(app) {
    app.route('/services')
      .get(this.indexPage)
      .post(this.editOrCreate)
      .delete(this.delete)

    app.get('/services/create', this.createPage);
    app.get('/services/edit/:id', this.editPage);
  }

  async indexPage(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const Services = new ServicesVW();
    const services = await Services.getAll();


    res.render('services/index', { services });
  }

  async createPage(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const TypeServices = new TypeServiceModel();
    const typeServices = await TypeServices.getAll();

    res.render('services/create', { typeServices });
  }

  async editPage(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const { id } = req.params;
    const Services = new ServiceModel();
    const service = await Services.getByID(id);

    const TypeServices = new TypeServiceModel();
    const typeServices = await TypeServices.getAll();


    res.render('services/edit', { service, typeServices })
  }

  async editOrCreate(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const { _method, id, type_service_id, name, price } = req.body;
    const Services = new ServiceModel();

    if(_method == 'PUT') {
      await Services.update(id, { name, type_service_id, price });
    } else if(_method == 'POST') {
      await Services.create({ name, type_service_id, price });
    }

    return res.redirect('/services');
  }

  async delete(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const { id } = req.body;
    const Services = new ServiceModel();
    await Services.delete(id);

    return res.send('OK');
  }
}

export default ServiceRoute;