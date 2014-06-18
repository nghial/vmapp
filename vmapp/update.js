var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/gamesresult');
var db2 = monk('localhost:27017/games');
var db3 = monk('localhost:27017/leaderboard');
var collection = db.get('usercollection');
var collection2 = db2.get('usercollection');
var collection3 = db3.get('usercollection');
var scorelist = [];

collection.find({},{},function(e,docs){
    collection2.find({},{},function(e,docs2){
        docs.forEach(function(document) {
                //console.log(document.username);
                var points = 0;


                for(var i = 1; i <= 15; i++){
                    var date_game1 = new Date("2014-06-12T20:00:00.000Z");
                    var date_user = new Date(document.created);
 
                    if (document.created == null) {
                        date_user  = new Date(document.date);
                    }
                    else {
                        date_user  = new Date(document.created);
                    }
                           
                    if (i == 1 && date_user > date_game1) {
                    }
                    else {
                        var scoresFromUser = getResultFromUser(i, document);
                        docs2.forEach(function(document2) {
                            if(document2.match_id == i) {  
                                
                                if (document2.score1 != null && document2.score2 != null) {

                                    //H
                                    if (document2.score1 > document2.score2 && scoresFromUser[0] > scoresFromUser[1]) {
                                        points++;
                                    }
                                    //D
                                    if (document2.score1 == document2.score2 && scoresFromUser[0] == scoresFromUser[1]) {
                                        points++;
                                    }
                                    //L
                                    if (document2.score1 < document2.score2 && scoresFromUser[0] < scoresFromUser[1]) {
                                        points++;
                                    }

                                    if (document2.score1 == scoresFromUser[0] && document2.score2 == scoresFromUser[1]) {
                                        points += 2;
                                    }
                                }
                            }
                        });
                    }
                }

                scorelist.push(document.username  + ":" + document.uuid + ":" + points + ":" + document.company);
        });
        collection3.drop();
        for (var elem in scorelist) {
            var res = scorelist[elem].split(":");

            // Submit to the DB
            collection3.insert({
                "name" : res[0],
                "uuid" : res[1],
                "points" : parseInt(res[2])
                "company": 
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
