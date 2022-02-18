'use strict';
const inquirer = require('inquirer');


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


function mainMenu(){
    inquirer.prompt(mainMenuQuestions).then((answers) => {
     //   output.push(answers.mainMenu);

        //Decide what to do based on input
        
        //List formulary
        switch(answers.mainMenu) {

            case 'Check the formulary':
                console.log("Picked check formulary");
                fetchJSONfile(0, 0);

            case 'Check the stock tables':
                console.log("Picked check stock tables");            

            case 'Add medicine to formulary':
                console.log("Picked add medicine to formulary");

            case 'Add medicine to formulary':
                console.log("Picked add medicine to stock tables");
        }

    }
    )};

//Fetches the relevant json file
//adding is a boolean to decide which file to fetch. 
//0 is formulary
//1 is stock table
function fetchJSONfile(adding, stock)
{
    //fetch the formulary
    if(!stock){

        //Only check stock
        if(!adding)
        {
            
        }
    }
}

function parseJSON(json){

    keyList = json.keys;

    keyList.forEach(element => {
        console.log(element)
    });

    //Decide what to do with JSON based on tags


}

mainMenu();