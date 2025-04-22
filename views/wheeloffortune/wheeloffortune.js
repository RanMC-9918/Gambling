let rot = 0;

let wheel;

let spinButton;

let vel = 0;

const left = document.getElementById("left");

let height = left.offsetHeight - 100;

let width = (height / 400) * 500;

let amountInput = document.getElementById("amount");

let idle = true;

const values = ["^1.1", "x0", "x2", "x0", "x0.5", "x0", "x2", "x0"];

function setup() {
  let canvas = createCanvas(width, height);
  canvas.parent("plinko");
  wheel = loadImage("./wheel.png");
}

function draw() {
  if(idle){
  }
  clear();
  renderWheel(rot);
  rotate(-(rot * PI) / 180 + PI / 8);
  triangle(height / 2 - 30, 0, height / 2 + 10, -25, height / 2 + 10, +25);
}

function renderWheel(rot) {
  fill(200, 100, 20);
  color(0);
  textSize(30);
  translate(200, 200);
  rotate((rot * PI) / 180 - PI / 8);
  for (let i = 0; i < values.length; i++) {
    fill(200, 100, 20);
    rotate(PI / 8);
    beginShape();
    vertex(0, 0);
    vertex(200, 0);
    vertex(200 * Math.cos(PI / 4), 200 * Math.sin(PI / 4));
    vertex(0, 0);
    endShape();
    rotate(PI / 8);
    fill(0);
    text(values[i], 90, 10);
  }
}

async function spin() {
  if(!idle) return
  balance.innerText = "$" + (localBalance - amountInput.value).toLocaleString("en-US"); // balance.js
  requestSpin(amountInput.value)
}

function partOne(seed) {
  let speedUp = setInterval(() => {
    vel += 0.5;
    rot += vel;
    if (vel > seed) {
      partTwo();
      clearInterval(speedUp);
    }
  }, 30);
}

function partTwo() {
  let slowDown = setInterval(() => {
    vel -= vel / 50 + 0.1;
    rot += vel;
    if (vel < 0) {
      console.log("STOP");
      vel = 0;
      spinFinished(Math.ceil((rot % 360) / 45));
      console.log((rot % 360)/45)
      clearInterval(slowDown);
    }
  }, 30);
}

function spinFinished(option) {

  //console.log(multiplier);
  getBalance();
  idle = true;
}


function requestSpin(worth) {
  idle = false;
  fetch(`/wheeloffortune/roll/?id=${Number(userid)}&amount=${worth}&rot=${rot%360}` , {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  })
  .then((res) => res.json())
  .then((data) => {
    console.log(data);
    if(data.seed == -1)[
      alert('Not enough balance')
    ]
    partOne(data.seed);
  });
}