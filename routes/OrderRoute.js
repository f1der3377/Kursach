/**
 * Роутинг для заказов
 */

import {
  ClientModel,
  OrderModel,
  OrderVW,
  ServiceModel,
  StatusOrderModel
} from './../database/index.js';

class OrderRoute {
  constructor(app) {
    app.route('/orders')
      .get(this.indexPage)
      .post(this.editOrCreate)
      .delete(this.delete)

    app.get('/orders/show/:id', this.showPage);
    app.get('/orders/create', this.createPage);
    app.get('/orders/edit/:id', this.editPage);
    app.get('/orders/get-price', this.getPrice);
  }

  async indexPage(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const Orders = new OrderVW();
    const orders = await Orders.getAll();


    res.render('orders/index', { orders });
  }

  async showPage(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const { id } = req.params;
    const Order = new OrderVW();
    const order = await Order.getByID(id);

    const Client = new ClientModel();
    const clients = await Client.getAll();

    const Service = new ServiceModel();
    const services = await Service.getAll();

    const StatusOrder = new StatusOrderModel();
    const statusOrders = await StatusOrder.getAll();


    res.render('orders/show', { order, clients, services, statusOrders })
  }

  async createPage(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const Client = new ClientModel();
    const clients = await Client.getAll();

    const Service = new ServiceModel();
    const services = await Service.getAll();

    res.render('orders/create', { clients, services });
  }

  async editPage(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const { id } = req.params;
    const Order = new OrderVW();
    const order = await Order.getByID(id);

    const Client = new ClientModel();
    const clients = await Client.getAll();

    const Service = new ServiceModel();
    const services = await Service.getAll();

    const StatusOrder = new StatusOrderModel();
    const statusOrders = await StatusOrder.getAll();


    res.render('orders/edit', { order, clients, services, statusOrders })
  }

  async editOrCreate(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const { 
      _method,
      id,
      client_id,
      service_id,
      date,
      hour,
      staff_id,
      status_order_id,
      price
    } = req.body;
    
    const data = {
      id,
      client_id,
      service_id,
      date,
      hour,
      staff_id,
      status_order_id,
      price
    };

    const Order = new OrderModel();

    if(_method == 'PUT') {
      await Order.update(id, data);
    } else if(_method == 'POST') {
      await Order.create(data);
    }

    return res.redirect('/orders');
  }

  async delete(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const { id } = req.body;
    const Order = new OrderModel();
    await Order.delete(id);

    return res.send('OK');
  }

  async getPrice(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const { client_id, service_id } = req.query;

    const Order = new OrderModel();
    const price = (await Order.getPrice(client_id, service_id)).price;

    return res.send(String(price));
  }
}

export default OrderRoute;