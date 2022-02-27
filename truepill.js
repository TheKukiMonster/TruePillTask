'use strict';
const inquirer = require('inquirer');
const clitable = require('cli-table');
const colours = require('colors');

const fileSystem = require('fs');


const formularyPath = "./Data/formulary.json";
const stockPath = "./Data/stockControl.json";

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
          {name: 'Add to or update stock tables'}
        ]
    }
]

const typeMedicineName = [
    {
        type: 'input',
        name: 'medNameInput',
        message: 'Please enter the name of the medicine(s) you wish to add to the formulary...'
    }
]

const typeStockInputs = [
    {
        type: 'input',
        name: 'stockInput',
        message: 'Please enter the details of the stock(s) you wish to add or update. Format: Name packsize dosage stockamount. Add multiple by seperating with \',\'.'
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

    //array used to store any valid medicines later, ready to be passed to writing function
    var validMedicineArray = [];

    //Split the inputs at any punctuation
    var regex = new RegExp(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g);

    var medicineString = string.replace(regex,",");
    var medicineArray = medicineString.split(",");

    //medicineArray should now be split into multiple products with information seperated by spaces.
    //Replace any multiple spaces with single spaces, then split at spaces.
    regex = new RegExp(/[\s]+/g);

    medicineArray.forEach(function(medType, i) {
        medicineArray[i] = medType.replace(regex, " ").trim().split(" ");
    })

    //Each new valid stock will have 4 pieces of information:
    //Name, pack size, dosage, pack number
    medicineArray.forEach(function(medType, i) {
        
        if(medType.length != 4)
        {
            console.log("Error. Incomplete data for entry '" + medType[0] + "'")
            medicineArray[i].splice();

        }
        else
        {

            //Convert to Pascal to force input uniformity and for nicer reading
            medType[0] = PascalConversion(medType[0]);
            var isValid = false;

            //Check if the medicine name is in the formulary
            formularyList['medicines'].forEach(medicineInFormulary => {
                if(medType[0] === medicineInFormulary)
                {
                    isValid = true;
                }
            })
            if(!isValid)
            {
                console.log(medType[0] + " does not exist in the formulary. Try again once it has been added to the formulary.")
            }

            //Check if all other inputs are numeric and exists in formulary
            //Combining these comparators won't work here? Used nested ifs instead
            if(isValid)
            {
                if( !isNaN(medType[1]) )
                {
                    if(!isNaN(medType[2]))
                    {
                        if(!isNaN(medType[3]))
                        {
                            validMedicineArray.push(medType)
                        }
                        else
                        {
                            console.log("Error adding stock for '" + medType[0] + "'. One or more of the data points were not numeric.");
                        }  
                    }
                    else
                    {
                        console.log("Error adding stock for '" + medType[0] + "'. One or more of the data points were not numeric.");
                    }  
                }
                else
                {
                    console.log("Error adding stock for '" + medType[0] + "'. One or more of the data points were not numeric.");
                }  
            }
        }
    })

    return validMedicineArray

}

async function mainMenu(){

        inquirer.prompt(mainMenuQuestions).then((answers) => {
       
               //Decide what to do based on input
               
               //List formulary
               switch(answers.mainMenu) {
       
                   case 'Check the formulary':
                       console.log("Checking formulary...");
                       fetchJSONfile(0);
                       break;
       
                   case 'Check the stock tables':
                       console.log("Checking stock tables..."); 
                       fetchJSONfile(1);
                       break;          
       
                   case 'Add medicine to formulary':
                       inquirer.prompt(typeMedicineName).then((answers => {   
       
                           var isValidName = Promise.resolve(checkString(answers.medNameInput));
       
                           isValidName.then(function(medicineNameArray) {
                               addToJSONfile(0, medicineNameArray)
                           })
       
                       }));
                       break;
       
                   case 'Add to or update stock tables':
                       
                       inquirer.prompt(typeStockInputs).then((answers => {
       
                           var isValidStocks = Promise.resolve(checkStockString(answers.stockInput))
       
                           isValidStocks.then(function(medicineStockArray){
                               addToJSONfile(1, medicineStockArray)
                           })
       
       
                       }))
       
                       break;
               }
           }
        )
}


function CheckAgainstFormulary(medicineArray, formularyList)
{
    return new Promise( (resolve) => 
    {
        var validMedicines = []
        medicineArray.forEach(medicineAdded => {

            var isValid = true;   
            
            //Convert medicineAdded to PascalCase to force inputs to be uniform, and nicer to read
            medicineAdded = PascalConversion(medicineAdded)

            if(medicineAdded.length == 0)
            { 
                isValid = false;
            }
            
            formularyList['medicines'].forEach(medicineInFormulary => {
                //Compare strings in upper case so input mistakes do not matter
                if(medicineAdded.toUpperCase() === medicineInFormulary.toUpperCase())
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

function PascalConversion(string)
{
    try {
        var newString = string.split('')
        newString[0] = newString[0].toUpperCase()
        return newString.join('')
    }
    catch
    {
        return "";
    }   


}

//Adds to the relevant json file
//0 is adding to formulary
//1 is adding to stock listings 
async function addToJSONfile(stock, addedJSON)
{
    //Update the formulary
    if(!stock)
    {
        
        var currFormulary = await getMedicineList();

        addedJSON.forEach(element => {
            currFormulary['medicines'].push(element);
        })

        writeToFile(formularyPath, currFormulary, 1)

    }
    //Update the stock table
    else
    {
        //Load the current stock table so we can amend to the current file
        var stockTable = await getStockList();

        //For each valid stock being added to the list, add it to the stock list.
        addedJSON.forEach(element =>
            {
                var newPackJSON = {};
                var packData = {"packsize": parseInt(element[1]), "dosage": parseInt(element[2]), "stock": parseInt(element[3])}

                //Convert medicine name so that it is in PascalCase to force uniformity.
                element[0] = PascalConversion(element[0])


                //Check that it is in the formulary for an easy push.
                if(element[0] in stockTable['medicines'])
                {  

                    var updatingStock = false;

                    //Get the box array of each type of pack for this medicine
                    var thisMedicinePacksJSON = stockTable['medicines'][element[0]]

                    //Possible that medicine already exists in stock table and we are simply updating the stock level.
                    thisMedicinePacksJSON.forEach(box => {
                        if(box['packsize'] == element[1] )
                            if(box['dosage'] == element[2]){
                                box['stock'] = parseInt(box['stock']) + parseInt(element[3]);
                                updatingStock = true;

                            }
                    })

                    if(!updatingStock)
                    {
                        newPackJSON = packData 
                        stockTable['medicines'][element[0]].push(newPackJSON)
                    }

                }
                //Must create new key in ['medicines'] for the medicine as it currently has no stock listing
                else
                {
                    //Create new key for our new medicine, then add the packData var to an array so we can push other medicines to it.
                    stockTable['medicines'][element[0]] = [packData];

                }

            })

        
        //Write the new stocktable as new stockControl.json file. 0 passed as isFormulary bool.
        writeToFile(stockPath, stockTable, 0)
    }
}

function writeToFile(filePath, newJSON, isFormulary)
{
    var newFile = JSON.stringify(newJSON);
    fileSystem.writeFile(filePath, newFile, err => {
        if(err) {
            console.log("Error writing file")
        }
        else
        {
            if(isFormulary)
            {
                console.log("Successfully updated Formulary.");
            }
            else
            {
                console.log("Successfully updated Stock Table:");
                //Print the new stock table
                fetchJSONfile(1);
            }
        }
    })
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
                resolve(stockJSON);
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
        
        var stockTable = new clitable({head: ['Medicine List'] }) 
        
        try{
            medicineList['medicines'].forEach(medicine =>
                console.log(colours.green(medicine))
            )
        }
        catch {
            console.log("Error reading formulary");
        }

    }
    //Fetch the stock list
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
                
                //Set medicine as header for only one of each medicines' listings for clearer output
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

            //Display table in console
            console.log(stockTable.toString())

        }
        catch {
            console.log("Error reading stock list")
        }
    }
}

console.log("Welcome to the pharmacy management system");
mainMenu();   


