const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Tere maailm!');
});

app.listen(PORT, () => {
  console.log(`Server töötab: http://localhost:${PORT}`);
});
