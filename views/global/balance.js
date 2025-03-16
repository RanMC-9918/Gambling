const balance = document.getElementById('balance');

let localBalance = localStorage.getItem('balance');

let userid = localStorage.getItem('userid');

if (localBalance && userid && userid != 'undefined' && userid != null) {
    balance.innerText = '$' + localBalance;
    getBalance();
}
else{
    let name = prompt('Enter your name');
    if (!name) {
        alert('Name not given. Please refresh');
    }
    else{
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
            userid = data.id;
        });
    }
    
}



function getBalance() {
    let newBalance = -1;

    if(!userid){
        console.error('UserId not found');
        localStorage.setItem('balance', '')
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
        balance.innerText = "$" + newBalance;
        localStorage.setItem("balance", newBalance);
    });
}

function reset(){
    localStorage.setItem("userid", "");
    balance.innerText = "$0";
    window.location.reload();
}

async function balanceOnly(){
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