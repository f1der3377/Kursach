/**
 * Роутинг для списка мастеров
 */

import {
  BonusCardModel,
  ClientModel
} from './../database/index.js';

class ClientRoute {
  constructor(app) {
    app.route('/clients')
      .get(this.indexPage)
      .post(this.editOrCreate)
      .delete(this.delete)

    app.get('/clients/show/:id', this.showPage);
    app.get('/clients/create', this.createPage);
    app.get('/clients/edit/:id', this.editPage);
  }

  async indexPage(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const Clients = new ClientModel();
    const clients = await Clients.getAll();


    res.render('clients/index', { clients });
  }

  async showPage(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const { id } = req.params;
    const Client = new ClientModel();
    const client = await Client.getByID(id);

    const BonusCard = new BonusCardModel();
    let bonusCard = await BonusCard.getAll();

    res.render('clients/show', { 
      client,
      bonusCard
    });
  }

  async createPage(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const BonusCard = new BonusCardModel();
    let bonusCard = await BonusCard.getAll();

    res.render('clients/create', { bonusCard });
  }

  async editPage(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const { id } = req.params;
    const Client = new ClientModel();
    const client = await Client.getByID(id);

    const BonusCard = new BonusCardModel();
    let bonusCard = await BonusCard.getAll();

    res.render('clients/edit', { 
      client,
      bonusCard
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
      email,
      bonus_card_id
    } = req.body;

    const data = {
      surname,
      name,
      patronymic,
      date_birthday,
      gender,
      phone,
      email,
      bonus_card_id
    };

    const Client = new ClientModel();

    if(_method == 'PUT') {
      await Client.update(id, data);
    } else if(_method == 'POST') {
      id = (await Client.create(data)).id;
    }

    return res.redirect('/clients');
  }

  async delete(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const { id } = req.body;
    const Client = new ClientModel();
    await Client.delete(id);

    return res.send('OK');
  }
}

export default ClientRoute;