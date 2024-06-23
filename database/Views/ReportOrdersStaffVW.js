/**
 * Вью таблица Отчета "Сведенья об оказании услуг мастером"
 */

import BaseVW from "./BaseVW.js";

class ReportOrdersStaffVW extends BaseVW {
  tableName = 'report_orders_staff_vw';

  async getDataReport(staff_id, date) {
    return await global.db.any(`SELECT * FROM ${this.tableName} WHERE staff_id = $1 ORDER BY date`, [staff_id]);
  }

  async createView() {
    if(!await this.isCreatedTable()) {
      await global.db.query(`
        CREATE VIEW ${this.tableName} AS
        SELECT
          CONCAT(staff.surname, ' ', staff.name, ' ', staff.patronymic) AS staff_fio,
          orders.staff_id,
          orders.date,
          TO_CHAR(orders.date::date, 'DD.MM.YYYY') AS human_date,
          services.name AS service_name,
          CONCAT(clients.surname, ' ', clients.name, ' ', clients.patronymic) AS client_fio,
          CONCAT(orders.price, ' ₽') AS price
        FROM orders
        INNER JOIN clients
          ON clients.id = orders.client_id
        INNER JOIN staff
          ON staff.id = orders.staff_id
        INNER JOIN services
          ON services.id = orders.service_id
      `);
    }
  }
}

export default ReportOrdersStaffVW;