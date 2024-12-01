const bookModel = require('../models/books')

exports.getAllBooks = (req, res, next) => {
    bookModel.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({error}))
}

exports.getOneBook = (req, res, next) => {
    bookModel.findOne({ _id: req.params.id})
    .then(book => res.status(200).json(book))
    .catch(error => res.status(400).json({error}))
}

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new bookModel({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });
  
    book.save()
    .then(() => { res.status(201).json({message: 'book enregistré !'})})
    .catch(error => { res.status(400).json( { error })})
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
            return book.deleteOne()
                .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};