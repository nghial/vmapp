var mongo = require('mongodb');
var monk = require('monk');
var finalstageresult_db = monk('localhost:27017/finalstageresult');
var games_db = monk('localhost:27017/games');
var leaderboard_db = monk('localhost:27017/leaderboard');
var finalstageresult_col = finalstageresult_db.get('usercollection');
var games_col = games_db.get('usercollection');
var leaderboard_col = leaderboard_db.get('finalstage');
var scorelist = [];

finalstageresult_col.find({},{},function(e,finaldocs){
    games_col.find({},{},function(e,gamesdocs){
        finaldocs.forEach(function(document) {
            console.log("username: " + document.username);
            var count = 1;
            var score = 0;

            console.log("Processing results");
            
            for (elem in gamesdocs) {
                if (gamesdocs[elem].match_id > 48 && gamesdocs[elem].score1 != null) {
                    var gamesScore = gamesdocs[elem];
                    console.log(gamesScore.team1_code + "-" + gamesScore.team2_code);
                    var userScore = getResultFromUser(count++, document);

                    console.log("From user: ");
                    console.log(userScore[0] + "-" + userScore[1]);

                    //Calculate result
                    score += countRightPredictionOnEachPeriod(userScore[0], userScore[1], gamesScore);

                    //Riktig vinner
                    console.log("Score (after countRightPredictionOnEachPeriod): " + score);

                    //Riktig Res
                    score += userHasRightResult(userScore[0], userScore[1], gamesScore);

                    //Riktig vinner
                    console.log("Score (after userHasRightResult): " + score);

                    score += getWinnerTeamBasedOnResult(userScore[0], userScore[1], gamesScore);

                    console.log("Score (after getWinnerTeamBasedOnResult): " + score);
                }
            }

            scorelist.push(document.username + ":" + document.uuid + ":" + score + ":" + document.company);

        });
        leaderboard_col.drop();
        for (var elem in scorelist) {
            var res = scorelist[elem].split(":");

            // Submit to the DB
            leaderboard_col.insert({
                "name" : res[0],
                "uuid" : res[1],
                "points" : parseInt(res[2]),
                "company": res[3]
            }, function (err, doc) {
                if (err) {
                    // If it failed, return error
                    console.log("There was a problem adding the information to the database.");
                }
            });

        }
        console.log("Finished");
    });
});

function countRightPredictionOnEachPeriod(userScore1, userScore2, gamesScore) {
    var score = 0;

    //Riktig FT
    if (gamesScore.score1 > gamesScore.score2) {
        if (userScore1[2] > userScore2[2]) {
            score++;
        }
    }
    if (gamesScore.score1 < gamesScore.score2) {

        if (userScore1[2] < userScore2[2]) {
            score++;
        }
    }
    if (gamesScore.score1 == gamesScore.score2 &&
        userScore1[2] == userScore2[2]) {
        score++;
    }
    //Riktig OT
    if (gamesScore.score1ot != null) {
        if (gamesScore.score1ot > gamesScore.score2ot) {
            if (userScore1[3] != null && userScore1[3] > userScore2[3]) {
                score++;
            }
        }
        if (gamesScore.score1ot < gamesScore.score2ot) {
            if (userScore1[3] != null && userScore1[3] < userScore2[3]) {
                score++;
            }
        }
        if (gamesScore.score1ot == gamesScore.score2ot &&
            userScore1[3] != null &&
            userScore1[3] == userScore2[3]) {
            score++;
        }
    }
    //Riktig P
    if (gamesScore.score1p != null) {
        if (gamesScore.score1p > gamesScore.score2p) {
            if (userScore1[4] != null && userScore1[4] > userScore2[4]) {
                score++;
            }
        }
        if (gamesScore.score1p < gamesScore.score2p) {
            if (userScore1[4] != null && userScore1[4] < userScore2[4]) {
                score++;
            }
        }
    }

    return score;
}

function getWinnerTeamBasedOnResult(userScore1, userScore2, gamesScore) {
    var userWinner = "";
    var gamesWinner = "";

    // Only full time
    if (gamesScore.score1ot == null) {
        if (gamesScore.score1 > gamesScore.score2) {
            gamesWinner = gamesScore.team1_code;
        }
        else if (gamesScore.score1 < gamesScore.score2) {
            gamesWinner = gamesScore.team2_code;
        }
    }
    // FT and OT
    else if (gamesScore.score1ot != null && gamesScore.score1p == null) {
        if (gamesScore.score1ot > gamesScore.score2ot) {
            gamesWinner = gamesScore.team1_code;
        }
        else if (gamesScore.score1ot < gamesScore.score2ot) {
            gamesWinner = gamesScore.team2_code;
        }
    }
    // Penalties
    else if (gamesScore.score1p != null) {
        if (gamesScore.score1p > gamesScore.score2p) {
            gamesWinner = gamesScore.team1_code;
        }
        else if (gamesScore.score1p < gamesScore.score2p) {
            gamesWinner = gamesScore.team2_code;
        }
    }

    console.log("gamesWinner: " + gamesWinner);

    // Only full time
    if (userScore1[3] == null) {
        if (userScore1[2] > userScore2[2]) {
            userWinner = userScore1[0];
        }
        else if (userScore1[2] < userScore2[2]) {
            userWinner = userScore2[0];
        }
    }
    // FT and OT
    else if (userScore1[3] != null && userScore1[4] == null) {
        if (userScore1[3] > userScore2[3]) {
            userWinner = userScore1[0];
        }
        else if (userScore1[3] < userScore2[3]) {
            userWinner = userScore2[0];
        }
    }
    // Penalties
    else if (userScore1[4] != null) {
        if (userScore1[4] > userScore2[4]) {
            userWinner = userScore1[0];
        }
        else if (userScore1[4] < userScore2[4]) {
            userWinner = userScore2[0];
        }
    }

    console.log("userWinner: " + userWinner);

    if (userWinner == gamesWinner) {
        return 1;
    }

    return 0;
}

function userHasRightResult(userScore1, userScore2, gamesScore) {
    
    //Right FT, if only FT
    if (gamesScore.score1ot == null) {
        if (userScore1[2] == gamesScore.score1 && 
            userScore2[2] == gamesScore.score2) {
            return 1;
        }
    }

    // Right FT and OT, if only FT and OT
    if (gamesScore.score1ot != null && gamesScore.score1p == null) {
        if (userScore1[2] == gamesScore.score1 && 
            userScore2[2] == gamesScore.score2) {
            if (userScore1[3] != null &&
                userScore1[3] == gamesScore.score1ot && 
                userScore2[3] == gamesScore.score2ot) {
                return 1;
            }
        }
    }

    // Right all scores
    if (userScore1[2] == gamesScore.score1 && 
        userScore2[2] == gamesScore.score2) {
        if (userScore1[3] != null &&
            userScore1[3] == gamesScore.score1ot && 
            userScore2[3] == gamesScore.score2ot) {
            if (userScore1[4] != null &&
                userScore1[4] == gamesScore.score1p && 
                userScore2[4] == gamesScore.score2p) {
                return 1;
            }
        }
    }

    return 0;
}

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
