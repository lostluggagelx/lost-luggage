const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); // ✅ Fix

const app = express();
const PORT = process.env.PORT || 3000;

const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzNk6XZkhZ8VpVwE_x-jO5DMDd_e4HnqtW9TyLEzj_Ayc1i2-5X_MGeChWctNhl8PBw/exec';

app.use(cors());
app.use(bodyParser.json());

app.post('/submit', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false });

  const entry = `${new Date().toISOString()}, ${email}\n`;

  try {
    // Save locally
    fs.appendFileSync('emails.csv', entry);

    // Send to Google Sheet
    await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ success: false });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
