import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';

const app = express();

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'cst336',
  resave: false,
  saveUninitialized: false
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
    res.render('home.ejs', {username});

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
        req.session.userId = rows[0].userId;
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
});

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

app.get('/profile', async (req, res) => {
    let username = req.session.username;
    let userId = req.session.userId;
    let sqlGetLikes = `SELECT *
                       FROM foodToUserConnection
                       NATURAL JOIN food
                       WHERE userId = ? AND isLiked = 1 
                       ORDER BY foodId DESC`;
    let sqlGetDislikes = `SELECT *
                          FROM foodToUserConnection
                          NATURAL JOIN food
                          WHERE userId = ? AND isLiked = 0 
                          ORDER BY foodId DESC`;
    let sqlGetAllergies = `SELECT *
                           FROM foodToUserConnection
                           NATURAL JOIN food
                           WHERE userId = ? AND isAllergic = 1 
                           ORDER BY foodId DESC`;

    const [likes] = await pool.query(sqlGetLikes, [userId]);
    const [dislikes] = await pool.query(sqlGetDislikes, [userId]);
    const [allergies] = await pool.query(sqlGetAllergies, [userId]);

    console.log(likes);
    res.render('profile.ejs', {username, likes, dislikes, allergies});
});

app.post('/preference', async (req, res) => {
        let username = req.session.username;
        let userId = req.session.userId;
        let recipeId = req.body.recipeId;
        let isLiked = req.body.preference ? parseInt(req.body.preference) : null;
        let isAllergic = req.body.isAllergic ? 1 : 0;
        let summary = req.body.summary;

        console.log(`Preference received: user=${username} userId=${userId} recipeId=${recipeId} preference=${isLiked} isAllergic=${isAllergic}`);
        console.log(summary);

        // GET FOOD ID IF FOOD ALREADY EXISTS IN DB
        let sqlGetFood = `SELECT foodId FROM food WHERE apiId = ?`;
        let [foodRows] = await pool.query(sqlGetFood, [recipeId]);
        
        let foodId;
        // IF FOOD DOES NOT EXIST ADD TO DB
        if (foodRows.length === 0) {
            let sqlInsertFood = `INSERT INTO food (apiId, name, image, summary) VALUES (?, ?, ?, ?)`;
            let [insertResult] = await pool.query(sqlInsertFood, [
                recipeId, 
                req.body.title || 'Unknown',
                req.body.image || '',
                req.body.summary || ''
            ]);
            foodId = insertResult.insertId; // <-- GRABS AUTO INCREMENTED FIELD (foodId)
        }
        else {
            foodId = foodRows[0].foodId;
        }

        let sqlPrefCheck = `SELECT * FROM foodToUserConnection 
                        WHERE userId = ? AND foodId = ?`;
        const [prefRows] = await pool.query(sqlPrefCheck, [userId, foodId]);

        if (prefRows.length > 0) { // IF PREFERENCES ALREADY EXIST
            let sqlUpdate = `UPDATE foodToUserConnection
            SET isLiked = ?, isAllergic = ?
            WHERE userId = ? AND foodId = ?`;
            await pool.query(sqlUpdate, [isLiked, isAllergic, userId, foodId]);
        }
        else { // INSERT PREFERENCES AS NEW ENTRY
            let sqlInsert = `INSERT INTO foodToUserConnection
                             (userId, foodId, isLiked, isAllergic)
                             VALUES (?, ?, ?, ?)`;
            await pool.query(sqlInsert, [userId, foodId, isLiked, isAllergic]);
        }
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