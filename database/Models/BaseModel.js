class BaseModel {
  tableName = null;

  async query(sql, params) {
    return await global.db.any(sql, params);
  }

  async getAll() {
    return await global.db.any(`SELECT * FROM ${this.tableName}`);
  }

  async getAllForSelect(column = 'name') {
    let res = await global.db.any(`SELECT ${column} FROM ${this.tableName} ORDER BY id ASC`);
    res = res.map(el => el[`${column}`]);

    const objRes = {};
    res.forEach((val, index) => objRes[index] = val)

    return objRes;
  }

  async getByID(id) {
    return await global.db.oneOrNone(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
  }

  async update(id, data) {
    let [sql, arrData] = this.getPreparedUpdated(data);

    await global.db.query(`
      UPDATE ${this.tableName}
      SET ${sql}
      WHERE id = ${id}
    `, arrData);

    return await this.getByID(id);
  }

  async delete(id) {
    return await global.db.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
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

  getPreparedUpdated(data) {
    const columns = Object.keys(data)
    let values = Object.values(data)
    
    let sql = '';
    for(let i = 0; i < columns.length; i++) {
      sql += `${columns[i]} = $${i + 1},`;
    }
    sql = sql.slice(0, -1)

    values = values.map(el => el == '' ? null : el)

    return [sql, values];
  }

  async create(data) {
    throw new Error('Method is not implemented');
  }

  async createTable() {
    throw new Error('Method is not implemented');
  }
}

export default BaseModel;