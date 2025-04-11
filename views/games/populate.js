const leaderboard = document.getElementById("leaderboard");

fetch("/api/playerdata", function (req, res) {
  req.method = "GET";
  req.headers = {
    "Content-Type": "application/json",
  };
})
  .then((res) => {
    return res.json();
  })
  .then((res) => {
    res.sort((a, b) => Number(b.balance) - Number(a.balance));
    let exists = false;
    res.forEach((player, index) => {
      const row = document.createElement("tr");

      if (player.name == username) {
        exists = true;
        row.classList.add("self-row");
      }

      console.log(Number(player.balance));

      if (!player.wheelOfFortunePlayed) {
        player.wheelOfFortunePlayed = 0;
      }

      if (!player.balance) {
        player.balance = 0;
      }

      if (!player.plinkoPlayed) {
        player.plinkoPlayed = 0;
      }

      if(!player.coinFlipPlayed){
        player.coinFlipPlayed = 0;
      }

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${player.name}</td>
        <td>${player.plinkoPlayed.toLocaleString("en-US")}</td>
        <td>${player.coinFlipPlayed.toLocaleString("en-US")}</td>
        <td>${player.wheelOfFortunePlayed.toLocaleString("en-US")}</td>
        <td>${"$" + player.balance.toLocaleString("en-US")}</td>
        `;
      leaderboard.appendChild(row);
    });
    if (!exists) {
      reset();
    }
  });
