'use strict';
const inquirer = require('inquirer');
const fileSystem = require('fs');
const { off } = require('process');
const { Console } = require('console');

const formularyPath = "./Data/formulary.json";

//const formularyJSON = require('./Data/formulary.json')

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

    var formularyList = await getMedicineList();
    var validMessage = "Valid Medicine";

    //Add code to split string at any punctuation and replace with commas
    var regex = new RegExp(/[.,\/#!$%\^&\*;:{}=\-_`~()\s]/g);
    
    //Replace any punctuation with commas, split into an array, then clear whitespace to loop through for validation
    var medicineString = string.replace(regex,",");
    var medicineArray = medicineString.split(",");


    medicineArray = medicineArray.map(s => s.trim());

    var validMedicines = await CheckAgainstFormulary(medicineArray, formularyList);

    return validMedicines;

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

                    isValidName.then(function(medicineNameArray) {
                        addToJSONfile(0, medicineNameArray)
                    })

                }));
                break;

            case 'Add medicine to formulary':
                console.log("Picked add medicine to stock tables");
                break;
        }

    }
    )};

function CheckAgainstFormulary(medicineArray, formularyList)
{
    return new Promise( (resolve) => 
    {
        var validMedicines = []
        medicineArray.forEach(medicineAdded => {

     //       console.log("Checking isValid: " + medicineAdded)
            var isValid = true;       

            if(medicineAdded.length == 0)
            { 
                isValid = false;
            }
            
            formularyList['medicines'].forEach(medicineInFormulary => {
                
           //     console.log("Checking against: " + medicineInFormulary);
    
                if(medicineAdded === medicineInFormulary)
                {
                    console.log("Error. " + medicineAdded + " already exists in formulary");
                    isValid = false;
                }

            })

            if(isValid)
            {
                validMedicines.push(medicineAdded);
            }
    
        });  
        
        resolve(validMedicines);

    })
}

//Adds to the relevant json file
//0 is adding to formulary
//1 is adding to stock listings 
async function addToJSONfile(stock, medName)
{

    if(!stock)
    {
        
        var currFormulary = await getMedicineList();

        medName.forEach(element => {
            console.log("adding to json: " + element);
            currFormulary['medicines'].push(element);
        })

        console.log(currFormulary)

        var newFormulary = JSON.stringify(currFormulary);
        fileSystem.writeFile(formularyPath, newFormulary, err => {
            if (err) {
                console.log("Error writing file", err);
            }
            else
            {
                console.log("Successfully updated formulary")
            }
        })
    }






}

function getMedicineList()
{

    return new Promise( (resolve, reject) => 
    {
            fileSystem.readFile(formularyPath, 'utf8', (err, formularyString) => {
            if(err){
                console.log("Error reading formulary: ", err)
                reject(err)
            }
            try {
                const formularyJSON = JSON.parse(formularyString)
            //    console.log("form string: ", formularyJSON)
                resolve(formularyJSON);

            } catch(err) {
                console.log("Error parsing formulary: ", err);
                reject(err);
            }
        })
    })

}

//Fetches the relevant json file
//adding is a boolean to decide which file to fetch. 
//0 is formulary
//1 is stock table
async function fetchJSONfile(stock)
{
    //fetch the formulary
    if(!stock){

        var medicineList = await getMedicineList();
        try{
            medicineList['medicines'].forEach(medicine => console.log(medicine));
        }
        catch {
            console.log("Error reading formulary");
        }

    }
}


mainMenu();