const sharp = require('sharp');

module.exports = (req, res, next) => {
    if (!req.file) {
        // return res.status(400).json({ error: 'Aucun fichier fourni' });
        next()
        return
    }

    const outputPath = `images/${req.file.originalname.split('.')[0]}-${Date.now()}.webp`;

    console.log("outputPath:", outputPath)

    sharp(req.file.buffer)
        .toFormat('webp')
        .toFile(outputPath)
        .then(() => {
            req.file.filename = outputPath
            // res.status(201).json({ message: 'Image uploadée et convertie en WebP', path: outputPath });
            next()
        })
        .catch((err) => {
            console.error(`Erreur de conversion avec sharp : ${err}`);
            res.status(500).json({ error: 'Erreur lors de la conversion de l\'image' });
        });
};