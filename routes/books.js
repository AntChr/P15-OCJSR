const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config')
const sharp = require('../middleware/sharp-config')

const bookCtrl = require('../controllers/books');

router.get('/', bookCtrl.getAllBooks);
router.post('/', auth, multer, sharp, bookCtrl.createBook);
router.get('/bestrating', bookCtrl.getTopRatedBooks);
router.get('/:id', bookCtrl.getOneBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.put('/:id', auth, multer, sharp, bookCtrl.updateBook);
router.post('/:id/rating', auth, bookCtrl.rateBook);



module.exports = router;