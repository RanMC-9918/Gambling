const leaderboard = document.getElementById('leaderboard');

fetch('/api/playerdata', function (req, res) {
    req.method = 'GET';
    req.headers = {
        'Content-Type': 'application/json',
    }
}).then(res => {
    return res.json();
}).then(res => {
    res.sort((a, b) => b.balance - a.balance);
    res.forEach((player, index) => {
        const row = document.createElement('tr');

        let exists = false;

        if(player.name == username){
            exists = true;
            row.classList.add("self-row");
        }

        if(!exists){
            reset();
        }

        row.innerHTML = `
        <td>${index+1}</td>
        <td>${player.name}</td>
        <td>${player.plinkoPlayed}</td>
        <td>${player.coinFlipPlayed}</td>
        <td>${player.wheelOfFortunePlayed}</td>
        <td>${player.balance}</td>
        `;
        leaderboard.appendChild(row);
    });
});