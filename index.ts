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
  coinFlipPlayed: number;
  wheelOfFortunePlayed: number;
}

let playerData: player[] = []; 

async function loadFromDB(){
  let res =  await DB.query("SELECT * FROM playerData ORDER BY balance LIMIT 50");
  console.log("Loading data...")
  res.rows.map(
    (row, index) => {
      console.log("Index " + index + ": " + JSON.stringify(row));
      playerData.push({
        name: row.username,
        balance: row.balance,
        id: row.id,
        plinkoPlayed: row.plinkoplayed,
        coinFlipPlayed: row.coinflipplayed,
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

  
  const id = Math.floor(Math.random()*99999999)
  
  DB.query("INSERT INTO playerData (username, id) VALUES ($1, $2);", [
    name, id
  ]);

  const player = {
    name,
    balance: 1000,
    id,
    plinkoPlayed: 0,
    coinFlipPlayed: 0,
    wheelOfFortunePlayed: 0,
  };

  playerData.push(player);


  res.send(JSON.stringify({ id: player.id, username: player.name }));
});

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
  res.send(JSON.stringify(playerData));
});

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
      multiplier = 20;
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
    [player.balance, player.plinkoPlayed, player.id]
  );


  //console.log(ans);
  //console.log(multiplier);

  res.send(
    JSON.stringify({
      seed: ans,
    })
  );
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

  switch (option) {
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

  DB.query("UPDATE playerData SET balance = $1, wheelOfFortunePlayed = $2 WHERE id = $3", [player.balance, player.wheelOfFortunePlayed, player.id]);

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
