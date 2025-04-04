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

        if(player.name == username){
            row.classList.add("self-row");
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