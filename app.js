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
// app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')))
app.use(express.static(path.join(`${__dirname}/Uploads`)))

app.use('/api/payment/', paymentRouter)

console.log(path.join(__dirname, 'Uploads'))

app.get('/', (req, res) => {
    return res.send(`hii`)
})


const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})