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
  //cookie: { secure: true }
}))

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool
const pool = mysql.createPool({
    host: "y0nkiij6humroewt.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
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

app.get('/home', async (req, res) => {
    let username = req.session.username;
    let url = "https://api.spoonacular.com/recipes/random?number=1&apiKey=d6dff3ba15ec4b89a868a2315bf77b37&includeNutrition=true";
    let response = await fetch(url);
    let data = await response.json();
    console.log(data);
    res.render('home.ejs', {username, data});

});

app.post('/login', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let hashedPassword;

    let sql = `SELECT *
                FROM Users
                WHERE username = ?`;
    const [rows] = await pool.query(sql, [username]);

    if (rows.length > 0) {
        hashedPassword = rows[0].password;
    }
    const match = await bcrypt.compare(password, hashedPassword);
    if (match) {
        req.session.username = username; //TODO: CHANGE TO match LATER
        res.redirect('/home');
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
    let hashedPassword = await bcrypt.hash(password, 10);

    let sql = ` INSERT INTO Users 
                (username, password)
                VALUES (?, ?)`;
    let sqlParams = [username, hashedPassword];
    const [rows] = await pool.query(sql, sqlParams);
    res.redirect('/');

});

app.post('/preference', async (req, res) => {
        let username = req.session.username;
        let recipeId = req.body.recipeId;
        let preference = req.body.preference;
        console.log(`Preference received: user=${username} recipeId=${recipeId} preference=${preference}`);
        // TODO: store preference in DB (not implemented)
        res.redirect('/home');
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