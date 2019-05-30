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
// Function to check if a string is a valid email
// Parameters: string => String containing the email address
function validEmail(string){
  // Get until the end of the actual email.
  // For example: "email@email.com :)" should return false
  return _.endsWith(string, '.com');
}


// ===================================================================
// Function to handle people's classes
// Parameters: person => Object person.
//             value => String representing the person's classes.
function handleClasses(person, value){

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
}

// ===================================================================
// Function to handle people's phone address
// Parameters: address => Object address.
//             value => String representing the person's phone address.
function handlePhoneAddress(address, value){
  try{
    // Parse number with country code and keep raw input.
    const number = phoneUtil.parseAndKeepRawInput(value, 'BR');
    if(phoneUtil.isValidNumber(number)){
      address['address'] = number.getCountryCode() + "" + number.getNationalNumber();
    }else{
      return false;
    }
  }catch(err){
    // Could not parse the number, so do not add it to
    // addresses.
    return false;
  }
  return true;
}

// ===================================================================
// Function to handle people's email address
// Parameters: person => Object person.
//             address => Object email.
//             value => String representing the person's email address.
function handleEmailAddress(person, address, value){
  if(value.indexOf('@') < 0){
    return false;
  }

  // Some classes may have a dirty character in the middle.
  // Making them multiple emails in one string.
  // For example: "email1 / email2" or "email1 , email2"
  if(value.indexOf('/') || value.indexOf(',')){
    let emails = _.split(value, '/');
    emails = _.split(emails, ',');

    _.forEach(emails, function(email){
      let copyAddress = Object.assign({}, address);
      if(validEmail(email)){
        copyAddress['address'] = email;
        person['addresses'].push(copyAddress);
      }
    });
    return false;
  }else{

    // There is only one element in value.
    if(validEmail(value)){
      address['address'] = value;
    }else{
      return false;
    }
  }

  return true;
}

// ===================================================================
// Function to handle people's addresses
// Parameters: person => Object person.
//             value => String representing the person's addresses.
function handleAddresses(person, value){
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
    addAddress = handlePhoneAddress(address, value);
  }

  // Check if an email is not empty
  if(_.startsWith(key, 'email')){
    addAddress = handleEmailAddress(person, address, value);
  }

  if(addAddress){
    person['addresses'].push(address);
  }
}


// ===================================================================
// Function to transform a line into a person object
// Parameters: keys => Object keys.
//             line => Values for each key.
function transforIntoPerson(keys, line){
  let person = {};

  // For each pair key-value
  for(let i=0; i<keys.length; i++){
    key = keys[i];
    value = line[i];
    let added = false;

    // Handle Classes
    if(_.startsWith(value, 'Sala')){
      handleClasses(person, value);
      added = true;

    }

    // Handle Addresses
    if(_.startsWith(key, 'email') ||
       _.startsWith(key, 'phone') &&
      (!added)){

      handleAddresses(person, value);
      added = true;
    }

    // Handle insible and see_all because they need to be a true/false value
    if(_.startsWith(key, 'invisible') ||
       _.startsWith(key, 'see_all')) {
      if(_.startsWith(value, '1') || _.startsWith(value, 'yes')){
        person[key] = true;
      }else{
        person[key] = false;
      }
      added = true;
    }

    // Handle all the other information, where there is no need to parse or change value
    if(!added){
      person[key] = value;
    }
  }
  return person;
}

// ===================================================================
// Function to Intersect classes from people
// Parameters: first  => First person
//             second => Second person
function intersectClasses(first, second){
  let firstClasses = first['classes'];
  let secondClasses = second['classes'];
  let ret = firstClasses;

  _.forEach(secondClasses, function(value){
    let index = ret.indexOf(value);
    if(index < 0){
      ret.push(value);
    }
  });
  return ret;
}

// ===================================================================
// Function to Intersect addresses from people
// Parameters: first  => First person
//             second => Second person
function intersectAddresses(first, second){
  let firstAddresses = first['addresses'];
  let secondAddresses = second['addresses'];
  let ret = firstAddresses;

  _.forEach(secondAddresses, function(address){
    let add = true;
    _.forEach(ret, function(value){
      if(value['address'] == address['address']){
        add = false;
      }
    });
    if(add == true){
      ret.push(address);
    }
  });
  return ret;
}

// ===================================================================
// Function to merge information between two people

function mergePeople(first, second){
// Parameters: first  => First person
//             second => Second person
  first['classes'] = intersectClasses(first, second);
  first['addresses'] = intersectAddresses(first, second);
  first['invisible'] = first['invisible'] || second['invisible'];
  first['see_all'] = first['see_all'] || second['see_all'];
  return first;
}


// ===================================================================
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

    // Exist person with the same eid, merge them.
    if(peopleIndex[person['eid']]){
      addPerson = false;

      let index = peopleIndex[person['eid']] - 1;
      let other = people[index];

      other = mergePeople(other, person);
    }

    // If no other person exist with the same eid, add it.
    if(addPerson){
      peopleIndex[person['eid']] = people.push(person);
    }

  });

  // Write people into a JSON file
  fs.writeFile("./my_output.json", JSON.stringify(people, null, 1), function(err) {
    if(err) {
      console.log(err);
    }

    console.log("The file was saved!");
  });
}
processLineByLine();
