package com.puzzle.core;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Random;

/**
 * Improved Slitherlink Generator with proper density control
 */
public class SLGenImproved extends SLGen {
    
    public SLGenImproved(int n, String diff, Boolean trace) {
        super(n, diff, trace);
    }
    
    public SLGenImproved(int n, String diff, long seed, Boolean trace) {
        super(n, diff, seed, trace);
    }
    
    /**
     * Improved puzzle reduction with proper density control
     * 
     * @param diff difficulty level
     * @param oldCount complete puzzle with all clues
     * @return puzzle with appropriate clue density
     */
    @Override
    public int[][] reducePuzzle(String diff, int[][] oldCount) {
        int n = oldCount.length + 1; // Grid dimension
        int totalCells = (n - 1) * (n - 1);
        
        // Define target density ranges based on difficulty and grid size
        DensityRange targetRange = getTargetDensity(n, diff);
        int minClues = (int) Math.ceil(totalCells * targetRange.min);
        int maxClues = (int) Math.floor(totalCells * targetRange.max);
        
        System.out.println(String.format("Grid: %dx%d, Difficulty: %s, Target: %d-%d clues (%.1f%%-%.1f%%)", 
            n, n, diff, minClues, maxClues, targetRange.min*100, targetRange.max*100));
        
        // Count current clues
        int currentClues = countClues(oldCount);
        System.out.println("Starting with " + currentClues + " clues");
        
        if (currentClues <= maxClues) {
            System.out.println("Already within target range, applying fine-tuning only");
            return finetuneReduction(oldCount, minClues, maxClues);
        }
        
        // Use strategic reduction to reach target density
        return strategicReduction(oldCount, minClues, maxClues, diff);
    }
    
    /**
     * Define target density ranges based on grid size and difficulty
     */
    private DensityRange getTargetDensity(int gridSize, String difficulty) {
        if (gridSize <= 7) {
            // Small grids (5x5, 7x7) - need higher density for solvability
            switch (difficulty.toLowerCase()) {
                case "easy": return new DensityRange(0.45, 0.65);
                case "medium": return new DensityRange(0.35, 0.50);
                case "difficult": return new DensityRange(0.25, 0.40);
                default: return new DensityRange(0.35, 0.50);
            }
        } else if (gridSize <= 10) {
            // Medium grids (10x10) - standard density
            switch (difficulty.toLowerCase()) {
                case "easy": return new DensityRange(0.35, 0.50);
                case "medium": return new DensityRange(0.25, 0.35);
                case "difficult": return new DensityRange(0.15, 0.25);
                default: return new DensityRange(0.25, 0.35);
            }
        } else {
            // Large grids (12x12, 15x15, 20x20) - lower density acceptable
            switch (difficulty.toLowerCase()) {
                case "easy": return new DensityRange(0.30, 0.45);
                case "medium": return new DensityRange(0.20, 0.30);
                case "difficult": return new DensityRange(0.15, 0.25);
                default: return new DensityRange(0.20, 0.30);
            }
        }
    }
    
    /**
     * Strategic clue reduction maintaining puzzle solvability
     */
    private int[][] strategicReduction(int[][] puzzle, int minClues, int maxClues, String difficulty) {
        int n = puzzle.length + 1;
        int[][] working = copyPuzzle(puzzle);
        
        // Create list of all clue positions with their removal priority
        ArrayList<CluePosition> cluePositions = new ArrayList<>();
        
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - 1; j++) {
                if (working[i][j] != -1) {
                    int priority = calculateRemovalPriority(i, j, n, working[i][j], difficulty);
                    cluePositions.add(new CluePosition(i, j, working[i][j], priority));
                }
            }
        }
        
        // Sort by removal priority (higher priority = remove first)
        Collections.sort(cluePositions, (a, b) -> Integer.compare(b.priority, a.priority));
        
        // Remove clues strategically until we reach target range
        int currentClues = countClues(working);
        int attempts = 0;
        int maxAttempts = cluePositions.size();
        
        for (CluePosition pos : cluePositions) {
            if (currentClues <= maxClues) break;
            if (attempts >= maxAttempts) break;
            
            // Try removing this clue
            int originalValue = working[pos.row][pos.col];
            working[pos.row][pos.col] = -1;
            
            // Verify puzzle still has unique solution
            if (isValidPuzzle(working)) {
                currentClues--;
                System.out.println(String.format("Removed clue at (%d,%d), value %d. Remaining: %d", 
                    pos.row, pos.col, originalValue, currentClues));
            } else {
                // Restore the clue
                working[pos.row][pos.col] = originalValue;
                System.out.println(String.format("Cannot remove clue at (%d,%d) - would make puzzle unsolvable", 
                    pos.row, pos.col));
            }
            
            attempts++;
        }
        
        // Final validation
        int finalClues = countClues(working);
        System.out.println(String.format("Final puzzle has %d clues (%.1f%% density)", 
            finalClues, (finalClues * 100.0) / ((n-1) * (n-1))));
        
        if (finalClues < minClues) {
            System.out.println("Warning: Final clue count below minimum threshold");
        }
        
        return working;
    }
    
    /**
     * Calculate removal priority for a clue
     * Higher priority = more likely to be removed
     */
    private int calculateRemovalPriority(int row, int col, int gridSize, int clueValue, String difficulty) {
        int priority = 0;
        
        // Center cells have lower priority (harder to deduce)
        int centerDistance = Math.min(Math.min(row, col), 
                           Math.min(gridSize - 2 - row, gridSize - 2 - col));
        priority += centerDistance * 2;
        
        // Clue value affects priority
        switch (clueValue) {
            case 0: priority += 5; break;  // 0s are often easier to use
            case 3: priority += 5; break;  // 3s are often easier to use
            case 1: priority += 3; break;  // 1s are moderately useful
            case 2: priority += 1; break;  // 2s are often crucial
        }
        
        // Corner and edge preferences based on difficulty
        boolean isCorner = (row == 0 || row == gridSize - 2) && (col == 0 || col == gridSize - 2);
        boolean isEdge = (row == 0 || row == gridSize - 2 || col == 0 || col == gridSize - 2);
        
        if ("difficult".equals(difficulty)) {
            if (isCorner) priority += 10; // Remove corners first in difficult
            else if (isEdge) priority += 3;
        } else {
            if (isCorner) priority -= 5; // Keep corners in easier puzzles
            else if (isEdge) priority += 1;
        }
        
        return priority;
    }
    
    /**
     * Fine-tune clue count when already close to target
     */
    private int[][] finetuneReduction(int[][] puzzle, int minClues, int maxClues) {
        // Light reduction to optimize clue placement - use parent's clueReduction method
        return super.clueReduction(puzzle);
    }
    
    /**
     * Check if puzzle has a unique solution
     */
    private boolean isValidPuzzle(int[][] puzzle) {
        try {
            SLSolve solver = new SLSolve(puzzle.length + 1, puzzle, false);
            int[] result = solver.genSolutions(3);
            return result[0] == 2; // Exactly 2 solutions (forward and reverse)
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Count non-empty clues in puzzle
     */
    private int countClues(int[][] puzzle) {
        int count = 0;
        for (int i = 0; i < puzzle.length; i++) {
            for (int j = 0; j < puzzle[i].length; j++) {
                if (puzzle[i][j] != -1) {
                    count++;
                }
            }
        }
        return count;
    }
    
    /**
     * Create a deep copy of the puzzle
     */
    private int[][] copyPuzzle(int[][] original) {
        int[][] copy = new int[original.length][];
        for (int i = 0; i < original.length; i++) {
            copy[i] = original[i].clone();
        }
        return copy;
    }
    
    /**
     * Helper class for density ranges
     */
    private static class DensityRange {
        final double min, max;
        
        DensityRange(double min, double max) {
            this.min = min;
            this.max = max;
        }
    }
    
    /**
     * Helper class for clue positions with priority
     */
    private static class CluePosition {
        final int row, col, value, priority;
        
        CluePosition(int row, int col, int value, int priority) {
            this.row = row;
            this.col = col;
            this.value = value;
            this.priority = priority;
        }
    }
}