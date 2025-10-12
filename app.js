const express = require('express')
const cors = require('cors')
const path = require('path')
const sequlize = require('./utils/db-connection')
const Expense = require('./models/expense')
const User = require('./models/user')
const expenseRoutes = require('./routes/expenseRoutes')
const userRoutes = require('./routes/userRoutes')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use('/expense', expenseRoutes)
app.use('/user', userRoutes)


sequlize.sync({ force: true }).then(() => {
    app.listen(3000, () => {
        console.log('Server is running')
    })
})

