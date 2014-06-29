var mongo = require('mongodb');
var monk = require('monk');
var finalstageresult_db = monk('localhost:27017/finalstageresult');
var games_db = monk('localhost:27017/games');
var leaderboard_db = monk('localhost:27017/leaderboard');
var finalstageresult_col = finalstageresult_db.get('usercollection');
var games_col = games_db.get('usercollection');
var collection3 = leaderboard_db.get('usercollection');
var scorelist = [];

finalstageresult_col.find({},{},function(e,finaldocs){
    games_col.find({},{},function(e,gamesdocs){
        finaldocs.forEach(function(document) {
            console.log("username: " + document.username);
            //console.log("fs0: " + document.fs0);
            //console.log("fs0[2]: " + document.fs0[2]);
            //console.log("length: " + document.fs0.length);
            var count = 1;
            var score = 0;

            console.log("Processing results");
            
            for (elem in gamesdocs) {
                if (gamesdocs[elem].match_id > 48 && gamesdocs[elem].score1 != null) {
                    var gamesScore = gamesdocs[elem];
                    console.log(gamesScore.team1_code + "-" + gamesScore.team2_code);
                    var userScore = getResultFromUser(count++, document);

                    //console.log(count);
                    console.log("From user: ");
                    console.log(userScore[0] + "-" + userScore[1]);

                    var gamesWinner = "";
                    var userWinner = "";

                    //Calculate result
                    //Riktig FT
                    if (gamesScore.score1 > gamesScore.score2) {
                        gamesWinner = gamesScore.team1_code;

                        if (userScore[0][2] > userScore[1][2]) {
                            score++;
                            userWinner = userScore[0][0];
                        }
                    }
                    if (gamesScore.score1 < gamesScore.score2) {
                        gamesWinner = gamesScore.team2_code;

                        if (userScore[0][2] < userScore[1][2]) {
                            score++;
                            userWinner = userScore[1][0];
                        }
                    }
                    if (gamesScore.score1 == gamesScore.score2 &&
                        userScore[0][2] == userScore[1][2]) {
                        score++;
                    }
                    //Riktig OT
                    if (gamesScore.score1ot != null) {
                        if (gamesScore.score1ot > gamesScore.score2ot) {
                            gamesWinner = gamesScore.team1_code;

                            if (userScore[0][3] > userScore[1][3]) {
                                score++;
                                userWinner = userScore[0][0];
                            }
                        }
                        if (gamesScore.score1ot < gamesScore.score2ot) {
                            gamesWinner = gamesScore.team2_code;

                            if (userScore[0][3] < userScore[1][3]) {
                                score++;
                                userWinner = userScore[1][0];
                            }
                        }
                        if (gamesScore.score1ot == gamesScore.score2ot &&
                            userScore[0][3] == userScore[1][3]) {
                            score++;
                        }
                    }
                    //Riktig P
                    if (gamesScore.score1p != null) {
                        if (gamesScore.score1p > gamesScore.score2p) {
                            gamesWinner = gamesScore.team1_code;
                            
                            if (userScore[0][4] > userScore[1][4]) {
                                score++;
                                userWinner = userScore[0][0];
                            }
                        }
                        if (gamesScore.score1p < gamesScore.score2p) {
                            gamesWinner = gamesScore.team2_code;
                            
                            if (userScore[0][4] < userScore[1][4]) {
                                score++;
                                userWinner = userScore[1][0];
                            }
                        }
                    }
                    //Riktig Res



                    //Riktig vinner
                    console.log("userWinner: " + userWinner + ", gamesWinner: " + gamesWinner);
                    console.log("Score: " + score);

                    if (userWinner == gamesWinner) {
                        score++;
                    }

                    console.log("Score: " + score);
                    score = 0;
                }
            }

        });

        console.log("Finished: " + gamesdocs[0].match_id);
    });
});

function getResultFromUser(match_id, collection) {
    var elemsToGet = match_id * 2;
    var count = 1;
    var tmp = [];
    for (elem in collection) {
        if (elem.indexOf("fs") == 0 && collection[elem] != null) {
            if (count == (elemsToGet-1) || count == elemsToGet) {
                tmp.push(collection[elem]);
            }
            count++;
        }
    }

    return tmp;
}
