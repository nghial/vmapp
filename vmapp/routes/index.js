var uuid = require('node-uuid');

var mongo = require('mongodb');
var monk = require('monk');
var assert = require('assert');
var dbserver = 'localhost:27017'
var db_leaderboard = monk(dbserver + '/leaderboard');
var db_gamesresult = monk(dbserver + '/gamesresult');
var db_games = monk(dbserver + '/games');
var db_gamesskeleton = monk(dbserver + '/gamesskeleton');
var db_userprofiles = monk(dbserver + '/userprofile');
var db_finalstageresult = monk(dbserver + '/finalstageresult'); 
var db = new mongo.Db('leaderboard', new mongo.Server('localhost', '27017', {fsync:true}));


module.exports = function(app, passport) {

    /* GET home page. */
    app.get('/', function(req, res) {
      res.render('index', { title: 'Altinn FIFA World Cup tournament' });
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/finalstage', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/finalstage', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
   app.get('/profile', isLoggedIn, function(req, res) {
        var userprofiles = db_userprofiles.get('usercollection');
        userprofiles.find({username: req.user.local.email},function(err,docs){
            var currentUserprofile = docs[0];
            if(docs.length==0){
                userprofiles.insert({username: req.user.local.email, name: "", company: ""}, function (err, doc) {
                    if (err) {
                        // If it failed, return error
                        res.send("There was a problem adding the information to the database.");
                    }
                    userprofiles.find({username: req.user.local.email},function(err,docs2){
                        currentUserprofile = docs2[0];
                        res.render('userprofile', {
                            "userprofile" : currentUserprofile, // get the user out of session and pass to template
                            "user" : req.user.local.email
                        });
                    });
                });
            }
            else {
                res.render('userprofile', {
                    "userprofile" : currentUserprofile, // get the user out of session and pass to template
                    "user" : req.user.local.email
                });
            }
            
        });
    });

    app.post('/profile',  function(req, res){      
        var userprofiles = db_userprofiles.get('usercollection');
        userprofiles.update({username : req.user.local.email},{username : req.user.local.email, name : req.body.full_name, company : req.body.company},{upsert: true}
        , function (err, doc) {
             res.redirect('/profile')
        });    
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/leaderboard', function(req, res) {

        //var collection = db_leaderboard.get('usercollection').;
            var filter = {};

            if(req.query.company != undefined && req.query.company != 'all'){               
                filter = {'company': req.query.company};               
            }        

            var mapGroup = function() {
                                var key = this.name;
                                var values = {groupPoints: this.points, id : this._id, name: this.name, company: this.company, uuid: this.uuid};
                                emit(key, values);
                           };

           var mapFinal = function() {
                                var key = this.name;
                                var values = {finalPoints: this.points, finalUuid: this.uuid};
                                emit(key, values);
                            };

            var reduceLeaderboard = function(key, values) {
                                        var result = {};
                                        values.forEach(function(value) {
                                            for (field in value) {
                                                var tmp = field;

                                                result[tmp] = value[tmp];

                                                if (tmp == 'groupPoints' || tmp == 'finalPoints'){
                                                    if (result.hasOwnProperty('totalPoints')){
                                                        result['totalPoints'] += value[tmp];
                                                    }else{
                                                        result['totalPoints'] = value[tmp];  
                                                    }
                                                    
                                                }
                                            }
                                        });

                                        return result;
                                    };

        db.open(function(error, dbClient) {
            if (error){
                throw error;
            }   
        
            dbClient.collection('usercollection', function(err, collection) {

                collection.mapReduce(
                    mapGroup,
                    reduceLeaderboard,
                    { 'out': {'replace':"temp_lb_map_reduce"} },
                    function(err, innerCollection){
                        dbClient.collection('finalstage', function(err, collection) {

                            collection.mapReduce(
                                mapFinal,
                                reduceLeaderboard,
                                { out: {reduce:"temp_lb_map_reduce"} },
                                function(err, reducedCollection){

                                    db_leaderboard.get('temp_lb_map_reduce').find(
                                        {$query: filter, $orderby: {  'value.totalPoints' : -1, 'value.groupPoints' : -1 }},
                                        {},
                                        function(e,docs){
                                            console.log(docs);
                                            res.render('leaderboard', {
                                                "leaderboard" : docs,                    
                                                "_place":0,
                                                "_oldpoints":undefined
                                            });
                                        }).toArray; 

                                    db.close();
                                });

                        }); 
                    });
            });
        });

        
    });

    /* GET Userlist page. */
    app.get('/games', isLoggedIn, function(req, res) {
        var collection = db_gamesresult.get('usercollection');
        var collection2 = db_games.get('usercollection');
        collection.count({'username' : req.user.local.email},function(e,count){
            //if (count == 0) {
            //    collection2.find({},{},function(e,docs){
            //        res.render('games', {
            //            "games" : docs,
            //            user : req.user
            //        });
            //    });
            //}
            //else {
                // If it worked, set the header so the address bar doesn't still say /adduser
                res.location("gamesresult");
                // And forward to success page
                res.redirect("gamesresult");
            //}
        });
    });


    app.get('/gamesoverview', function(req, res) {
        var collection = db_games.get('usercollection');
        collection.find({},{},function(e,docs){
            res.render('gamesoverview', {
                "games" : docs
            });
        });
    });

    app.get('/finalstage', isLoggedIn, function(req, res) {
        var collection = db_finalstageresult.get('usercollection');
        collection.count({'username' : req.user.local.email},function(e,count){
            if (count == 0) {
                res.render('finalstage');
            }
            else {
                res.location("finalstageresult");
                res.redirect("finalstageresult");
            }
        });
    });

    app.post('/finalstageresult', isLoggedIn, function(req, res) {
        var finalstage = [];
        var tempStr = "";
        var lastTeam = "";
        var p = "";
        var ot = "";
        var ft = "";

        for (var param in req.body) {
            var str = param.split("_");

            console.log(str[0], str[1], str[0].indexOf(lastTeam), lastTeam, str[0] != lastTeam);

            if (lastTeam == "" || str[0].indexOf(lastTeam) == -1) {
                if (lastTeam.length > 0 && str[0] != lastTeam) {
                    tempStr += ft;

                    if (ot.length > 0) {
                        tempStr += ":" + ot;
                    }
                    if (p.length > 0) {
                        tempStr += ":" + p;
                    }

                    finalstage.push(tempStr.split(":"));
                    p = "";
                    ot = "";
                    ft = "";
                }

                tempStr = str[0] + ":";
                tempStr += getCountryName(str[0]) + ":";
                lastTeam = str[0];
            }

            if (str[1].indexOf("P") > -1) {
                p = req.body[param];
            }

            if (str[1].indexOf("OT") > -1) {
                ot = req.body[param];
            }

            if (str[1].indexOf("FT") > -1) {
                ft =  req.body[param];
            }
        }

        tempStr += ft;
        if (ot.length > 0) {
            tempStr += ":" + ot;
        }
        if (p.length > 0) {
            tempStr += ":" + p;
        }

        finalstage.push(tempStr.split(":"));

        var collection = db_finalstageresult.get('usercollection');
        var uuid1 = uuid.v4();
        var d = new Date();
        var date = d.toISOString(); 

        // Submit to the DB
        collection.insert({
            "username" : req.user.local.email,
            "uuid" : uuid1,
            "created" : date,
            "fs0" : finalstage[0],
            "fs1" : finalstage[1],
            "fs2" : finalstage[2],
            "fs3" : finalstage[3],
            "fs4" : finalstage[4],
            "fs5" : finalstage[5],
            "fs6" : finalstage[6],
            "fs7" : finalstage[7],
            "fs8" : finalstage[8],
            "fs9" : finalstage[9],
            "fs10" : finalstage[10],
            "fs11" : finalstage[11],
            "fs12" : finalstage[12],
            "fs13" : finalstage[13],
            "fs14" : finalstage[14],
            "fs15" : finalstage[15],
            "fs16" : finalstage[16],
            "fs17" : finalstage[17],
            "fs18" : finalstage[18],
            "fs19" : finalstage[19],
            "fs20" : finalstage[20],
            "fs21" : finalstage[21],
            "fs22" : finalstage[22],
            "fs23" : finalstage[23],
            "fs24" : finalstage[24],
            "fs25" : finalstage[25],
            "fs26" : finalstage[26],
            "fs27" : finalstage[27],
            "fs28" : finalstage[28],
            "fs29" : finalstage[29],
            "fs30" : finalstage[30],
            "fs31" : finalstage[31]
        }, function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
            }
            else {
                // If it worked, set the header so the address bar doesn't still say /adduser
                res.location("finalstageresult");
                // And forward to success page
                res.redirect("finalstageresult");
            }
        });

    });

    app.get('/finalstageresult', isLoggedIn, function(req, res) {
        var id = req.query.id;

        var col_finalstageresult = db_finalstageresult.get('usercollection');
        var col_games = db_games.get('usercollection');
        if (id != null) {
            col_finalstageresult.find({'uuid' : id}, {}, function(e,docs){
                if (typeof docs == 'undefined') {
                    res.location("finalstage");
                    res.redirect("finalstage");
                }
                else {
                    col_games.find({},{},function(e,games){
                        res.render('finalstageresult', {
                            "result" : docs,
                            "games" : games
                        });
                    });
                }
            });
        }
        else {
            col_finalstageresult.find({'username' : req.user.local.email}, {}, function(e,docs){
                if (typeof docs == 'undefined') {
                    res.location("finalstage");
                    res.redirect("finalstage");
                }
                else {
                    col_games.find({},{},function(e,games){
                        res.render('finalstageresult', {
                            "result" : docs,
                            "games" : games
                        });
                    });
                }
            });
        }
    });

    /* GET Userlist page. */
    app.get('/gamesresult', isLoggedIn, function(req, res) {
        var id = req.query.id;
        var collection = db_gamesresult.get('usercollection');
        var games = db_games.get('usercollection');
        if (id != null) {
            collection.find({'uuid' : id},{},function(e,docs){
                games.find({}, {}, function(e, games){
                    res.render('gamesresult', {
                        "gamesresult" : docs,
                        "games" : games
                    });
                });
            });
        }
        else {
            collection.find({'username' : req.user.local.email},{},function(e,docs){
                games.find({}, {}, function(e, games){
                    res.render('gamesresult', {
                        "gamesresult" : docs,
                        "games" : games
                    });
                });
            });
        }
    });
    /* GET Userlist page. */
    app.post('/gamesresult', function(req, res) {
        var username = req.body.username;

        var game1BRA = parseInt(req.body.game1BRA, 10);
        var game1CRO = parseInt(req.body.game1CRO, 10);
        var game2MEX = parseInt(req.body.game2MEX, 10);
        var game2CMR = parseInt(req.body.game2CMR, 10);
        var game3ESP = parseInt(req.body.game3ESP, 10);
        var game3NED = parseInt(req.body.game3NED, 10);
        var game4CHI = parseInt(req.body.game4CHI, 10);
        var game4AUS = parseInt(req.body.game4AUS, 10);
        var game5COL = parseInt(req.body.game5COL, 10);
        var game5GRE = parseInt(req.body.game5GRE, 10);
        var game6CIV = parseInt(req.body.game6CIV, 10);
        var game6JPN = parseInt(req.body.game6JPN, 10);
        var game7URU = parseInt(req.body.game7URU, 10);
        var game7CRC = parseInt(req.body.game7CRC, 10);
        var game8ENG = parseInt(req.body.game8ENG, 10);
        var game8ITA = parseInt(req.body.game8ITA, 10);
        var game9SUI = parseInt(req.body.game9SUI, 10);
        var game9ECU = parseInt(req.body.game9ECU, 10);
        var game10FRA = parseInt(req.body.game10FRA, 10);
        var game10HON = parseInt(req.body.game10HON, 10);
        var game11ARG = parseInt(req.body.game11ARG, 10);
        var game11BIH = parseInt(req.body.game11BIH, 10);
        var game12IRN = parseInt(req.body.game12IRN, 10);
        var game12NGA = parseInt(req.body.game12NGA, 10);
        var game13GER = parseInt(req.body.game13GER, 10);
        var game13POR = parseInt(req.body.game13POR, 10);
        var game14GHA = parseInt(req.body.game14GHA, 10);
        var game14USA = parseInt(req.body.game14USA, 10);
        var game15BEL = parseInt(req.body.game15BEL, 10);
        var game15ALG = parseInt(req.body.game15ALG, 10);
        var game16RUS = parseInt(req.body.game16RUS, 10);
        var game16KOR = parseInt(req.body.game16KOR, 10);
        var game17BRA = parseInt(req.body.game17BRA, 10);
        var game17MEX = parseInt(req.body.game17MEX, 10);
        var game18CMR = parseInt(req.body.game18CMR, 10);
        var game18CRO = parseInt(req.body.game18CRO, 10);
        var game19ESP = parseInt(req.body.game19ESP, 10);
        var game19CHI = parseInt(req.body.game19CHI, 10);
        var game20AUS = parseInt(req.body.game20AUS, 10);
        var game20NED = parseInt(req.body.game20NED, 10);
        var game21COL = parseInt(req.body.game21COL, 10);
        var game21CIV = parseInt(req.body.game21CIV, 10);
        var game22JPN = parseInt(req.body.game22JPN, 10);
        var game22GRE = parseInt(req.body.game22GRE, 10);
        var game23URU = parseInt(req.body.game23URU, 10);
        var game23ENG = parseInt(req.body.game23ENG, 10);
        var game24ITA = parseInt(req.body.game24ITA, 10);
        var game24CRC = parseInt(req.body.game24CRC, 10);
        var game25SUI = parseInt(req.body.game25SUI, 10);
        var game25FRA = parseInt(req.body.game25FRA, 10);
        var game26HON = parseInt(req.body.game26HON, 10);
        var game26ECU = parseInt(req.body.game26ECU, 10);
        var game27ARG = parseInt(req.body.game27ARG, 10);
        var game27IRN = parseInt(req.body.game27IRN, 10);
        var game28NGA = parseInt(req.body.game28NGA, 10);
        var game28BIH = parseInt(req.body.game28BIH, 10);
        var game29GER = parseInt(req.body.game29GER, 10);
        var game29GHA = parseInt(req.body.game29GHA, 10);
        var game30USA = parseInt(req.body.game30USA, 10);
        var game30POR = parseInt(req.body.game30POR, 10);
        var game31BEL = parseInt(req.body.game31BEL, 10);
        var game31RUS = parseInt(req.body.game31RUS, 10);
        var game32KOR = parseInt(req.body.game32KOR, 10);
        var game32ALG = parseInt(req.body.game32ALG, 10);
        var game33CMR = parseInt(req.body.game33CMR, 10);
        var game33BRA = parseInt(req.body.game33BRA, 10);
        var game34CRO = parseInt(req.body.game34CRO, 10);
        var game34MEX = parseInt(req.body.game34MEX, 10);
        var game35AUS = parseInt(req.body.game35AUS, 10);
        var game35ESP = parseInt(req.body.game35ESP, 10);
        var game36NED = parseInt(req.body.game36NED, 10);
        var game36CHI = parseInt(req.body.game36CHI, 10);
        var game37JPN = parseInt(req.body.game37JPN, 10);
        var game37COL = parseInt(req.body.game37COL, 10);
        var game38CIV = parseInt(req.body.game38CIV, 10);
        var game38GRE = parseInt(req.body.game38GRE, 10);
        var game39ITA = parseInt(req.body.game39ITA, 10);
        var game39URU = parseInt(req.body.game39URU, 10);
        var game40CRC = parseInt(req.body.game40CRC, 10);
        var game40ENG = parseInt(req.body.game40ENG, 10);
        var game41HON = parseInt(req.body.game41HON, 10);
        var game41SUI = parseInt(req.body.game41SUI, 10);
        var game42ECU = parseInt(req.body.game42ECU, 10);
        var game42FRA = parseInt(req.body.game42FRA, 10);
        var game43NGA = parseInt(req.body.game43NGA, 10);
        var game43ARG = parseInt(req.body.game43ARG, 10);
        var game44BIH = parseInt(req.body.game44BIH, 10);
        var game44IRN = parseInt(req.body.game44IRN, 10);
        var game45USA = parseInt(req.body.game45USA, 10);
        var game45GER = parseInt(req.body.game45GER, 10);
        var game46POR = parseInt(req.body.game46POR, 10);
        var game46GHA = parseInt(req.body.game46GHA, 10);
        var game47KOR = parseInt(req.body.game47KOR, 10);
        var game47BEL = parseInt(req.body.game47BEL, 10);
        var game48ALG = parseInt(req.body.game48ALG, 10);
        var game48RUS = parseInt(req.body.game48RUS, 10);

        var uuid1 = uuid.v4();
        var d = new Date();
        var date = d.toISOString(); 

        // Set our collection
        var collection = db_gamesresult.get('usercollection');

        // Submit to the DB
        collection.insert({
	    "date" : date,
            "username" : username,
            "uuid" : uuid1,
            "game1BRA" : req.body.game1BRA,
            "game1CRO" : req.body.game1CRO,
            "game2MEX" : req.body.game2MEX,
            "game2CMR" : req.body.game2CMR,
            "game3ESP" : req.body.game3ESP,
            "game3NED" : req.body.game3NED,
            "game4CHI" : req.body.game4CHI,
            "game4AUS" : req.body.game4AUS,
            "game5COL" : req.body.game5COL,
            "game5GRE" : req.body.game5GRE,
            "game6CIV" : req.body.game6CIV,
            "game6JPN" : req.body.game6JPN,
            "game7URU" : req.body.game7URU,
            "game7CRC" : req.body.game7CRC,
            "game8ENG" : req.body.game8ENG,
            "game8ITA" : req.body.game8ITA,
            "game9SUI" : req.body.game9SUI,
            "game9ECU" : req.body.game9ECU,
            "game10FRA" : req.body.game10FRA,
            "game10HON" : req.body.game10HON,
            "game11ARG" : req.body.game11ARG,
            "game11BIH" : req.body.game11BIH,
            "game12IRN" : req.body.game12IRN,
            "game12NGA" : req.body.game12NGA,
            "game13GER" : req.body.game13GER,
            "game13POR" : req.body.game13POR,
            "game14GHA" : req.body.game14GHA,
            "game14USA" : req.body.game14USA,
            "game15BEL" : req.body.game15BEL,
            "game15ALG" : req.body.game15ALG,
            "game16RUS" : req.body.game16RUS,
            "game16KOR" : req.body.game16KOR,
            "game17BRA" : req.body.game17BRA,
            "game17MEX" : req.body.game17MEX,
            "game18CMR" : req.body.game18CMR,
            "game18CRO" : req.body.game18CRO,
            "game19ESP" : req.body.game19ESP,
            "game19CHI" : req.body.game19CHI,
            "game20AUS" : req.body.game20AUS,
            "game20NED" : req.body.game20NED,
            "game21COL" : req.body.game21COL,
            "game21CIV" : req.body.game21CIV,
            "game22JPN" : req.body.game22JPN,
            "game22GRE" : req.body.game22GRE,
            "game23URU" : req.body.game23URU,
            "game23ENG" : req.body.game23ENG,
            "game24ITA" : req.body.game24ITA,
            "game24CRC" : req.body.game24CRC,
            "game25SUI" : req.body.game25SUI,
            "game25FRA" : req.body.game25FRA,
            "game26HON" : req.body.game26HON,
            "game26ECU" : req.body.game26ECU,
            "game27ARG" : req.body.game27ARG,
            "game27IRN" : req.body.game27IRN,
            "game28NGA" : req.body.game28NGA,
            "game28BIH" : req.body.game28BIH,
            "game29GER" : req.body.game29GER,
            "game29GHA" : req.body.game29GHA,
            "game30USA" : req.body.game30USA,
            "game30POR" : req.body.game30POR,
            "game31BEL" : req.body.game31BEL,
            "game31RUS" : req.body.game31RUS,
            "game32KOR" : req.body.game32KOR,
            "game32ALG" : req.body.game32ALG,
            "game33CMR" : req.body.game33CMR,
            "game33BRA" : req.body.game33BRA,
            "game34CRO" : req.body.game34CRO,
            "game34MEX" : req.body.game34MEX,
            "game35AUS" : req.body.game35AUS,
            "game35ESP" : req.body.game35ESP,
            "game36NED" : req.body.game36NED,
            "game36CHI" : req.body.game36CHI,
            "game37JPN" : req.body.game37JPN,
            "game37COL" : req.body.game37COL,
            "game38CIV" : req.body.game38CIV,
            "game38GRE" : req.body.game38GRE,
            "game39ITA" : req.body.game39ITA,
            "game39URU" : req.body.game39URU,
            "game40CRC" : req.body.game40CRC,
            "game40ENG" : req.body.game40ENG,
            "game41HON" : req.body.game41HON,
            "game41SUI" : req.body.game41SUI,
            "game42ECU" : req.body.game42ECU,
            "game42FRA" : req.body.game42FRA,
            "game43NGA" : req.body.game43NGA,
            "game43ARG" : req.body.game43ARG,
            "game44BIH" : req.body.game44BIH,
            "game44IRN" : req.body.game44IRN,
            "game45USA" : req.body.game45USA,
            "game45GER" : req.body.game45GER,
            "game46POR" : req.body.game46POR,
            "game46GHA" : req.body.game46GHA,
            "game47KOR" : req.body.game47KOR,
            "game47BEL" : req.body.game47BEL,
            "game48ALG" : req.body.game48ALG,
            "game48RUS" : req.body.game48RUS
        }, function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
            }
            else {
                // If it worked, set the header so the address bar doesn't still say /adduser
                res.location("gamesresult");
                // And forward to success page
                res.redirect("gamesresult?id=" + uuid1);
            }
        });
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

function getCountryName(country) {
    if (country == "BRA")
        return "Brazil";
    if (country == "CHI")
        return "Chile";
    if (country == "COL")
        return "Colombia";
    if (country == "URU")
        return "Uruguay";
    if (country == "FRA")
        return "France";
    if (country == "NGA")
        return "Nigeria";
    if (country == "SUI")
        return "Switzerland";
    if (country == "NED")
        return "Netherlands";
    if (country == "MEX")
        return "Mexico";
    if (country == "CRC")
        return "Costa Rica";
    if (country == "GRE")
        return "Greece";
    if (country == "ARG")
        return "Argentina";
    if (country == "GER")
        return "Germany";
    if (country == "BEL")
        return "Belgia";
    if (country == "ALG")
        return "Algeria";
    if (country == "USA")
        return "USA";

    return "";
}
