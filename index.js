console.log("ClassApp Dev Challenge");

// Imports
const _ = require('lodash');
const fs = require('fs');
const readline = require('readline');


// Code
let lines = [];
let objects = [];


// Function to Get a String and convert it into a array
function splitLine(line){
  console.log(line);
  let middle = _.split(line, ',');
  let res = [];
  for(let i=0; i<middle.length; i++){
    if(_.startsWith(middle[i], '"')){
      let string = '';
      string += _.replace(middle[i], '"', '');
      string += ',';
      string += _.replace(middle[i+1], '"', '');
      i++;
      res.push(string);
    }else{
      res.push(middle[i]);
    }
  }
  return res;
}

// Function to Get a Array and create an Object with each element as a key
function transforIntoObject(keys, line){
  let object = {};

  for(let i=0; i<keys.length; i++){
    key = keys[i];
    value = line[i];


    // Handle Classes
    if(_.startsWith(value, 'Sala')){

      if(!Array.isArray(object['classes'])){
        object['classes'] = [];
      }

      if(value.indexOf('/')){
        let values = _.split(value, '/');
        _.forEach(values, function(val){
          object['classes'].push(_.trimEnd(val));
        });
      }

    }else{

      // Handle Addresses
      if(_.startsWith(key, 'email') ||
         _.startsWith(key, 'phone')){

        if(!Array.isArray(object['addresses'])){
          object['addresses'] = [];
        }

        key = _.replace(key, ',', '');
        keyElem = _.split(key, ' ');
        address = {};
        address['type'] = keyElem.shift();
        address['tags'] = keyElem;

        if(_.startsWith(key, 'phone')){
          address['address'] = value;
        }else{
          address['address'] = value;
        }

        object['addresses'].push(address);
      }else{
        object[key] = value;
      }
    }
  }
  console.log(JSON.stringify(object));
  return object;
}
// let aux = "bla";
// object[aux] = [];
// object[aux].push("oi");
// object[aux].push("oi");

// console.log(JSON.stringify(object));

// Function to Create a File with the Object

// Function to Open The CSV line by line
// https://nodejs.org/api/readline.html#readline_example_read_file_stream_line_by_line
async function processLineByLine() {
  const fileStream = fs.createReadStream('input.csv');

  const rl = readline.createInterface({
    input: fileStream
  });

  for await (const line of rl) {
    // Each line in input.csv will be successively available here as `line`.
    let processedLine = splitLine(line);
    lines.push(processedLine);
  }

  let keysLine = lines.shift();
  console.log(lines[1]);
  let object = transforIntoObject(keysLine, lines[0]);
  objects.push(object);
  // console.log(lines);
}
processLineByLine();
