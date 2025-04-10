const balance = document.getElementById("balance");

let localBalance = localStorage.getItem("balance");

let userid = localStorage.getItem("userid");

let username = localStorage.getItem("username");

let digits = /[0-9]+/g;

if (localBalance && userid && userid != "undefined" && userid != null) {
  balance.innerText = "$" + localBalance;
  getBalance();
} else {
  let name = prompt("Enter your name or id");
  if (!name) {
    alert("Name not given. Please refresh");
  } 
  else if (digits.test(name) && name.length <= 5){
    fetch("/api/info/?id=" + name, {
      method: "GET"
    }).then((res) => res.json()).then((data) => {
      if(!data){
        alert("Not a valid id. If you want to enter a name, dont use numbers")
        return;
      }
      userid = data.id;
      localStorage.setItem("userid", data.id);
      username = data.username;
      localStorage.setitem("username", data.username);
    });
  }
  else {
    fetch("/api/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        localStorage.setItem("balance", 1000);
        balance.innerText = "$" + 1000;
        localStorage.setItem("userid", data.id);
        username = data.username;
        localStorage.setItem("username", username);
        userid = data.id;
        alert("Your id is " + userid + " you will need that if you want to change devices.")
      });
  }
}

function getBalance() {
  let newBalance = -1;

  if (!userid) {
    console.error("UserId not found");
    localStorage.setItem("balance", "");
    return;
  }

  fetch("/api/balance/?id=" + userid, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      newBalance = data.balance;
      //console.log(newBalance);
      localBalance = newBalance;
      balance.innerText = "$" + newBalance.toLocaleString("en-US");
      localStorage.setItem("balance", newBalance);
    });
}

function reset() {
  localStorage.setItem("userid", "");
  balance.innerText = "$0";
  window.location.reload();
  getBalance();
}

async function balanceOnly() {
  let newBalance = -1;

  if (!userid) {
    console.error("UserId not found");
    localStorage.setItem("balance", "");
    return;
  }

  await fetch("/api/balance/?id=" + userid, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      newBalance = data.balance;
      localStorage.setItem("balance", newBalance);
    });

  return newBalance;
}
