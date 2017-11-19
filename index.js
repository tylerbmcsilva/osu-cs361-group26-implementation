const bodyParser  = require('body-parser');
const config      = require('./config.js');
const db          = require('./database.js');
const express     = require('express');
const hbs         = require('express-handlebars');
const assert      = require('assert');
var Heap          = require('heap');
var pq            = require('./queueManager.js');
var patientNode   = require('./patientNode.js');

var queue = new pq();

// Initialize queue (delete later)
var p1 = new patientNode(1, 'Ryan', 'Shin', 5, 2);
var p2 = new patientNode(2, 'Sean', 'Hinds', 7, 5);
var p3 = new patientNode(3, 'Foo', 'Bar', 9, 2);
var p4 = new patientNode(4, 'Peter', 'Parker', 8, 1);
var p5 = new patientNode(5, 'Chris', 'Smith', 1, 1);
var p6 = new patientNode(6, 'Du', 'Zheng', 9, 1);

queue.pushPatient(p1);
queue.pushPatient(p2);
queue.pushPatient(p3);
queue.pushPatient(p4);
queue.pushPatient(p5);
queue.pushPatient(p6);

const PORT  = process.argv[2] || 3612;

// CREATES TABLE IF IT DOESN'T EXIST, AND SEEDS DATABASE
db.runMigrations('migrations').then(db.seedDb('a_patients', 'seeds'));

// Setup Server
const app = express();

// Set view engine to be handlebars
app.engine('.hbs', hbs({extname: '.hbs', defaultLayout: 'main'}) );
app.set('view engine', '.hbs');

// Setup Body Parser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Set Static Folder for CSS/JS
app.use(express.static('public'));

// Main Route
app.get('/', ( req, res ) => res.render('index') );

app.get('/check-in-new', ( req, res ) => res.render('checkin-new') );

app.get('/check-in-returning', ( req, res ) => res.render('checkin-returning') );

//Log-in and authentication
app.post('/log-in', ( req, res ) => {
    var context ={};
    //All entries must be filled
    if (req.body.fName != '' && req.body.ssn != '' && req.body.lName != ''){
        //Query the database for a match
        //If match is found.
        if () {
        //No match.
        } else{
        }
    } else {
    }
    res.render('index')
    });
      
app.get('/view-patient-info', ( req, res ) => res.render('view-patient-info') );

app.get('/edit-patient-info', ( req, res ) => res.render('edit-patient-info') );

app.get('/queue-manager/pop-patient', function(req, res) {
    console.log('patient popped')
    queue.popPatient();
    res.send(null);
});

app.get('/queue-manager', function(req, res) {
    var context = {};
    context.list = queue.getList();
    res.render('queue-manager', context);
});

app.get('/queue-manager/prioritize', function(req, res) {
    var pid = req.query.pid;
    var priority = req.query.priority;
    //search list for patient
    queue.prioritize(p1, priority);
    res.send(null);

});
//Log-in and authentication
app.post('/check-in-returning', (req, res) => {
    var context = {};
    console.log(req.body);
    //All entries must be filled
    if (req.body.first_name != '' && req.body.last_name != '' && req.body.ssn != '') {
        //Query the database for a match
        //If match is found.
        patientId = 0;
        db.existRow('a_patients', req.body).then( (row) => {
            patientId = ( typeof row[0] !== 'undefined' && 'id' in row[0] && row[0].id ) ? row[0].id : 0;
            console.log(patientId);
            if ( patientId ) {
                // Found matching patient
                console.log('Found patient in db');
                context.success = 1;
                context.message = "Login Successful";
                return res.redirect('/connecting-device');
            } else {
                //No match, go back to checkin-new page
                console.log('Does not find patient in db');
                context.failure = 1;
                context.message = "Login Failed";
                return res.redirect('/check-in-new');
            }
        });
    } else {
        console.log('Need first_name, last_name and ssn to login.');
        context.failure = 1;
        context.message = "Need First Name, Last Name and SSN to Login";
        return res.render('checkin-returning', context);
    }
});

// Connecting device page
app.get('/connecting-device', ( req, res ) => res.render('connecting-device') );


app.get('/queue', ( req, res ) => res.render('queue') );

// Catchall to re-route back to beginning
app.get('*', (req,res) => res.redirect('/') );

// Not Found (should never be hit)
app.use( (req,res) => res.send(404, '404 - Not Found') );

// Server Error
app.use( (err, req, res, next) => {
    console.error(err.stack);
    res.send(500, '500 - Server Error');
});

// Start Server
app.listen(PORT, () => console.log(`Express started on http://localhost:${PORT} press Ctrl-C to terminate.`) );
