/**
 * Вью таблица заказов
 */

import BaseVW from "./BaseVW.js";

class OrderVW extends BaseVW {
  tableName = 'orders_vw';

  async createView() {
    if(!await this.isCreatedTable()) {
      await global.db.query(`
        CREATE VIEW ${this.tableName} AS
        SELECT
          orders.id,
          orders.service_id,
          services.name AS service_name,
          orders.staff_id,
          CONCAT(staff.surname, ' ', staff.name, ' ', staff.patronymic) AS staff_fio,
          orders.client_id,
          CONCAT(clients.surname, ' ', clients.name, ' ', clients.patronymic) AS client_fio,
          orders.date,
          orders.hour AS hour_original,
          CONCAT(orders.hour, ' часов') AS hour,
          orders.status_order_id,
          status_order.name AS status_order_name,
          orders.price
        FROM orders
        INNER JOIN services
          ON services.id = orders.service_id
        INNER JOIN staff
          ON staff.id = orders.staff_id
        INNER JOIN clients
          ON clients.id = orders.client_id
        LEFT JOIN bonus_card
          ON bonus_card.id = clients.bonus_card_id
        INNER JOIN status_order
          ON status_order.id = orders.status_order_id
      `);
    }
  }
}

export default OrderVW;