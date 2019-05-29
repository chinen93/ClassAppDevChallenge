console.log("ClassApp Dev Challenge");

// Imports
const _ = require('lodash');
const fs = require('fs');
const readline = require('readline');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const PNF = require('google-libphonenumber').PhoneNumberFormat;


// Code
let lines = [];
let people = [];


// ===================================================================
// Function to Get a String and convert it into a array.
// Parameters: line => String, representing a line from a CSV file.
function splitLine(line){
  console.log(line);

  // Line is a line from a csv file, so split everything based on comma.
  let middle = _.split(line, ',');
  let res = [];

  for(let i=0; i<middle.length; i++){

    if(_.startsWith(middle[i], '"')){
      // The base csv data has some dirty characters in places that need
      // to be fixed.  For example: "email Responsável, Pai".
      // Where exists a comma separator in the middle of the value.
      let string = '';
      string += _.replace(middle[i], '"', '');
      string += ',';
      string += _.replace(middle[i+1], '"', '');
      i++;
      res.push(string);
    }else{

      // There is no need to clean, so just add it to the return.
      res.push(middle[i]);
    }
  }
  return res;
}

// ===================================================================
// Function to transforma a line into a person object
// Parameters: keys => Object keys.
//             line => Values for each key.
function transforIntoPerson(keys, line){
  let person = {};

  // For each pair key-value
  for(let i=0; i<keys.length; i++){
    key = keys[i];
    value = line[i];


    // Handle Classes
    if(_.startsWith(value, 'Sala')){

      // Classes location for this person
      if(!Array.isArray(person['classes'])){
        person['classes'] = [];
      }

      // Some classes may have a dirty character in the middle.
      // For example: "Sala 1 / Sala 2" or "Sala 1 , Sala 2"
      if(value.indexOf('/') || value.indexOf(',')){
        let values = _.split(value, '/');
        values = _.split(values, ',');
        _.forEach(values, function(val){
          person['classes'].push(_.trim(val));
        });
      }else{
        person['classes'].push(value);
      }

    }else{

      // Handle Addresses
      if(_.startsWith(key, 'email') ||
         _.startsWith(key, 'phone')){

        // Control variable to add or not an address into the
        // addresses key.
        let addAddress = true;

        if(!Array.isArray(person['addresses'])){
          person['addresses'] = [];
        }

        // Some keys may have a dirty character in the middle.
        // For example: "email Responsável, Pai"
        key = _.replace(key, ',', '');
        keyElem = _.split(key, ' ');
        address = {};
        address['type'] = keyElem.shift();
        address['tags'] = keyElem;

        if(_.startsWith(key, 'phone')){
          try{
            // Parse number with country code and keep raw input.
            const number = phoneUtil.parseAndKeepRawInput(value, 'BR');
            if(phoneUtil.isValidNumber(number)){
              address['address'] = number.getCountryCode() + "" + number.getNationalNumber();
            }else{
              addAddress = false;
            }
          }catch(err){
            // Could not parse the number, so do not add it to
            // addresses.
            addAddress = false;
          }
        }

        // Check if an email is not empty
        if(_.startsWith(key, 'email')){
          if(value){
            address['address'] = value;
          }else{
            addAddress = false;
          }
        }
          
        if(addAddress){
          person['addresses'].push(address);
        }
      }else{
        person[key] = value;
      }
    }
  }
  return person;
}

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

  let peopleIndex = {};

  // First line is the key headers.
  let keysLine = lines.shift();

  // The other lines are values for each person.
  _.forEach(lines, function(line){
    let addPerson = true;
    let person = transforIntoPerson(keysLine, line);

    if(peopleIndex[person['eid']]){
      addPerson = false;

      let index = peopleIndex[person['eid']] - 1;
      let other = people[index];

      console.log("Já Existe");
      other['classes'] = other['classes'].concat(person['classes']);
      other['addresses'] = other['addresses'].concat(person['addresses']);
      console.log(other);
    }
    
    if(addPerson){
      peopleIndex[person['eid']] = people.push(person);
      console.log(peopleIndex);
    }

  });
  // console.log(lines);
  console.log(JSON.stringify(people, null, 2));
}
processLineByLine();
