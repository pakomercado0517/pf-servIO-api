const { Router } = require("express");
const router = Router();
const transactionsFunctions = require('../controllers/TransactionsControllers.js')

router.get('/all', transactionsFunctions.getAllTransactions)//Pendiente
router.post('/', transactionsFunctions.newTransaction)
router.put('/confirm', transactionsFunctions.confirmDone)

module.exports= router;