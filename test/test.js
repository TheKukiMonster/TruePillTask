const { assert } = require("chai");
var chai = require("chai")
var expect = require('chai').expect

const truepillPath = '../truepill';
const checkString = require(truepillPath).checkString;
const switchToTesting = require(truepillPath).switchToTesting;
const getMedicineList = require(truepillPath).getMedicineList;
const addToJSONfile = require(truepillPath).addToJSONfile;
const checkStockString = require(truepillPath).checkStockString;

describe('TruePill unit tests', function(){    
        
    it("Switches to testing databases", async() => {
        var testStockPath = await switchToTesting();
        assert.equal(testStockPath, "./Data/stockControlTesting.json")
    })
    
    describe('checkString unit test', function(){

        it("checkString should accept Paracetamol as a valid input", async() => {
            
            var validMedicines = await checkString("Paracetamol");
            assert.equal("Paracetamol", validMedicines[0]);
    
        })
    
        it("checkString should accept Paracetamol, reject Ibuprofen as already exists in formulary", async() => {
            
            var validMedicines = await checkString("Paracetamol, Ibuprofen");
            assert.lengthOf(validMedicines, 1)
            assert.equal("Paracetamol", validMedicines[0]);
        })
    
        it("checkString should accept multiple arguments seperated by any type of punctuation, and in any case", async() => {
            var validMedicines = await checkString("paraCEtaMol. Codeine;   Tramadol")
            assert.lengthOf(validMedicines, 2)
            assert.equal("Paracetamol", validMedicines[0])
            assert.equal("Tramadol", validMedicines[1])
        })
    
    })


    describe('checkStockString unit test', function(){

        it("checkStockString should accept Ibuprofen 1 2 3 as a valid input", async() => {
            
            var validMedicines = await checkStockString("Ibuprofen 1 2 3");
            expect(["Ibuprofen", "1", "2", "3"]).to.eql(validMedicines[0])
        
        })

        it("checkStockString should reject Ibuprofen 1 3 as an incomplete input", async() => {
            
            var validMedicines = await checkStockString("Ibuprofen 1 3");
            expect([]).to.eql(validMedicines)
        
        })

        it("checkStockString should reject Ibuprofen 1 nan 3 as an incorrect", async() => {
            
            var validMedicines = await checkStockString("Ibuprofen 1 nan 3");
            expect([]).to.eql(validMedicines)
        
        })

        it("checkStockString should reject Amoxcillin 1 2 3 as an invalid input as it is not in formulary", async() => {
            
            var validMedicines = await checkStockString("Amoxicillin 1 2 3");
            expect([]).to.eql(validMedicines)
        
        })

        it("checkStockString should accept 'Amoxcillin 1 2 3, Ibuprofen 1 2 3' as a valid input, but only pass Ibuprofen", async() => {
            
            var validMedicines = await checkStockString("Amoxicillin 1 2 3, Ibuprofen 1 2 3");
            expect(["Ibuprofen", "1", "2", "3"]).to.eql(validMedicines[0])
        
        })

        it("checkStockString should accept 'Amoxcillin 1 2 3, Ibuprofen 1 d 3, Ibuprofen 1 2, Codeine 1 2 3' as a valid input, but only pass Codeine", async() => {
            
            var validMedicines = await checkStockString("Amoxcillin 1 2 3, Ibuprofen 1 d 3, Ibuprofen 1 2, Codeine 1 2 3");
            expect(["Codeine", "1", "2", "3"]).to.eql(validMedicines[0])
        
        })
    
    })
})
