function setup() {
  let canvas = createCanvas(400, 400);
  canvas.parent("plinko");
}

let balls = [];

function draw() {
  clear();
  noStroke();
  drawBoard();
  fill(200, 200, 0);
}

let sequence = [true, false, true, false, true, false, true, false, true];

let seeds = [];

function drawBoard() {
  fill(255);
  for (let j = 8; j > 0; j--) {
    for (let i = 0; i < j; i++) {
      ellipse(width / 2 + (i - j / 2) * 45 + 20, 0 + j * 40, 10);
    }
  }

  fill(255, 100, 0);
  for (var i = 0; i < balls.length; i++) {
    ellipse(balls[i].x, balls[i].y, 10);
  }

  translate(-5, 0);

  fill(100, 25, 0);
  rect(0, height - 50, 45, 60);
  fill(255);
  text("50x", 15, height - 20);

  fill(120, 20, 0);
  rect(45, height - 50, 45, 60);
  fill(255);
  text("^2", 15, height - 20);

  fill(140, 15, 0);
  rect(90, height - 50, 45, 60);
  fill(255);
  text("10x", 60, height - 20);

  fill(160, 10, 0);
  rect(135, height - 50, 45, 60);
  fill(255);
  text("2x", 105, height - 20);

  fill(180, 5, 0); //center
  rect(180, height - 50, 45, 60);
  fill(255);
  text("0.75x", 145, height - 20);

  fill(160, 10, 0);
  rect(225, height - 50, 45, 60);
  fill(255);
  text("0.5x", 192, height - 20);

  fill(140, 15, 0);
  rect(270, height - 50, 45, 60);
  fill(255);
  text("0.75x", 235, height - 20);

  fill(120, 20, 0);
  rect(315, height - 50, 45, 60);
  fill(255);
  text("2x", 285, height - 20);

  fill(100, 25, 0);
  rect(360, height - 50, 45, 60);
  fill(255);
  text("10x", 328, height - 20);
  fill(255);
  text("50x", 375, height - 20);
}

async function trackPath(ball, path) {
  ball.y = 30;
  ball.x = 400 / 2 - 5;
  for (let i = 0; i < path.length; i++) {
    let animation = 0;
    let xInit = ball.x;
    while (ball.y < i * 40 - 10 + 80) {
      animation += 0.05;
      ball.y += fall(animation) * 1.0;
      if (path[i]) {
        ball.x += 25 / 32;
      } else {
        ball.x -= 25 / 32;
      }
      await sleep(7);
    }
    if (path[i]) {
      ball.x = xInit + 25;
    } else {
      ball.x = xInit - 25;
    }
    ball.y = i * 40 - 10 + 80;

    await sleep(70);
  }
  while (ball.y < height + 30) {
    ball.y += 2;
    await sleep(10);
  }
}

function fall(x) {
  return 4 * Math.pow(x - 0.4, 2) - 0.6;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function spin() {
  // balls.push({
  //   x: 400 / 2,
  //   y: -10,
  // });

  // trackPath(balls[0], [true, false, false, true, true, true, false, true]);

  if(amount.value > localBalance || localBalance < 0) {
    return;
  }

  fetch(`/plinko/drop?id=${userid}&amount=${amount.value}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      if (data.seed == -1) {
      } else {
        balls.push({
          x: 400 / 2,
          y: -10,
        });
        seeds.push(data.seed);
        trackPath(balls[balls.length - 1], seeds[seeds.length - 1]);
        localBalance-=amount.value;
        localBalance=Math.floor(localBalance*100)/100
        balance.innerText="$" + Math.max(localBalance, 0).toLocaleString("en-US");
      }
       setTimeout(() => {
        localBalance = data.balance;
        localBalance = Math.floor(localBalance * 100) / 100;

        balance.innerText = "$" + Number(data.balance).toLocaleString("en-US");
      }, 2600)
    });
}