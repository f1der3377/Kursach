/**
 * Модель "Заказ"
 */

import BaseModel from "./BaseModel.js";

class OrderModel extends BaseModel {
  tableName = 'orders';

  async getPrice(client_id, service_id) {
    return await global.db.one(`
      SELECT
        CASE
          WHEN bonus_card.discount IS NOT NULL THEN services.price - ((services.price / 100) * bonus_card.discount)
          ELSE services.price
        END AS price
      FROM services
      INNER JOIN clients
        ON clients.id = $1
      LEFT JOIN bonus_card
        ON bonus_card.id = clients.bonus_card_id
      WHERE services.id = $2
    `, [client_id, service_id]);
  }

  async create(data) {
    return await global.db.one(`INSERT INTO ${this.tableName} (
      service_id,
      staff_id,
      client_id,
      date,
      hour,
      status_order_id,
      price
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7
    ) RETURNING id`, [
      data.service_id,
      data.staff_id,
      data.client_id,
      data.date,
      data.hour,
      data.status_order_id,
      data.price
    ]);
  }

  async getReportVolumeServices(date_start, date_end) {
    return await global.db.any(`
      SELECT
        services.name AS service_name,
        COUNT(orders.id) AS count_service,
        CONCAT(SUM(orders.price), ' ₽') AS price_string
      FROM orders
      INNER JOIN services
        ON services.id = orders.service_id
      WHERE orders.date BETWEEN $1 AND $2
      GROUP BY services.name
    `, [date_start, date_end]);
  }

  async createTable() {
    if(!await this.isCreatedTable()) {
      await global.db.query(`
        CREATE TABLE IF NOT EXISTS "${this.tableName}" (
          "id" SERIAL PRIMARY KEY,
          "service_id" int NOT NULL,
          "staff_id" int NOT NULL,
          "client_id" int NOT NULL,
          "date" TEXT NOT NULL,
          "hour" TEXT NOT NULL,
          "status_order_id" int NOT NULL,
          "price" REAL NOT NULL,
          FOREIGN KEY ("service_id") REFERENCES "services" ("id") ON DELETE CASCADE,
          FOREIGN KEY ("staff_id") REFERENCES "staff" ("id") ON DELETE CASCADE,
          FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE CASCADE,
          FOREIGN KEY ("status_order_id") REFERENCES "status_order" ("id")
        );
      `);
    }
  }
}

export default OrderModel;