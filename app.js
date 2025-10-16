const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./utils/db-connection');
const Expense = require('./models/expense');
const User = require('./models/user');
const expenseRoutes = require('./routes/expenseRoutes');
const userRoutes = require('./routes/userRoutes');
const premiumRoutes = require('./routes/premiumRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/expense', expenseRoutes);
app.use('/user', userRoutes);
app.use('/premium', premiumRoutes);

sequelize.sync().then(() => {
    app.listen(3000, () => {
        console.log('🚀 Server running at http://localhost:3000');
    });
}).catch(err => console.error('Database sync error:', err));
