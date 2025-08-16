const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/journey', (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'data', 'journeyData.json');
    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ message: 'journeyData.json not found. Please run the generation script first.' });
    }
    const journeyData = fs.readFileSync(dataPath, 'utf8');
    res.json(JSON.parse(journeyData));
  } catch (error) {
    res.status(500).json({ message: 'Error reading journey data', error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});