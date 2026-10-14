const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'build')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`=======================================================`);
  console.log(`Healthcare App Frontend RUNNING on http://localhost:${port}`);
  console.log(`Connected to Backend: http://localhost:5000`);
  console.log(`=======================================================`);
});
