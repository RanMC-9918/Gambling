const balance = document.getElementById('balance');

let localBalance = localStorage.getItem('balance');

let userid = localStorage.getItem('userid');

setTimeout(() => {
    if (localBalance && userid && userid != 'undefined' && userid != null) {
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
}, 200);



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
        console.log(newBalance);
        balance.innerText = "$" + newBalance;
        localStorage.setItem("balance", newBalance);
    });
}