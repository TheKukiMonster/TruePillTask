# TruePillTask
Javascript Application for TruePill task. Built as a JavaScript CLI using inquirer and run using node.js.

# Installation

This app requires nodejs to run. Make sure node is installed and use 'npm install' to ensure all necessary dependencies are installed if they aren't already.

```bash
npm install
```

## Usage

This app is run by typing 'node truepill.js'. The program is written using inquirer to allow for CLI interaction with the client and reduce the need for a user to remember commands and arguments.

```bash
node truepill.js
```

The user should be presented with the choice of four options which they can navigate through with the arrow keys and select by hitting 'enter'.

## Check formulary

To check the formulary, the user should simply select the first option from the menu and the medicines currently stored in the formulary are listed in green.

## Check stock levels

To check the stock levels, the second option should be selected. This should list all of the medicines in stock, with any medicines that have multiple variations in stock listed together. It will be presented in an easily readable table format.

## Adding to formulary

To add to the formulary, the user can select the third option. This will allow the user to enter any amount of medicines, as long as they are seperated by a comma or space to add to the formulary. This is case insensivitve and any medicines not already existing in the formulary will be added.

Example input:
```bash
Paracetamol, Ibuproden, Amoxicillin
```

## Adding to stock tables

To add to the stock table, the user can select the fourth option. The user can then any enter any amount of medicines to the list, though each medicine's respective data should only be seperated by spaces. Multiple medicines can be entered by seperating them with commas.

The data should be entered in order of: Name Dosage PackSize StockLevel

Example input:
```bash
Paracetamol 10 50 50, Paracetamol 10 100 50, Ibuprofen 25 100 40
```

To update the stock level of an already existing medicine, the user should enter the data as though adding it as new and the input stock level will be added to the current stock level of the existing medicine.

## Discussion

The app is built with the end user in mind, so I tried to make it a persistent interactive application rather than a multitude of scripts and functions for the user to call. This reduces the number of functions and arguments a pharmacist will need to remember and guides them through the process by giving them clearly signposted step by step instruction. This will help those who may not be as capable with command-line interfaces and reduces the potential for incorrect usage of any functions.

As many medicines are also prescribed in different doses and for different periods of time, the ability to add multiple medicines to the stock table was added.

Some time was spent on trying to automate the unit testing as it is pushed to the repository as opposed to adding more features, so I have linked the latest workflow in this readme. Inquirer adds some quirks to the unit testing as Mocha doesn't seem to want to interact with inquirer and promises nicely so unfortunately, only the string checking functions have tests associated. Also, while the unit tests do pass, the GitHub workflow fails, and I suspect that it is because for some reason, when running npm test, the whole app is running and can be interacted with in console after Mocha has finished. It is possible that GitHub is timing out the testing and failing it.

https://github.com/TheKukiMonster/TruePillTask/actions/runs/1906632362