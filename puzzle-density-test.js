#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Test puzzle generation density
async function testPuzzleDensity() {
    const testCases = [
        { size: 5, difficulty: 'easy', expectedDensity: [0.35, 0.60] },
        { size: 5, difficulty: 'medium', expectedDensity: [0.25, 0.40] },
        { size: 5, difficulty: 'difficult', expectedDensity: [0.15, 0.30] },
        
        { size: 7, difficulty: 'easy', expectedDensity: [0.35, 0.55] },
        { size: 7, difficulty: 'medium', expectedDensity: [0.25, 0.40] },
        { size: 7, difficulty: 'difficult', expectedDensity: [0.15, 0.30] },
        
        { size: 10, difficulty: 'easy', expectedDensity: [0.35, 0.50] },
        { size: 10, difficulty: 'medium', expectedDensity: [0.25, 0.35] },
        { size: 10, difficulty: 'difficult', expectedDensity: [0.15, 0.25] },
        
        { size: 12, difficulty: 'easy', expectedDensity: [0.30, 0.45] },
        { size: 12, difficulty: 'medium', expectedDensity: [0.20, 0.35] },
        { size: 12, difficulty: 'difficult', expectedDensity: [0.15, 0.25] },
        
        { size: 15, difficulty: 'easy', expectedDensity: [0.30, 0.45] },
        { size: 15, difficulty: 'medium', expectedDensity: [0.20, 0.30] },
        { size: 15, difficulty: 'difficult', expectedDensity: [0.15, 0.25] }
    ];
    
    console.log('🔍 Testing Puzzle Generation Density\n');
    console.log('Grid Size | Difficulty | Total Cells | Numbers | Density | Expected Range | Status');
    console.log('----------|------------|-------------|---------|---------|----------------|-------');
    
    let totalTests = 0;
    let passedTests = 0;
    
    for (const test of testCases) {
        try {
            // Test algorithm service
            const algoUrl = `http://localhost:8080/application/sl/gen?puzzledim=${test.size}&diff=${test.difficulty}`;
            
            // Use curl to test algorithm service
            let puzzleData;
            try {
                const curlResult = execSync(`curl -s "${algoUrl}"`, { encoding: 'utf8', timeout: 10000 });
                puzzleData = JSON.parse(curlResult);
            } catch (error) {
                console.log(`${test.size.toString().padEnd(9)} | ${test.difficulty.padEnd(10)} | ${'-'.padEnd(11)} | ${'-'.padEnd(7)} | ${'-'.padEnd(7)} | ${`${(test.expectedDensity[0]*100).toFixed(0)}-${(test.expectedDensity[1]*100).toFixed(0)}%`.padEnd(14)} | ❌ SERVICE DOWN`);
                continue;
            }
            
            if (!puzzleData || !puzzleData.count) {
                console.log(`${test.size.toString().padEnd(9)} | ${test.difficulty.padEnd(10)} | ${'-'.padEnd(11)} | ${'-'.padEnd(7)} | ${'-'.padEnd(7)} | ${`${(test.expectedDensity[0]*100).toFixed(0)}-${(test.expectedDensity[1]*100).toFixed(0)}%`.padEnd(14)} | ❌ INVALID DATA`);
                continue;
            }
            
            const totalCells = (test.size - 1) * (test.size - 1);
            let numberCount = 0;
            
            // Parse the count field which contains the clues as a JSON string
            const clues = JSON.parse(puzzleData.count);
            
            // Count numbers in clues array
            for (let row of clues) {
                for (let cell of row) {
                    if (cell !== null && cell !== -1) {
                        numberCount++;
                    }
                }
            }
            
            const density = numberCount / totalCells;
            const isWithinRange = density >= test.expectedDensity[0] && density <= test.expectedDensity[1];
            const status = isWithinRange ? '✅ PASS' : '❌ FAIL';
            
            console.log(`${test.size.toString().padEnd(9)} | ${test.difficulty.padEnd(10)} | ${totalCells.toString().padEnd(11)} | ${numberCount.toString().padEnd(7)} | ${(density * 100).toFixed(1).padEnd(6)}% | ${`${(test.expectedDensity[0]*100).toFixed(0)}-${(test.expectedDensity[1]*100).toFixed(0)}%`.padEnd(14)} | ${status}`);
            
            totalTests++;
            if (isWithinRange) passedTests++;
            
        } catch (error) {
            console.log(`${test.size.toString().padEnd(9)} | ${test.difficulty.padEnd(10)} | ${'-'.padEnd(11)} | ${'-'.padEnd(7)} | ${'-'.padEnd(7)} | ${`${(test.expectedDensity[0]*100).toFixed(0)}-${(test.expectedDensity[1]*100).toFixed(0)}%`.padEnd(14)} | ❌ ERROR`);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📊 Summary:');
    console.log(`Total tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
    console.log(`Failed: ${totalTests - passedTests} (${(((totalTests - passedTests)/totalTests)*100).toFixed(1)}%)`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 All density tests PASSED! Current algorithm meets the standards.');
    } else {
        console.log('\n⚠️  Some density tests FAILED. Algorithm needs adjustment.');
        
        console.log('\n🔧 Recommended Actions:');
        console.log('1. Adjust clue reduction logic in SLGen.java');
        console.log('2. Implement density-based constraints for different difficulties');
        console.log('3. Add minimum/maximum clue count validation');
    }
}

// Helper function for delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the test
testPuzzleDensity().catch(console.error);