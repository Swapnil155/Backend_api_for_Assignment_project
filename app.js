const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()
require('./Database/DB')
const path = require('path')

const userRoutes = require('./api/users/users.router')
const paymentRouter = require('./api/payment/payment.router')

const app = express()

app.use(cors())

app.use(express.json());

app.use('/api/user/', userRoutes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/api/payment/', paymentRouter)

app.get('/', (req, res) => {
    return res.send(`hii`)
})


const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})