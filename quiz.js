const http = require('http');

let leaderboard = [];

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/quiz') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const { username, score } = JSON.parse(body);

      leaderboard.push({ username, score });

      let reward = '';
      if (score >= 80) reward = 'Gold Token';
      else if (score >= 50) reward = 'Silver Token';
      else reward = 'Daha çok çalış!';

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ reward, leaderboard }));
    });
  } else if (req.method === 'GET' && req.url === '/leaderboard') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    leaderboard.sort((a, b) => b.score - a.score);
    res.end(JSON.stringify(leaderboard));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('Quiz sunucusu 3000 portunda çalışıyor...');
});
