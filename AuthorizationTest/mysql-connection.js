const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "raimondsdb",
  waitForConnections: true,
  connectionLimit: 10,
})

class DbStorage {
  constructor(tableName){
    this._table = tableName;
  }

  async getAll() {
    const [rows] = await pool.promise().query(`SELECT * FROM ${this._table}`);
    return rows;
  }

  async selectUser(key,val) {
      const [rows] = await pool.promise().query(`SELECT * FROM ${this._table} WHERE ${key} = '${val}'`);
      return rows;
  }

  async create(newStudentData){
    const [rows] = await pool.promise().query(`INSERT INTO ${this._table} (Login, Email, Password , ApiKey)  
    VALUES ('${newStudentData.login}', '${newStudentData.email}', '${newStudentData.password}', '${newStudentData.ApiKey}' )`);
    return rows.insertId;
  }

  async update(key,value,id) {
    const [rows] = await pool.promise().query(`UPDATE  ${this._table} SET ${key} = '${value}' WHERE id_User='${id}'`);
    return 'succes';
  }

  async delete(id) {
    const [rows] = await pool.promise().query(`DELETE FROM ${this._table} WHERE Id_Student=${id}`);
    return 'succes';
  }
}

module.exports = DbStorage;