# Install instructions (on windows)

- Install Node
- Install MongoDB
- Open powershell and go to the vmapp-folder
- execute: "npm install -g express"
- execute: "npm install -g express-generator"
- execute: "npm install node-uuid"
- execute: "npm install"
- execute: "npm start"
- open a browser and go to http://localhost:3000

- Open new powershell and execute 'cd "C:\Program Files\MongoDB 2.6 Standard\bin"'
- Execute .\mongod.exe --dbpath [path to vmapp-folder]\data

# Update results
- Start mongodb
- %use gamesresult
- Find the game you want to update ("match_id")
- %db.usercollection.update({"match_id": 1}, {$set: { "score1":3, "score2": 2 }})