const bookModel = require('../models/books');
const fs = require('fs');

exports.getAllBooks = (req, res, next) => {
    bookModel.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }))
}

exports.getOneBook = (req, res, next) => {
    bookModel.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(400).json({ error }))
}

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new bookModel({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/${req.file.filename}`,
    });

    book.save()
        .then(() => { res.status(201).json({ message: 'book enregistré !' }) })
        .catch(error => { res.status(400).json({ error }) })
};

exports.deleteBook = (req, res, next) => {
    bookModel.findOne({ _id: req.params.id })
        .then(book => {
            if (!book) {
                return res.status(404).json({ message: 'Livre introuvable' });
            }
            if (book.userId !== req.auth.userId) {
                return res.status(401).json({ message: 'Non autorisé' });
            }

            const imagePath = book.imageUrl.split('/images/')[1];

            fs.unlink(`images/${imagePath}`, (err) => {
                if (err) {
                    console.error(`Erreur lors de la suppression de l'image : ${err}`);
                    return res.status(500).json({ message: 'Erreur lors de la suppression de l\'image', error: err });
                }
                
                bookModel.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Livre supprimé avec succès !' }))
                    .catch(error => res.status(500).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getTopRatedBooks = (req, res, next) => {
    bookModel.find()
        .sort({ averageRating: -1 })
        .limit(3)
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

exports.updateBook = (req, res, next) => {
    let bookObject;
    if (req.file) {
        bookObject = {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get('host')}/${req.file.filename}`
        };
    } else {
        bookObject = { ...req.body };
    }
    delete bookObject._id;
    delete bookObject.userId;

    bookModel.findOne({ _id: req.params.id })
        .then((book) => {
            if (!book) {
                return res.status(404).json({ message: 'Livre introuvable' });
            }
            if (book.userId !== req.auth.userId) {
                return res.status(401).json({ message: 'Non autorisé' });
            }
            const oldImagePath = book.imageUrl.split('/images/')[1];
            if (req.file && oldImagePath) {
                fs.unlink(`images/${oldImagePath}`, (err) => {
                    if (err) console.error(`Erreur lors de la suppression de l'ancienne image : ${err}`);
                });
            }
            bookModel.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Livre mis à jour avec succès !' }))
                .catch((error) => res.status(400).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
};

exports.rateBook = (req, res, next) => {
    const userId = req.auth.userId;
    const grade = req.body.grade;

    if (grade < 0 || grade > 5) {
        return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5.' });
    }

    bookModel.findOne({ _id: req.params.id })
        .then(book => {
            if (!book) {
                return res.status(404).json({ message: 'Livre introuvable.' });
            }
            const alreadyRated = book.ratings.some(rating => rating.userId === userId);
            if (alreadyRated) {
                return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
            }
            book.ratings.push({ userId, grade });

            const totalGrades = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
            const averageRating = totalGrades / book.ratings.length;

            book.averageRating = averageRating;

            book.save()
                .then(updatedBook => res.status(200).json(updatedBook))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};