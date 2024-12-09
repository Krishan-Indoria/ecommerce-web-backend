const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/dbConfig')

const app = express();

const PORT = process.env.PORT || 3002;

app.use(cookieParser())
app.use(cors({
    origin : process.env.FRONTEND_URL,
    credentials : true
}));
app.use(express.json())
connectDB();

// import routes
const userRoute = require('./routes/userRoute');

app.use('/api/users',userRoute)

app.get('/', (req,res) => {
    return  res.send("<h1>Hello E-commerse!</h1>");
})




app.listen(PORT, () => {
     console.log("Server is running on port... ", PORT);
})