'use strict';
const inquirer = require('inquirer');
const clitable = require('cli-table');

const fileSystem = require('fs');

const { off } = require('process');
const { Console, table } = require('console');
const { Serializer } = require('v8');


const formularyPath = "./Data/formulary.json";
const stockPath = "./Data/stockControl.json";

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

const typeStockInputs = [
    {
        type: 'input',
        name: 'stockInput',
        message: 'Please enter the details of the stock(s) you wish to add. (Name, pack size, dosage, stock amount)'
    }
]


//Check if the input medicine is valid, or already exists in the formulary
async function checkString(string)
{

    var formularyList = await getMedicineList();

    //Add code to split string at any punctuation and replace with commas
    var regex = new RegExp(/[.,\/#!$%\^&\*;:{}=\-_`~()\s]/g);
    
    //Replace any punctuation with commas, split into an array, then clear whitespace to loop through for validation
    var medicineString = string.replace(regex,",");
    var medicineArray = medicineString.split(",");


    medicineArray = medicineArray.map(s => s.trim());

    var validMedicines = await CheckAgainstFormulary(medicineArray, formularyList);

    return validMedicines;

}

async function checkStockString(string)
{

    var formularyList = await getMedicineList();

    //Split the inputs at any punctuation
    var regex = new RegExp(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g);
    var medicineString = string.replace(regex,",");
    var medicineArray = medicineString.split(",");

    //medicineArray should now be split into multiple products with information seperated by spaces.
    //Replace any multiple spaces with single spaces, then split at spaces.
    //Each new valid stock will have 4 pieces of information:
    //Name, pack size, dosage, pack number

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
                fetchJSONfile(1);
                break;          

            case 'Add medicine to formulary':
                console.log("Picked add medicine to formulary");
                inquirer.prompt(typeMedicineName).then((answers => {   

                    console.log(answers.medNameInput);
                    var isValidName = Promise.resolve(checkString(answers.medNameInput));

                    isValidName.then(function(medicineNameArray) {
                        addToJSONfile(0, medicineNameArray)
                    })

                }));
                break;

            case 'Add medicine to stock tables':
                console.log("Picked add medicine to stock tables");

                inquirer.prompt(typeStockInputs).then((answers => {

                    console.log(answers.stockInput);
                    var isValidStocks = Promise.resolve(checkStockString())


                }))



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

function getStockList()
{
    return new Promise( (resolve, reject) => 
    {

        fileSystem.readFile(stockPath, 'utf8', (err, stockString) => {
            if(err){
                console.log("Error reading stock list: ", err)
                reject(err)
            }
            try {
                const stockJSON = JSON.parse(stockString)
                resolve(stockJSON['stock']);
            } catch(err) {
                console.log("Error parsing stock list: ", err);
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
    else{

        var stockList = await getStockList();
        try{

            var stockTable = new clitable({head: ['Medicine', "Pack Size", "Dosage", "Stock Number"] }) 

            //Get a list of the medicine name so we can loop through their respective packs
            var medicines = stockList['medicines']

            var rowHeader = "";
            var rowJSON = {}
            
            for (var medicineName in medicines)
            {
                //Set medicine as header for only one of the medicines listings for clearer output
                // | exampleMedicine | x | y | z |
                // |                 | a | b | c |
                
                rowHeader = medicineName;

                medicines[medicineName].forEach(packType => {

                    //Create a JSON out of stock data to add to the stock table's output
                    rowJSON[rowHeader] = Object.values(packType);
                    stockTable.push(rowJSON)

                    //Reset with blank medicine header and clean JSON data 
                    rowJSON = {}
                    rowHeader = ""

                })
            }

            console.log(stockTable.toString())

        }
        catch {
            console.log("Error reading stocklist")
        }



    }
}


mainMenu();