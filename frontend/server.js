const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes to serve HTML files from "views" folder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/order', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'order.html'));
});

app.get('/complaint', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'complaint.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Frontend server listening at http://localhost:${port}`);
});
