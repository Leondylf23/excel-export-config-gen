const fs = require("fs");
const path = require("path");

fs.readdirSync(path.join(__dirname,'/exports')).forEach(folder => {
    fs.readdirSync(path.join(__dirname, `./exports/${folder}`)).forEach(file => {
            fs.unlinkSync(path.join(__dirname, `./exports/${folder}/${file}`))
        })
        
        fs.rmdirSync(path.join(__dirname, `./exports/${folder}`));
    }
);