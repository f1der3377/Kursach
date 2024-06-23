class BaseVW {
  tableName = null;

  async createView() {
    throw new Error('Method is not implemented');
  }

  async getAll() {
    return await global.db.any(`SELECT * FROM ${this.tableName}`);
  }

  async getByID(id) {
    return await global.db.oneOrNone(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
  }

  async isCreatedTable() {
    return (await global.db.query(`
      SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = '${this.tableName}'
      )
    `))[0].exists;
  }
}

export default BaseVW;