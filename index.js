const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.json({ message: 'Academy Admin API is running' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});