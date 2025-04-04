let pg = require("pg");

let client = new pg.Client({
  connectionString: "postgresql://gambling_swtx_user:ROJgQb79o7bMkcbos4jaODnVJvy0WgzW@dpg-cvmsj2q4d50c73eco8eg-a.oregon-postgres.render.com/gambling_swtx",
    ssl: true,
});

let db = client.connect((err, res) => {console.log(err)});
