/**
 * Вью таблица перечня услуг
 */

import BaseVW from "./BaseVW.js";

class ServicesVW extends BaseVW {
  tableName = 'services_vw';

  async createView() {
    if(!await this.isCreatedTable()) {
      await global.db.query(`
        CREATE VIEW ${this.tableName} AS
        SELECT
          services.*,
          type_service.name AS type_service_name
        FROM services
        INNER JOIN type_service
          ON type_service.id = services.type_service_id;
      `);
    }
  }
}

export default ServicesVW;