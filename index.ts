const path = require("path");
const { fileURLToPath } = require("url");
const express = require("express");
const fs = require("fs");
const env = require("dotenv").config();

const { Client } = require("pg");

let DB = new Client({
  connectionString: process.env.DBURL,
  ssl: true,
})

DB.connect();

const bodyParser = require("body-parser");

const viewDir = path.join(__dirname, "views");

interface player {
  name: string;
  balance: number;
  id: number;
  plinkoPlayed: number;
  bridgeGamesPlayed: number;
  wheelOfFortunePlayed: number;
  coinFlipsPlayed: number;
}

let playerData: player[] = []; 

async function loadFromDB(){
  let res =  await DB.query("SELECT * FROM playerData ORDER BY balance LIMIT 100;");
  console.log("Loading data...")
  res.rows.map(
    (row, index) => {
      console.log("Index " + index + ": " + JSON.stringify(row));
      playerData.push({
        name: row.username,
        balance: Number(row.balance),
        id: row.id,
        plinkoPlayed: row.plinkoplayed,
        bridgeGamesPlayed: row.bridgeGamesPlayed,
        wheelOfFortunePlayed: row.wheeloffortuneplayed,
      });
    }
  )
}

loadFromDB();

const app = express();

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "views")));

app.get("/", (req, res) => {
  res.sendFile(path.join(viewDir, "games/index.html"));
});

app.post("/api/create", async (req, res) => {
  const name = req.body.name.toString();

  
  const id = Math.floor(Math.random()*99999)
  
  DB.query("INSERT INTO playerData (username, id) VALUES ($1, $2);", [
    name, id
  ]);

  const player = {
    name,
    balance: 1000,
    id,
    plinkoPlayed: 0,
    bridgeGamesPlayed: 0,
    wheelOfFortunePlayed: 0,
  };

  playerData.push(player);


  res.send(JSON.stringify({ id: player.id, username: player.name }));
});

app.get("/api/info", (req, res) => {
  const id = req.query.id;

  let player = playerData.find((p) => id==p.id);

  if(player){
    res.send({id: player.id, username: player.name});
  }
  
})

app.get("/api/balance", (req, res) => {
  let id = req.query.id;
  let player = playerData.find((p) => {
    return p.id == id;
  });

  if (player) {
    player.balance = Math.floor(player.balance * 100) / 100;
    res.send(JSON.stringify({ balance: player.balance }));
  } else {
    res.sendStatus(404);
  }
});

app.get("/api/playerdata", (req, res) => {
  let stripped = playerData.map(player => { return {
    name: player.name,
    balance: player.balance,
    plinkoPlayed: player.plinkoPlayed,
    bridgeGamesPlayed: player.bridgeGamesPlayed,
    wheelOfFortunePlayed: player.wheelOfFortunePlayed,
  };});
  res.send(JSON.stringify(playerData));
});

app.get("/api/playerdatafull", (req, res) => {
  const password = req.query.password;

  if(password == process.env.PASSWORD){
    res.send({data: playerData});
  }
  else{
    console.log("INVALID password attempt");
  }
})

app.get("/plinko/drop", (req, res) => {
  const userid = req.query.id;
  let amount = req.query.amount;

  let player = playerData.find((p) => p.id == userid);

  if (!player) {
    res.sendStatus(404);
    return;
  }

  player.plinkoPlayed++;

  if (amount > player.balance || amount < 0) {
    res.sendStatus(400);
    return;
  }

  let ans: boolean[] = [];
  let dist = 0;
  for (let i = 0; i < 8; i++) {
    if (Math.random() > 0.5) {
      ans.push(true);
      dist += 1;
    } else {
      ans.push(false);
      dist -= 1;
    }
  }

  dist = Math.abs(dist) / 2;

  let multiplier = 1;
  switch (dist) {
    case 0:
      multiplier = 0.5;
      break;
    case 1:
      multiplier = 0.75;
      break;
    case 2:
      multiplier = 2;
      break;
    case 3:
      multiplier = 10;
      break;
    case 4:
      multiplier = 50;
      break;
    default:
      multiplier = 1;
      console.warn("plinko is out of bounds");
      break;
  }

  player.balance -= amount;
  amount *= multiplier;
  player.balance += amount;
  player.balance = Math.floor(player.balance * 100) / 100;
  
  DB.query(
    "UPDATE playerData SET balance = $1, plinkoPlayed = $2 WHERE id = $3",
    [player.balance.toString(), player.plinkoPlayed, player.id]
  );


  //console.log(ans);
  //console.log(multiplier);

  res.send(
    JSON.stringify({
      seed: ans,
      balance: player.balance,
    })
  );
});

app.post("/api/customdb", async (req, res) => {
  const password = req.query.password;
  if(password == process.env.PASSWORD){
    if(req.body.newdb.length > 1){
      await DB.query("SELECT * FROM playerData;").then((old) => old.text()).then((old) => {
        res.send(old);
      })

      await DB.query("DROP TABLE playerData;");

      const initSql = fs.readSync(path.join(__dirname, "initial.sql"));
      
      await DB.query(initSql);

      playerData = req.body.newdb;

      playerData.forEach((row) => {
        DB.query("INSERT INTO playerData (username, id, balance, plinkoplayed, coinflipplayed, wheeloffortuneplayed) VALUES ($1, $2, $3, $4, $5, $6);", [
          row.name,
          row.id,
          row.balance,
          row.plinkoPlayed,
          row.coinFlipPlayed,
          row.wheelOfFortunePlayed
        ])
      });
    }
    else{
      res.send("Bad data")
    }
    
  }
  else{
      res.send("Wrong password");
      console.log("INVALID WRITE ATTEMPT WITH PASSWORD:" + password);
    }
  }
)

app.get("/api/db", (req, res) => {
  const pass = req.query.password;
  if(pass == process.env.PASSWORD){
    res.send(JSON.stringify(playerData));
  }
  else{
    res.send("Wrong password");
    console.log("INVALID READ ATTEMPT WITH PASSWORD" + pass);
  }
});

app.get("/wheeloffortune/roll", (req, res) => {
  let id = req.query.id;
  let amount = req.query.amount;
  let rot = req.query.rot % 360;

  let player = playerData.find((p) => p.id == id);

  if (!player) {
    res.end(JSON.stringify("You are a nobody"));
    return;
  }

  player.wheelOfFortunePlayed++;

  if (amount > player.balance || player.balance < 0) {
    res.end(JSON.stringify({ seed: -1 }));
    return;
  }

  const seed = generateWheelSeed();
  let vel = 0;
  while (vel <= seed) {
    vel += 0.5;
    rot += vel;
  }

  while (vel >= 0) {
    vel -= vel / 50 + 0.1;
    rot += vel;
  }

  rot = rot % 360;
  //console.log(rot);
  rot /= 45;

  const option = Math.ceil(rot);

  let multiplier = 0;

  switch (option % 7) {
    case 0:
      multiplier = 2;
      break;
    case 1:
      multiplier = 0.7;
      break;
    case 2:
      multiplier = 1;
      break;
    case 3:
      multiplier = 0.7;
      break;
    case 4:
      multiplier = 2;
      break;
    case 5:
      multiplier = 0.7;
      break;
    case 6:
      multiplier = 1;
      break;
    case 7:
      multiplier = 0.7;
      break;
    case 8:
      multiplier = 2;
      break;
    default:
      multiplier = 1;
      console.warn("Unsupported rotation option: " + rot);
      break;
  }

  player.balance -= amount;
  amount *= multiplier;

  player.balance += amount;

  player.balance = Math.floor(player.balance * 100) / 100;

  console.log(multiplier);

  DB.query("UPDATE playerData SET balance = $1, wheelOfFortunePlayed = $2 WHERE id = $3;", [player.balance, player.wheelOfFortunePlayed, player.id]);

  res.send(JSON.stringify({ seed: seed }));
});

let bridgeGames = [
  {
    id: 0,
    amount: 10,
    level: 0,
  },
];

app.get("/bridge/start", (req, res) => {
  const id = req.query.id;
  const amount = req.query.amount;

  let player = playerData.find((p) => p.id == id);

  if (!player) {
    res.sendStatus(404);
    return;
  }
  if (amount > player.balance || amount < 0) {
    res.sendStatus(400);
    return;
  }

  bridgeGames.push({
    id,
    amount,
    level: 0,
  });

  console.log(bridgeGames)
});

app.get("/bridge/cross", (req, res) => {
  const id = req.query.id;

  let bridge = bridgeGames.find((p) => p.id == id);

  if (!bridge) {
    res.sendStatus(404);
    return;
  }

  if (Math.random() < (99 - bridge.level * 9) / 100) {
    bridge.level++;
    console.log(bridge);
    res.send(JSON.stringify({ seed: true }));
  } else {
    res.send(JSON.stringify({ seed: false }));
  }
});

app.get("/bridge/end", (req, res) => {
  const id = req.query.id;

  let bridge = bridgeGames.find((p) => p.id == id);

  if (!bridge) {
    res.sendStatus(404);
    return;
  }

  let award = Math.floor(((bridge.level + 1) / 2) * 10) / 10;

  playerData.forEach((player) => {
    if (player.id == id) {
      player.balance += bridge.amount * award;
    }
  });
});

function generateWheelSeed() {
  return Math.floor(Math.random() * 10 + 15);
}


app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
