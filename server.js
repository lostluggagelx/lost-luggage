import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzNk6XZkhZ8VpVwE_x-jO5DMDd_e4HnqtW9TyLEzj_Ayc1i2-5X_MGeChWctNhl8PBw/exec';

app.use(cors());
app.use(bodyParser.json());

// Serve static files like index.html
app.use(express.static(__dirname));

// Serve index.html when visiting "/"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle email submission
app.post('/submit', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false });

  const entry = `${new Date().toISOString()}, ${email}\n`;

  // ✅ Respond immediately
  res.json({ success: true });

  // 📁 Save email to CSV (non-blocking)
  fs.appendFile('emails.csv', entry, err => {
    if (err) console.error('❌ Failed to save email locally:', err);
  });

  // 📤 Send to Google Sheet (non-blocking)
  fetch(GOOGLE_SHEET_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  }).catch(err => {
    console.error('❌ Failed to send to Google Sheets:', err);
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
