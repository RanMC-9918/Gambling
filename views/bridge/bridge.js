function setup() {
  let canvas = createCanvas(500, 400);
  canvas.parent("plinko")
}

let offset = 300;

let idle = false;

function draw() {
  clear();
  translate(offset, 0);

  for (let i = 0; i < 11; i++) {
    if (
      mouseX - offset > i * 300 &&
      mouseX - offset < i * 300 + 200 &&
      mouseY > 50 &&
      mouseY < 250
    ) {
      if (mouseIsPressed && idle) {
        animateForwards(i);
        idle = false;
      }
      fill(0, 0, 255);
    } else {
      fill(0, 100, 255);
    }
    rect(i * 300, 50, 200, 200);

    fill(255);
    textSize(70);
    text(99 - i * 9 + "%", i * 300 + 30, 100 + -10, 200, 200);
    text(Math.floor((i / 2) * 10) / 10 + "x", i * 300 + 40, 170, 200, 200);
  }

  fill(200, 200, 0);

  ellipse(150 + -offset, 150, 100);
}

function render() {}

function animateForwards(i) {
  idle = false;
  let scroll = setInterval(() => {
    offset -= 150 / 33;
    if (offset < -i * 300 + 100) {
      idle = true;
      clearInterval(scroll);
      return;
    }
  }, 30);

  fetch(`/bridge/cross/?id=${userid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  })
 .then((response) => response.json())
 .then((data) => {
    console.log(data);
    idle = true;
    if(data.seed){
      console.log(data.seed)
    }
    else{
      alert("You lost at tile " + i);
      offset = 300;
    }
  });
}


function startSession(amount) {
  console.log("Starting session with " + amount + " credits");

  fetch(`/bridge/start/?amount=${amount}&id=${userid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      idle = true;
    });
}

function spin(){
  if(idle) {
    idle=false;
    fetch(`/bridge/end/?id=${userid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });
  }
  else {
    idle = true;
    startSession(amount.value);
  }
}