/**
 * Вью таблица Отчета "Об оказании услуг за период"
 */

import BaseVW from "./BaseVW.js";

class ReportOrdersVW extends BaseVW {
  tableName = 'report_orders_vw';

  async getDataReport(date_start, date_end) {
    return await global.db.any(`SELECT * FROM ${this.tableName} WHERE date BETWEEN $1 AND $2 ORDER BY date`, [date_start, date_end]);
  }

  async getTotalSum(date_start, date_end) {
    return await global.db.any(`SELECT CONCAT(SUM(price), ' ₽') AS price FROM ${this.tableName} WHERE date BETWEEN $1 AND $2`, [date_start, date_end]);
  }

  async createView() {
    if(!await this.isCreatedTable()) {
      await global.db.query(`
        CREATE VIEW ${this.tableName} AS
        SELECT
          services.name AS service_name,
          CONCAT(staff.surname, ' ', staff.name, ' ', staff.patronymic) AS staff_fio,
          CONCAT(clients.surname, ' ', clients.name, ' ', clients.patronymic) AS client_fio,
          orders.date,
          TO_CHAR(orders.date::date, 'DD.MM.YYYY') AS human_date,
          orders.price AS price,
          CONCAT(orders.price, ' ₽') AS price_string
        FROM orders
        INNER JOIN services
          ON services.id = orders.service_id
        INNER JOIN clients
          ON clients.id = orders.client_id
        INNER JOIN staff
          ON staff.id = orders.staff_id
      `);
    }
  }
}

export default ReportOrdersVW;