
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const csvtojson = require('csvtojson');
const  equitySymbols =  require('./equity-tokens');
// const prisma = require('../lib/db');
console.log(equitySymbols);
const equityKeys= []
const url = 'https://assets.upstox.com/market-quote/instruments/exchange/complete.csv.gz';

const Redis = require("ioredis")
const client = new Redis("redis://localhost:6379");


// Create the 'token_data' folder if it doesn't exist
const folderPath = path.join(__dirname, 'token_data');
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath);
}

const compressedFilePath = path.join(folderPath, 'instrument_data.csv.gz');
const decompressedFilePath = path.join(folderPath, 'instrument_data.csv');
const jsonFilePath = path.join(folderPath, 'options_data.json');
const jsonFilePath2 = path.join(folderPath, 'instrument_keys_data.json');
const jsonFilePath3 = path.join(folderPath, 'structured_options_data.json');
const jsonFilePath4 = path.join(folderPath, 'all_instrument_data.json');
const jsonFilePath5 = path.join(folderPath, 'indexData.json');


function extractBaseInstrumentSymbol(str) {
  // Regular expression to match the part before the first numerical value
  const match = str.match(/^[A-Za-z]+/);
  return match ? match[0] : null;
}



axios({
  method: 'get',
  url: url,
  responseType: 'stream',
})
  .then((response) => {
    const writer = fs.createWriteStream(compressedFilePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  })
  .then(() => {
    // Decompress the gzip file
    const input = fs.createReadStream(compressedFilePath);
    const output = fs.createWriteStream(decompressedFilePath);
    input.pipe(zlib.createGunzip()).pipe(output);

    return new Promise((resolve, reject) => {
      output.on('finish', resolve);
      output.on('error', reject);
    });
  })
  .then(() => {
    // Convert CSV to JSON
    return csvtojson().fromFile(decompressedFilePath);
  })
  .then((jsonArray) => {
    fs.writeFileSync(jsonFilePath4, JSON.stringify(jsonArray, null, 2));

    // const indexData=jsonArray.filter(i=> i.instrument_type=="INDEX" )
    

    const structuredData={
      "INDEX":{
        "NIFTY": {},
        "BANKNIFTY": {},
        "FINNIFTY": {} 
      },
      "BANKNIFTY": {},
      "FINNIFTY": {},
      "NIFTY": {}
    }
    const tokens=[]

    filteredJsonArray=jsonArray.filter(i=>{
      // if(i.name=="Nifty 50"){
      //   structuredData.INDEX.NIFTY=i
      // }
      
      // structuredData.INDEX.NIFTY = i.name === "Nifty 50" ? i : {};


      if(i.name==="Nifty 50"){
        structuredData.INDEX.NIFTY=i
      }else if(i.name==="Nifty Bank"){
        structuredData.INDEX.BANKNIFTY=i
      }else if(i.name==="Nifty Fin Service"){
        structuredData.INDEX.FINNIFTY=i
      }
      // if(i.instrument_type=="OPTIDX" || i.instrument_type=="OPTSTK") return i
      if(i.instrument_type=="OPTIDX" && i.exchange=="NSE_FO") return i
      // else if(i.instrument_type=="EQUITY" && equitySymbols.includes(i.tradingsymbol)) {
      //   equityKeys.push(i.instrument_key)
      //   if(!structuredData.EQUITY) structuredData.EQUITY = {}
      //   structuredData.EQUITY[i.tradingsymbol]=i
      // }
  })
  var otherTokens = []
  const isNifty50Option = /^NIFTY\d{2}([A-Z]{3}|\d{3})\d{5}(CE|PE)$/;
  filteredJsonArray.map(i=>{
      // console.log(i)
      if(i.option_type==="CE"){
        const s1=i.tradingsymbol.substring(0,i.tradingsymbol.length-2)
        filteredJsonArray.map(j=>{
          if(j.option_type==="PE"){
            const s2=j.tradingsymbol.substring(0,j.tradingsymbol.length-2)
            if(s1===s2){
              if(i.tradingsymbol.includes("BANKNIFTY")){
                structuredData.BANKNIFTY[`${i.expiry} : ${i.strike}`]={
                  CE:i,
                  PE:j
                }
                tokens.push(i.instrument_key)
              tokens.push(j.instrument_key)
              }else if(i.tradingsymbol.includes("FINNIFTY")){
                structuredData.FINNIFTY[`${i.expiry} : ${i.strike}`]={
                  CE:i,
                  PE:j
                }
                tokens.push(i.instrument_key)
              tokens.push(j.instrument_key)
              }else if(isNifty50Option.test(i.tradingsymbol)){
                structuredData.NIFTY[`${i.expiry} : ${i.strike}`]={
                  CE:i,
                  PE:j
                }
                tokens.push(i.instrument_key)
              tokens.push(j.instrument_key)
              }
              
          // const baseInstrument = extractBaseInstrumentSymbol(i.tradingsymbol)
          // if(equitySymbols.includes(baseInstrument)){
          //   if(structuredData[baseInstrument]){
          //     structuredData[baseInstrument][`${i.expiry} : ${i.strike}`]={
          //       CE:i,
          //       PE:j
          //     } 
          //     otherTokens.push(i.instrument_key)
          //     otherTokens.push(j.instrument_key)

          //   }else{
          //     structuredData[baseInstrument]={}
          //     structuredData[baseInstrument][`${i.expiry} : ${i.strike}`]={
          //       CE:i,
          //       PE:j
          //     }
          //     otherTokens.push(i.instrument_key)
          //     otherTokens.push(j.instrument_key)
          //     console.log(baseInstrument)
            // }
          // }
          
          }
        }
      })
      }
    })
    // console.log(structuredData)
    fs.writeFileSync(jsonFilePath3, JSON.stringify(structuredData, null, 2));
    //save into db
    client.set("structuredData", JSON.stringify(structuredData)).then(() => {
      console.log("structuredData saved successfully");
    })
    


    
    var jsonArray2= [...equitySymbols,...tokens];
    for(const key in structuredData.INDEX){
      console.log(structuredData.INDEX[key].instrument_key);
      jsonArray2.unshift(structuredData.INDEX[key].instrument_key);
    }
    // jsonArray2.push(...otherTokens)
    // jsonArray2=[...equityKeys, ...jsonArray2]
    fs.writeFileSync(jsonFilePath2, JSON.stringify(jsonArray2, null, 2));
    // save into db
    client.set("instrument_keys", JSON.stringify(jsonArray2)).then(() => {
      console.log("instrument_keys saved successfully");
    })


    fs.writeFileSync(jsonFilePath, JSON.stringify(filteredJsonArray, null, 2));
    console.log('File downloaded, decompressed, CSV converted to JSON, and saved successfully.');
  })
  .catch((error) => {
    console.error('Error:', error.message || error);
  });


