let rot = 0;

let wheel;

let spinButton;

let vel = 0;

const left = document.getElementById("left");

let height = left.offsetHeight - 100;

let width = (height / 400) * 500;

let amountInput = document.getElementById("amount");

let idle = true;

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
  rotate(-rot);
  fill(255);
  triangle(height / 2 - 30, 0, height / 2 + 10, -25, height / 2 + 10, +25);
}

function renderWheel(rot) {
  angleMode(DEGREES);
  translate(height / 2, height / 2);
  rotate(rot);
  image(wheel, -height / 2, -height / 2, height, height);
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
      console.log(rot % 360)
      clearInterval(slowDown);
    }
  }, 30);
}

function spinFinished(option) {
  let multiplier;
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
    default:
      multiplier = 0.7;
      break;
  }

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