// const express = require('express');
// const cors = require('cors');
// const path = require('path');

// const fs = require('fs')

// const sequelize = require('./utils/db-connection');
// const Expense = require('./models/expense');
// const User = require('./models/user');
// const expenseRoutes = require('./routes/expenseRoutes');
// const userRoutes = require('./routes/userRoutes');
// const premiumRoutes = require('./routes/premiumRoutes');
// const forgetPasswordRoutes = require('./routes/forgetPasswordRoutes')

// const morgan = require('morgan')

// const aiRoutes = require('./routes/aiRoutes');

// const app = express();
// const accessLogStream = fs.createWriteStream(
//     path.join(__dirname, 'access.log'),
//     { flags: 'a' }
// );
// app.use(morgan('combined', { stream: accessLogStream }))
// app.use(cors());
// app.use(express.json());
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// app.use('/ai', aiRoutes);
// app.use('/expense', expenseRoutes);
// app.use('/user', userRoutes);
// app.use('/premium', premiumRoutes);
// app.use('/password', forgetPasswordRoutes)




// // app.get('/test', (req, res) => res.send('✅ Server routes are working'));

// sequelize.authenticate().then(() => {
//     app.listen(process.env.PORT, () => {
//         console.log('🚀 Server running at http://localhost:3000');
//     });
// }).catch(err => console.error('Database sync error:', err));


const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const sequelize = require('./utils/db-connection');
const Expense = require('./models/expense');
const User = require('./models/user');
const Download = require('./models/Download')
const expenseRoutes = require('./routes/expenseRoutes');
const userRoutes = require('./routes/userRoutes');
const premiumRoutes = require('./routes/premiumRoutes');
const forgetPasswordRoutes = require('./routes/forgetPasswordRoutes');
const aiRoutes = require('./routes/aiRoutes');
const morgan = require('morgan');

const app = express();

// Logging
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

app.use(cors());
app.use(express.json());

// ✅ This serves your /public folder (home.html, login.html, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ All backend APIs
app.use('/ai', aiRoutes);
app.use('/expense', expenseRoutes);
app.use('/user', userRoutes);
app.use('/premium', premiumRoutes);
app.use('/password', forgetPasswordRoutes);

// Default root page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Test route
app.get('/test', (req, res) => res.send('✅ Server routes are working'));

// Start server
const PORT = process.env.PORT || 3000;
sequelize.authenticate({ alter: true }).then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
}).catch(err => console.error('Database sync error:', err));
