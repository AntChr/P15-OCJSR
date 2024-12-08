const multer = require('multer');
const sharp = require('sharp');

const storage = multer.memoryStorage();

const upload = multer({ storage: storage }).single('image');

app.post('/upload', upload, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const outputPath = `images/${req.file.originalname.split('.')[0]}-${Date.now()}.webp`;

    sharp(req.file.buffer)
        .toFormat('webp')
        .toFile(outputPath)
        .then(() => {
            res.status(201).json({ message: 'Image uploadée et convertie en WebP', path: outputPath });
        })
        .catch((err) => {
            console.error(`Erreur de conversion avec sharp : ${err}`);
            res.status(500).json({ error: 'Erreur lors de la conversion de l\'image' });
        });
});