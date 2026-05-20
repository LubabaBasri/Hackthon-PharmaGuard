const http = require('http');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/mock/fda/report') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log('FDA mock received payload:', body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        reportId: `FAKE-FDA-${Date.now()}`, 
        status: 'received',
        message: 'Mock external authority notification successfully ingested.'
      }));
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Mock FDA Authority Server listening on port ${PORT}`);
});
