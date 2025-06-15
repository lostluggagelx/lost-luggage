const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // Add this line for Google Sheets integration

const app = express();
const PORT = 3000;

const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyQEyKqglT2mwHApNYMkwF8zTORr8EHBLlIwCXAcFA-R3aQ4Lbj9iIZuX89UKifJQZY/exec'; // Your actual script URL

app.use(cors());
app.use(bodyParser.json());

app.post('/submit', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false });

  const entry = `${new Date().toISOString()}, ${email}\n`;

  try {
    // Save locally in CSV
    fs.appendFileSync('emails.csv', entry);

    // Send to Google Sheets
    await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
