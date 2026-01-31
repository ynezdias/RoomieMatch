const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const authMiddleware = require('../middleware/authMiddleware'); // Verify path

// Config Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Determine resource type based on mimetype
        let resource_type = 'auto'; // default
        let folder = 'roomiematch_uploads';

        if (file.mimetype.startsWith('image/')) {
            resource_type = 'image';
            folder = 'roomiematch/images';
        } else if (file.mimetype.startsWith('video/')) {
            resource_type = 'video';
            folder = 'roomiematch/videos';
        } else if (file.mimetype.startsWith('audio/')) {
            resource_type = 'video'; // Cloudinary treats audio as video/raw usually, or use 'auto'
            folder = 'roomiematch/audio';
        }

        return {
            folder: folder,
            resource_type: resource_type,
            public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`, // Remove extension for public_id
        };
    },
});

const upload = multer({ storage: storage });

// Route: POST /api/upload
router.post('/', authMiddleware, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // req.file.path contains the Cloudinary URL
    res.json({
        url: req.file.path,
        filename: req.file.filename,
        mimetype: req.file.mimetype
    });
});

module.exports = router;
