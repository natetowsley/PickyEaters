import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';

const app = express();

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'cst336',
  resave: false,
  saveUninitialized: true
//   cookie: { secure: true }
}))

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool
const pool = mysql.createPool({
    host: "http://y0nkiij6humroewt.cbetxkdyhwsb.us-east-1.rds.amazonaws.com/",
    user: "d9cvv58bxafrhnel",
    password: "bc5ohos9yy2khwd1",
    database: "xw40tkj73t4u1dwk",
    connectionLimit: 10,
    waitForConnections: true
});

//routes
app.get('/', (req, res) => {
   res.render('login.ejs');
});

app.post('/login', async (req, res) => {
    // test username: test
    // test password: test
    let username = req.body.username;
    let password = req.body.password;
    let hashedPassword = "test";

    let sql = `SELECT *
                FROM Users
                WHERE username = ?`;
    const [rows] = await pool.query(sql, [username]);

    if (rows.length > 0) {
        hashedPassword = rows[0].password;
    }
    const match = await bcrypt.compare(password, hashedPassword);
    if (match) { //TODO: CHANGE TO match LATER
        res.render('home.ejs', {username});
    }

    else {
        res.render('login.ejs', {"loginError": "Invalid Login"});
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});
app.get('/signUp', (req, res) =>{
    res.render('signup.ejs');
})
app.post('/signup', async (req, res) => {
    // test username: test
    // test password: test
    let username = req.body.username;
    let password = req.body.password;
    let hashedPassword = "test";

    let sql = ` INSERT INTO Users (username, password)
                VALUES (?, ?)`;
    let sqlParams = [username, password];
    const [rows] = await pool.query(sql, []);
    res.render('home.ejs', {username});

});

//dbTest
app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

app.listen(3000, ()=>{
    console.log("Express server running")
})