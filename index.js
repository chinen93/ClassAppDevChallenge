console.log("ClassApp Dev Challenge");



// Function to Open The CSV line by line
// https://nodejs.org/api/readline.html#readline_example_read_file_stream_line_by_line
const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('input.csv');

  const rl = readline.createInterface({
    input: fileStream
  });

  for await (const line of rl) {
    // Each line in input.csv will be successively available here as `line`.
    console.log(`Line from file: ${line}`);
  }
}
processLineByLine();

// Function to Get a Array and create an Object with each element as a key
let pato = {};
let aux = "bla";
pato[aux] = [];
pato[aux].push("oi");
pato[aux].push("oi");

console.log(JSON.stringify(pato));


// Function to Get a String and convert it into a array
const _ = require('lodash');
const line = 'fullname,eid,class,class,"email Responsável, Pai",phone Pai,"phone Responsável, Mãe",email Mãe,email Aluno,phone Aluno,invisible,see_all';

let middle = _.split(line, ',');
let res = [];
for(let i=0; i<middle.length; i++){
  if(_.startsWith(middle[i], '"')){
    let string = '';
    string += _.replace(middle[i], '"', '');
    string += _.replace(middle[i+1], '"', '');
    i++;
    res.push(string);
  }else{
    res.push(middle[i]);
  }
}
console.log(res);

// Function to Create a File with the Object



