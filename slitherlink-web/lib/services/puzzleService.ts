import { PuzzleData, PuzzleApiResponse } from '@/lib/types/game';
import { apiClient } from './apiClient';

export class PuzzleService {
  /**
   * Generate a new puzzle with specified parameters
   */
  static async generatePuzzle(
    gridSize: number, 
    difficulty: 'easy' | 'medium' | 'difficult'
  ): Promise<PuzzleData> {
    try {
      // 首先尝试从后端数据库获取现有题目
      const response = await apiClient.getPuzzle(difficulty, gridSize);
      if (response.success && response.data) {
        return this.parseBackendDatabaseResponse(response.data);
      }

      // 数据库没有题目时，调用后端生成新题目
      console.log('No puzzles available in database, generating new puzzle via backend');
      const generateResponse = await apiClient.generateTestPuzzle();
      if (generateResponse.success && generateResponse.data?.puzzle) {
        // 转换生成的题目为我们的格式
        const puzzleData = generateResponse.data.puzzle;
        return {
          id: `generated-${puzzleData.seed}`,
          gridSize: puzzleData.gridSize,
          difficulty: puzzleData.difficulty,
          clues: puzzleData.clues || this.createSamplePuzzle(gridSize, difficulty).clues,
          seed: puzzleData.seed,
        };
      }

      // 最后才fallback到本地示例题目
      console.warn('Backend puzzle generation failed, falling back to sample puzzle');
      return this.createSamplePuzzle(gridSize, difficulty);
      
    } catch (error) {
      console.error('Error getting puzzle from backend:', error);
      
      // 任何错误都fallback到示例题目
      return this.createSamplePuzzle(gridSize, difficulty);
    }
  }
  
  /**
   * Load a specific puzzle by seed (从数据库查找，不直接调用算法服务)
   */
  static async loadPuzzle(
    gridSize: number,
    difficulty: string,
    seed: string
  ): Promise<PuzzleData> {
    try {
      // 尝试从后端数据库通过种子查找题目
      const response = await apiClient.get(`/puzzle/by-seed/${seed}`);
      
      if (response.success && response.data) {
        return this.parseBackendDatabaseResponse(response.data);
      }
      
      console.warn(`Puzzle with seed ${seed} not found in database, falling back to sample puzzle`);
      return this.createSamplePuzzle(gridSize, difficulty as 'easy' | 'medium' | 'difficult');
    } catch (error) {
      console.error('Error loading puzzle by seed:', error);
      // 任何错误都返回示例题目
      return this.createSamplePuzzle(gridSize, difficulty as 'easy' | 'medium' | 'difficult');
    }
  }
  
  /**
   * Solve a puzzle (从数据库获取解答，不直接调用算法服务)
   */
  static async solvePuzzle(puzzle: PuzzleData): Promise<number[]> {
    try {
      // 如果题目已经有解答，直接返回
      if (puzzle.solution && puzzle.solution.length > 0) {
        return puzzle.solution;
      }
      
      // 尝试从后端获取解答
      const response = await apiClient.get(`/puzzle/${puzzle.id}/solution`);
      
      if (response.success && response.data && response.data.solution) {
        return response.data.solution;
      }
      
      console.warn('No solution available for puzzle, returning empty solution');
      // 返回空解答数组
      return new Array(puzzle.gridSize * puzzle.gridSize).fill(-1);
    } catch (error) {
      console.error('Error getting puzzle solution:', error);
      // 任何错误都返回空解答
      return new Array(puzzle.gridSize * puzzle.gridSize).fill(-1);
    }
  }
  
  /**
   * Parse the API response into our PuzzleData format
   */
  private static parseApiResponse(
    data: PuzzleApiResponse,
    gridSize: number,
    difficulty: 'easy' | 'medium' | 'difficult'
  ): PuzzleData {
    // Parse the count array (clues)
    const countArray: number[][] = JSON.parse(data.count);
    
    // Parse the solution pairs
    const solutionPairs: number[][] = JSON.parse(data.pairs);
    const solution = this.parseSolutionPairs(solutionPairs, gridSize);
    
    return {
      id: `puzzle-${data.seed}`,
      gridSize,
      difficulty,
      clues: countArray,
      solution,
      seed: data.seed,
    };
  }

  /**
   * Parse backend database response into our PuzzleData format
   */
  private static parseBackendDatabaseResponse(data: any): PuzzleData {
    const puzzleData = data.puzzle_data;
    
    // Extract clues from the count array
    const clues: (number | null)[][] = puzzleData.count.map((row: any[]) => 
      row.map((value: number) => value === -1 ? null : value)
    );
    
    // Extract solution from pairs if available
    let solution: number[] = [];
    if (puzzleData.pairs) {
      solution = this.parseSolutionPairs(puzzleData.pairs, data.grid_size);
    }
    
    return {
      id: data.id.toString(),
      gridSize: data.grid_size,
      difficulty: data.difficulty,
      clues,
      solution,
      seed: puzzleData.seed || data.puzzle_hash,
    };
  }

  /**
   * Parse backend API response into our PuzzleData format
   */
  private static parseBackendResponse(
    data: any,
    gridSize: number,
    difficulty: 'easy' | 'medium' | 'difficult'
  ): PuzzleData {
    // Backend test puzzle might have a different structure
    // For now, we'll try to adapt it or fall back to direct algorithm call
    if (data.puzzle) {
      return {
        id: data.puzzle.id || `backend-puzzle-${Date.now()}`,
        gridSize: data.puzzle.gridSize || gridSize,
        difficulty: data.puzzle.difficulty || difficulty,
        clues: data.puzzle.clues || [],
        solution: data.puzzle.solution || [],
        seed: data.puzzle.seed || `backend-${Date.now()}`,
      };
    }
    
    // If backend doesn't provide expected format, throw error to fall back
    throw new Error('Backend response format not supported');
  }
  
  /**
   * Parse solution pairs into adjacency list format
   */
  private static parseSolutionPairs(solutionPairs: number[][], gridSize: number): number[] {
    const solution = new Array(gridSize * gridSize).fill(-1);
    
    for (const [from, to] of solutionPairs) {
      solution[from] = to;
    }
    
    return solution;
  }
  
  /**
   * Create a sample puzzle for testing when API is not available
   */
  private static createSamplePuzzle(
    gridSize: number,
    difficulty: 'easy' | 'medium' | 'difficult'
  ): PuzzleData {
    const clues: (number | null)[][] = [];
    
    // Initialize with null values
    for (let i = 0; i < gridSize - 1; i++) {
      clues[i] = [];
      for (let j = 0; j < gridSize - 1; j++) {
        clues[i][j] = null;
      }
    }
    
    // Add some sample clues based on difficulty
    if (difficulty === 'easy') {
      if (gridSize >= 5) {
        clues[0][0] = 2;
        clues[0][gridSize - 2] = 1;
        clues[gridSize - 2][0] = 3;
        clues[gridSize - 2][gridSize - 2] = 2;
        clues[1][1] = 1;
        clues[1][2] = 2;
      }
    } else if (difficulty === 'medium') {
      if (gridSize >= 7) {
        clues[0][0] = 1;
        clues[2][1] = 3;
        clues[1][3] = 2;
        clues[3][2] = 1;
        clues[4][4] = 2;
      }
    } else { // difficult
      if (gridSize >= 10) {
        clues[1][1] = 2;
        clues[3][5] = 3;
        clues[5][3] = 1;
        clues[7][7] = 2;
      }
    }
    
    return {
      id: `sample-${difficulty}-${gridSize}`,
      gridSize,
      difficulty,
      clues,
      seed: `${gridSize}-${difficulty.charAt(0)}-${Date.now()}`,
    };
  }
  
  /**
   * Get daily challenge puzzle
   */
  static async getDailyChallenge(date?: string): Promise<PuzzleData> {
    try {
      // Use backend API to get daily challenge
      const endpoint = date ? `/daily-challenge/${date}` : '/daily-challenge/';
      const response = await apiClient.get(endpoint);
      
      if (response.success && response.data) {
        return this.parseBackendDatabaseResponse(response.data);
      }
    } catch (error) {
      console.error('Error fetching daily challenge from backend:', error);
    }

    // Fallback to old logic if backend is not available
    const today = date || new Date().toISOString().split('T')[0];
    const dayOfWeek = new Date(today).getDay();
    
    // Define difficulty schedule (as per PRD)
    const difficultySchedule = {
      0: { gridSize: 10, difficulty: 'difficult' as const }, // Sunday
      1: { gridSize: 5, difficulty: 'easy' as const },       // Monday
      2: { gridSize: 7, difficulty: 'medium' as const },     // Tuesday
      3: { gridSize: 10, difficulty: 'difficult' as const }, // Wednesday
      4: { gridSize: 7, difficulty: 'medium' as const },     // Thursday
      5: { gridSize: 12, difficulty: 'difficult' as const }, // Friday - Master
      6: { gridSize: 15, difficulty: 'difficult' as const }, // Saturday - Ninja
    };
    
    const { gridSize, difficulty } = difficultySchedule[dayOfWeek as keyof typeof difficultySchedule];
    
    console.warn('Falling back to generated puzzle for daily challenge');
    return await this.generatePuzzle(gridSize, difficulty);
  }
  
  /**
   * Validate a user solution against the correct solution
   */
  static validateUserSolution(
    userSolution: number[],
    correctSolution: number[]
  ): { isValid: boolean; errors: number[] } {
    const errors: number[] = [];
    
    for (let i = 0; i < userSolution.length; i++) {
      if (userSolution[i] !== -1 && userSolution[i] !== correctSolution[i]) {
        errors.push(i);
      }
    }
    
    const isValid = errors.length === 0 && 
                   userSolution.filter(x => x !== -1).length === 
                   correctSolution.filter(x => x !== -1).length;
    
    return { isValid, errors };
  }
}