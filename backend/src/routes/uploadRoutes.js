const express = require('express');
const crypto = require('node:crypto');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const auth = require('../middleware/authMiddleware');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024, files: 1 } });

router.post('/sign', auth, (req, res) => {
  if (!['image', 'video', 'audio', 'file'].includes(req.body.type)) return res.status(400).json({ msg: 'Unsupported media type' });
  const config = cloudinary.config();
  if (!config.api_key || !config.api_secret || !config.cloud_name) return res.status(503).json({ msg: 'Uploads are not configured.' });
  const filename = String(req.body.filename || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
  const params = { timestamp: Math.floor(Date.now() / 1000), folder: `roomiematch/${req.body.type}s`, public_id: `${crypto.randomUUID()}-${filename}` };
  res.json({ params, signature: cloudinary.utils.api_sign_request(params, config.api_secret), apiKey: config.api_key, cloudName: config.cloud_name });
});

router.post('/', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const mime = req.file.mimetype;
  const folder = mime.startsWith('image/') ? 'roomiematch/images'
    : mime.startsWith('video/') ? 'roomiematch/videos'
    : mime.startsWith('audio/') ? 'roomiematch/audio' : 'roomiematch/files';
  const filename = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder,
      resource_type: 'auto',
      public_id: crypto.randomUUID() + '-' + filename,
    }, (err, value) => err ? reject(err) : resolve(value));
    stream.end(req.file.buffer);
  });
  res.json({ url: result.secure_url, filename: result.public_id, mimetype: mime });
});
module.exports = router;
