let table = document.getElementById("banTable");
let update = document.getElementById("UPDATEBANS");
let password = document.getElementById("password");
let playerData;

function loadBanHammer(){
    fetch("/api/playerdatafull/?password=" + password.value, {
        method: "GET",
    }).then((data) => data.json()).then((res) => {
        playerData = res;
        res.data.forEach((row) => {
            let rowElem = document.createElement("tr");
            rowElem.innerHTML += "<td>" + row.name + "</td>";
            rowElem.innerHTML += "<td>" + row.id + "</td>";
            rowElem.innerHTML += "<td>" + row.balance + "</td>";
            rowElem.innerHTML += "<td>" + row.plinkoPlayed + "</td>";
            rowElem.innerHTML += "<td>" + row.bridgeGamesPlayed + "</td>";
            rowElem.innerHTML += "<td>" + row.wheelOfFortunePlayed + "</td>";
            rowElem.innerHTML += `<td><button onclick="playerData.forEach((player) => {if(player.id == ${row.id}){player.id=0}})">Ban</button></td>`;
            table.appendChild(rowElem);
        });
    });
}