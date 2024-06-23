/**
 * Роутинг для списка мастеров
 */

import {
  ServiceModel,
  StaffModel,
  StaffServiceModel
} from './../database/index.js';

class StaffRoute {
  constructor(app) {
    app.route('/staff')
      .get(this.indexPage)
      .post(this.editOrCreate)
      .delete(this.delete)

    app.get('/staff/show/:id', this.showPage);
    app.get('/staff/create', this.createPage);
    app.get('/staff/edit/:id', this.editPage);

    app.get('/staff/free-staff-data', this.freeStaffData);
  }

  async indexPage(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const Staff = new StaffModel();
    const staff = await Staff.getAll();


    res.render('staff/index', { staff });
  }

  async showPage(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const { id } = req.params;
    const Staff = new StaffModel();
    const staff = await Staff.getByID(id);

    const Services = new ServiceModel();
    let services = await Services.getAllForSelect();

    const StaffService = new StaffServiceModel();
    let staffServices = await StaffService.query('SELECT DISTINCT service_id FROM staff_service WHERE staff_id = $1', [ id ]);
    staffServices = staffServices.map(val => val.service_id);

    res.render('staff/show', { 
      staff,
      services: JSON.stringify(services),
      staffServices: JSON.stringify(staffServices)
    });
  }

  async createPage(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const Services = new ServiceModel();
    let services = await Services.getAllForSelect();

    res.render('staff/create', { services: JSON.stringify(services) });
  }

  async editPage(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const { id } = req.params;
    const Staff = new StaffModel();
    const staff = await Staff.getByID(id);

    const Services = new ServiceModel();
    let services = await Services.getAllForSelect();

    const StaffService = new StaffServiceModel();
    let staffServices = await StaffService.query('SELECT DISTINCT service_id FROM staff_service WHERE staff_id = $1', [ id ]);
    staffServices = staffServices.map(val => val.service_id);

    res.render('staff/edit', { 
      staff,
      services: JSON.stringify(services),
      staffServices: JSON.stringify(staffServices)
    });
  }

  async editOrCreate(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    let { 
      _method,
      id,
      surname,
      name,
      patronymic,
      date_birthday,
      gender,
      phone,
      date_start_work,
      date_end_work,

      services
    } = req.body;

    const data = {
      surname,
      name,
      patronymic,
      date_birthday,
      gender,
      phone,
      date_start_work,
      date_end_work
    };

    const Staff = new StaffModel();
    const StaffService = new StaffServiceModel();

    if(_method == 'PUT') {
      await Staff.update(id, data);
    } else if(_method == 'POST') {
      id = (await Staff.create(data)).id;
    }

    await StaffService.query('DELETE FROM staff_service WHERE staff_id = $1', [id]);
    if(services) {
      services.forEach(async service_id => {
        await StaffService.create({ staff_id: id, service_id })
      })
    }

    return res.redirect('/staff');
  }

  async delete(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const { id } = req.body;
    const Staff = new StaffModel();
    await Staff.delete(id);

    return res.send('OK');
  }

  async freeStaffData(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const { service_id, date, hour } = req.query;

    const Staff = new StaffModel();
    const freeStaff = await Staff.getListFreeStaffDate(service_id, date, hour);

    res.send(freeStaff);
  }
}

export default StaffRoute;