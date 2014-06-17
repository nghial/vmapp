var mongo = require('mongodb');
var monk = require('monk');
var db_gamesresult = monk('localhost:27017/gamesresult');
var db_games = monk('localhost:27017/games');
var db_leaderboard = monk('localhost:27017/leaderboard');
var collection_gamesresult = db_gamesresult.get('usercollection');
var collection_games = db_games.get('usercollection');
var collection_leaderboard = db_leaderboard.get('usercollection');
var list = [];

collection_gamesresult.find({},{},function(e,docs){
    collection_games.find({},{},function(e,docs2){
        docs2.forEach(function(document) {
            
        )};
    });
});



function getResultFromUser(index, collection) {
    var game = "game" + index;
    var score = [0, 0];
    var count = 0;

    for (var attributename in collection) {
        if (attributename.indexOf(game) > -1) {
            if (index < 10 && attributename.length == 8) {
                score[count++] = collection[attributename];
            }

            if (index >= 10 && attributename.length == 9) {
                score[count++] = collection[attributename];
            }
        }
    }

    return score;
}
