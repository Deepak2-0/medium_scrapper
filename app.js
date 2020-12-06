const express = require("express");
const https = require("https");
const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const json2csv = require("json2csv").Parser;

const app = express();

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended:true}));

async function scrapData(url) {

    //console.log("checkpoint1");

    let mediumData = [];

    const response = await request({
        uri: url,
        headers: {
            "accept": "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9"
        },
        gzip:true
    });

    //console.log("checkpoint2");

    let $ = cheerio.load(response);

    let creator = $("div.n.p .ab.ac.ae.af.ag.dm.ai.aj a img")[0].attribs.alt;
    let title = $("div.n.p h1")[0].children[0].data;
    let date = $("span.cg.b span div")[0].children[0].childNodes[0].data;

    let tagsLength = $("div ul.ba.bb")[0].children.length;

    let tags = [];

    //console.log("checkpoint3");

    for(let i=0;i<tagsLength;i++){

        let tag = $("div ul.ba.bb")[0].children[i].children[0].children[0].data;
        tags.push(tag);
    }

    //console.log("checkpoint4");

    mediumData.push({
        title, creator, date, tags
    });

    //console.log("checkpoint5");
    const j2cp =new  json2csv();
    const csv = j2cp.parse(mediumData);

    //console.log("checkpoint6");

    fs.writeFileSync(`./${creator}.csv`, csv, "utf-8")
    // console.log(j2cp);
    // console.log(mediumData);



}

app.get("/", (req,res)=>{

    res.sendFile(__dirname+"/index.html");    
    
})

app.post("/", async (req, res)=>{

    let url = req.body.mediumUrl;
    //console.log(url);

    try {

        let dataSets = await scrapData(url);
    
        res.sendFile(__dirname+"/success.html");

    } catch (error) {
        res.sendFile(__dirname +"/failure.html");
    }

    
})

app.get("/success",(req,res)=>{
    res.redirect("/");
})

app.get("/failure",(req,res)=>{
    res.redirect("/");
})


app.listen(process.env.PORT || 3000, ()=>{
    console.log("server has started on port 3000 .....");
})


