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
            console.log("fs0: " + document.fs0);
            console.log("fs0[2]: " + document.fs0[2]);
            console.log("length: " + document.fs0.length);
            var count = 1;
            var score = 0;

            console.log("Processing results");
            
            for (elem in gamesdocs) {
                if (gamesdocs[elem].match_id > 48 && gamesdocs[elem].score1 != null) {
                    console.log(gamesdocs[elem].team1_code + "-" + gamesdocs[elem].team2_code);
                    var tmp = getResultFromUser(count, document);

                    console.log(count);
                    console.log("From user: ");
                    console.log(tmp[0][0] + "-" + tmp[1]);
                    count++;
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
