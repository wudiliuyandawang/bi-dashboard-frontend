const mysql = require("mysql2/promise");
const { Pool } = require("pg");

const MYSQL = {
  host: "localhost", port: 3307, user: "root", password: "123456", database: "bi_dashboard",
};

function getNeonUrl() {
  if (process.env.POSTGRES_URL) return process.env.POSTGRES_URL;
  try {
    const env = require("fs").readFileSync(".env.local", "utf8");
    const m = env.match(/POSTGRES_URL=(\S+)/);
    return m ? m[1].replace(/^"/, "").replace(/"$/, "") : null;
  } catch (e) { return null; }
}

let rawUrl = getNeonUrl();
if (!rawUrl) { console.error("POSTGRES_URL not found."); process.exit(1); }

// Clean URL: keep only base, drop all query params
const cleanUrl = rawUrl.split("?")[0];
console.log("Connecting to: " + cleanUrl.replace(/\/\/.*@/, "//***@"));

const pg = new Pool({ connectionString: cleanUrl, ssl: { rejectUnauthorized: false } });

async function run() {
  console.log("Connecting to MySQL...");
  const mysqlConn = await mysql.createConnection(MYSQL);
  const [users] = await mysqlConn.query("SELECT * FROM user");
  const [products] = await mysqlConn.query("SELECT * FROM product");
  const [orders] = await mysqlConn.query("SELECT * FROM order_info");
  console.log("MySQL: users=" + users.length + " products=" + products.length + " orders=" + orders.length);
  await mysqlConn.end();

  console.log("Pushing to Neon...");
  const client = await pg.connect();
  await client.query("DELETE FROM order_info");
  await client.query("DELETE FROM product");
  await client.query("DELETE FROM users");
  for (const u of users) {
    await client.query("INSERT INTO users (id, username, password, role, create_time) VALUES ($1,$2,$3,$4,$5)",
      [u.id, u.username, u.password, u.role, u.create_time]);
  }
  for (const p of products) {
    await client.query("INSERT INTO product (id, name, category, price, create_time) VALUES ($1,$2,$3,$4,$5)",
      [p.id, p.name, p.category, p.price, p.create_time]);
  }
  for (const o of orders) {
    await client.query("INSERT INTO order_info (id, user_id, product_id, quantity, total_price, province, order_time) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [o.id, o.user_id, o.product_id, o.quantity, o.total_price, o.province, o.order_time]);
  }
  console.log("Done. " + users.length + "/" + products.length + "/" + orders.length + " rows synced.");
  client.release();
  await pg.end();
}
run().catch(e => { console.error(e); process.exit(1); });