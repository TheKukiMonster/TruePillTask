'use strict';
const inquirer = require('inquirer');

const formularyJSON = require('./Data/formulary.json')

const output = [];


console.log("Welcome to the pharmacy management system.")

const mainMenuQuestions = [

    {
        type: 'list',
        name: 'mainMenu',
        message: 'What do you want to do?',
        choices: [
          {name: 'Check the formulary'},
          {name: 'Check the stock tables'},
          new inquirer.Separator(),
          {name: 'Add medicine to formulary'},
          {name: 'Add medicine to stock tables'}
        ]
    }
]

const typeMedicineName = [
    {
        type: 'input',
        name: 'medNameInput',
        message: 'Please enter the name of the medicine you wish to add to the formulary...'
    }
]


//Check if the input medicine is valid, or already exists in the formulary
async function checkString(string)
{

    var medicineList = getMedicineList();
    console.log(medicineList)
    var validMessage = "Valid Medicine";

    if(string.length == 0)
    {
        return "Error. Please enter a medicine name"; 
    }

    medicineList.forEach(function(medicine) {
        if(medicine === string)
        {
            validMessage = "Error. Medicine already exists in formulary";
        }
    })

    return validMessage;

}

async function mainMenu(){
    inquirer.prompt(mainMenuQuestions).then((answers) => {
     //   output.push(answers.mainMenu);

        //Decide what to do based on input
        
        //List formulary
        switch(answers.mainMenu) {

            case 'Check the formulary':
                //console.log("Picked check formulary");
                fetchJSONfile(0);
                break;

            case 'Check the stock tables':
                console.log("Picked check stock tables"); 
                break;          

            case 'Add medicine to formulary':
                console.log("Picked add medicine to formulary");
                var medicineName
                inquirer.prompt(typeMedicineName).then((answers => {   

                    console.log(answers.medNameInput);
                    var isValidName = Promise.resolve(checkString(answers.medNameInput));

                    isValidName.then(function(message) {
                        console.log(message);
                    })

                }));
                break;

            case 'Add medicine to formulary':
                console.log("Picked add medicine to stock tables");
                break;
        }

    }
    )};

async function getMedicineName(){


    
}

//Adds to the relevant json file
async function addToJSONfile(adding, medName)
{

}

function getMedicineList()
{
    try {
        var medicineList = formularyJSON['medicines']

    } catch (error) {
        console.log("Error reading the formulary database.");
        return;
    }

    for(var str in medicineList)
    {
        console.log("medicine:" + str)
    }
    return medicineList;

}

//Fetches the relevant json file
//adding is a boolean to decide which file to fetch. 
//0 is formulary
//1 is stock table
async function fetchJSONfile(stock)
{
    //fetch the formulary
    if(!stock){

        var medicineList = getMedicineList();
        console.log(medicineList)
        medicineList.forEach(medicine => console.log(medicine));
        return;
    }
}

async function parseJSON(json){

    keyList = json.keys;

    keyList.forEach(element => {
        console.log(element)
    });

    //Decide what to do with JSON based on tags


}

mainMenu();