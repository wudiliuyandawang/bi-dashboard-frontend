const mysql = require("mysql2/promise");
const { neon } = require("@neondatabase/serverless");

const MYSQL = {
  host: "localhost",
  port: 3307,
  user: "root",
  password: "123456",
  database: "bi_dashboard",
};

const NEON_URL = process.env.POSTGRES_URL;
if (!NEON_URL) {
  console.error("POSTGRES_URL env var not set. Copy it from .env.local or Vercel dashboard.");
  process.exit(1);
}

const sql = neon(NEON_URL);

async function run() {
  console.log("Connecting to MySQL...");
  const mysqlConn = await mysql.createConnection(MYSQL);

  const [users] = await mysqlConn.query("SELECT * FROM user");
  const [products] = await mysqlConn.query("SELECT * FROM product");
  const [orders] = await mysqlConn.query("SELECT * FROM order_info");
  console.log("MySQL: users=" + users.length + " products=" + products.length + " orders=" + orders.length);
  await mysqlConn.end();

  console.log("Pushing to Neon...");

  // Clear existing
  await sql("DELETE FROM order_info");
  await sql("DELETE FROM product");
  await sql("DELETE FROM users");

  // Insert
  for (const u of users) {
    await sql(
      "INSERT INTO users (id, username, password, role, create_time) VALUES ($1,$2,$3,$4,$5)",
      [u.id, u.username, u.password, u.role, u.create_time]
    );
  }
  for (const p of products) {
    await sql(
      "INSERT INTO product (id, name, category, price, create_time) VALUES ($1,$2,$3,$4,$5)",
      [p.id, p.name, p.category, p.price, p.create_time]
    );
  }
  for (const o of orders) {
    await sql(
      "INSERT INTO order_info (id, user_id, product_id, quantity, total_price, province, order_time) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [o.id, o.user_id, o.product_id, o.quantity, o.total_price, o.province, o.order_time]
    );
  }

  console.log("Done. Data synced to Neon.");
  console.log("Next: run 'npx vercel --prod --yes' to redeploy.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});