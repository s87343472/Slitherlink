import * as Phaser from 'phaser';
import { PuzzleData } from '@/lib/types/game';

export class SlitherlinkGame extends Phaser.Scene {
  private puzzle: PuzzleData | null = null;
  private gridSize: number = 0;
  private cellSize: number = 60;
  private offsetX: number = 0;
  private offsetY: number = 0;
  
  // Game objects
  private gridDots: Phaser.GameObjects.Graphics[] = [];
  private clueTexts: Phaser.GameObjects.Text[] = [];
  private drawnLines: Map<string, Phaser.GameObjects.Graphics> = new Map();
  private blockedMarks: Map<string, Phaser.GameObjects.Text> = new Map();
  
  // Game state
  private playerSolution: Set<string> = new Set();
  private blockedEdges: Set<string> = new Set();
  private isShowingSolution: boolean = false;
  private solutionLines: Phaser.GameObjects.Graphics[] = [];
  
  // Touch/click state for long press detection
  private longPressTimer: Phaser.Time.TimerEvent | null = null;
  private isLongPress: boolean = false;
  private pointerDownTime: number = 0;
  private pointerDownPosition: { x: number, y: number } = { x: 0, y: 0 };
  
  // Colors
  private colors = {
    background: 0xf8fafc,
    gridDot: 0x64748b,
    clueText: 0x1e293b,
    drawnLine: 0x2563eb,
    correctLine: 0x16a34a,
    solutionLine: 0xef4444,
    completedCell: 0xdcfce7,
    conflictCell: 0xfecaca,
    blockedMark: 0x6b7280,
  };

  constructor() {
    super({ key: 'SlitherlinkGame' });
  }

  preload() {
    // Create simple colored rectangles for UI elements
    this.load.image('pixel', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
  }

  create() {
    // Set background color
    this.cameras.main.setBackgroundColor(this.colors.background);
    
    // Configure input for better mobile support
    this.input.setPollAlways();
    this.input.mouse.disableContextMenu();
    
    // Enable input events
    this.input.on('pointerdown', this.handlePointerDown, this);
    this.input.on('pointerup', this.handlePointerUp, this);
    
    // Add additional mobile-friendly events
    this.input.on('pointermove', this.handlePointerMove, this);
    
    // Set up touch-specific configurations
    if (this.input.touch) {
      this.input.touch.capture = true;
    }
    
    // Add debug information for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Phaser Scene created with input system ready');
      console.log('Scale manager mode:', this.scale.scaleMode);
      console.log('Game size:', this.game.config.width, 'x', this.game.config.height);
      console.log('Canvas size:', this.game.canvas.width, 'x', this.game.canvas.height);
    }
  }

  public loadPuzzle(puzzle: PuzzleData) {
    this.puzzle = puzzle;
    this.gridSize = puzzle.gridSize;
    this.playerSolution.clear();
    this.blockedEdges.clear();
    this.isShowingSolution = false;
    
    // Calculate layout
    this.calculateLayout();
    
    // Clear existing objects
    this.clearGameObjects();
    
    // Draw the game
    this.drawGrid();
    this.drawClues();
  }

  private calculateLayout() {
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    
    // Calculate cell size to fit the screen with better padding
    const maxGridPixelSize = Math.min(gameWidth * 0.85, gameHeight * 0.85);
    this.cellSize = Math.max(40, Math.floor(maxGridPixelSize / this.gridSize)); // Minimum 40px per cell
    
    // Center the grid
    const gridPixelSize = (this.gridSize - 1) * this.cellSize;
    this.offsetX = (gameWidth - gridPixelSize) / 2;
    this.offsetY = (gameHeight - gridPixelSize) / 2;
  }

  private clearGameObjects() {
    // Clear previous game objects
    this.gridDots.forEach(dot => dot.destroy());
    this.gridDots = [];
    
    this.clueTexts.forEach(text => text.destroy());
    this.clueTexts = [];
    
    this.drawnLines.forEach(line => line.destroy());
    this.drawnLines.clear();
    
    this.blockedMarks.forEach(mark => mark.destroy());
    this.blockedMarks.clear();
    
    this.clearSolutionDisplay();
  }

  private drawGrid() {
    if (!this.puzzle) return;

    // Draw grid dots
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const x = this.offsetX + col * this.cellSize;
        const y = this.offsetY + row * this.cellSize;
        
        const dot = this.add.graphics();
        dot.fillStyle(this.colors.gridDot);
        dot.fillCircle(x, y, 4);
        this.gridDots.push(dot);
      }
    }
  }

  private drawClues() {
    if (!this.puzzle) return;

    const clues = this.puzzle.clues;
    for (let row = 0; row < clues.length; row++) {
      for (let col = 0; col < clues[row].length; col++) {
        const clue = clues[row][col];
        if (clue !== null && clue !== -1) {
          const x = this.offsetX + (col + 0.5) * this.cellSize;
          const y = this.offsetY + (row + 0.5) * this.cellSize;
          
          // Make font size more responsive and ensure good contrast
          const fontSize = Math.max(16, Math.floor(this.cellSize * 0.35));
          
          const text = this.add.text(x, y, clue.toString(), {
            fontSize: `${fontSize}px`,
            color: '#000000', // Changed to black for better readability
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold', // Make numbers bold
            stroke: '#ffffff', // Add white outline for better contrast
            strokeThickness: 1,
          });
          text.setOrigin(0.5);
          this.clueTexts.push(text);
        }
      }
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (!this.puzzle) return;

    // Store pointer down information for long press detection
    this.pointerDownTime = this.time.now;
    this.pointerDownPosition = { x: pointer.x, y: pointer.y };
    this.isLongPress = false;
    
    // Cancel any existing long press timer
    if (this.longPressTimer) {
      this.longPressTimer.destroy();
    }
    
    // Get transformed coordinates for better touch accuracy
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const x = worldPoint.x;
    const y = worldPoint.y;
    
    // Debug logging for mobile testing
    console.log(`Touch at screen: (${pointer.x}, ${pointer.y}), world: (${x}, ${y}), offset: (${this.offsetX}, ${this.offsetY}), cellSize: ${this.cellSize}`);
    
    const edgeInfo = this.getEdgeFromCoordinates(x, y);
    
    if (edgeInfo) {
      console.log(`Hit edge: ${edgeInfo.id}`);
      
      // Set up long press timer for mobile blocking
      this.longPressTimer = this.time.delayedCall(600, () => {
        this.isLongPress = true;
        console.log(`Long press detected on edge: ${edgeInfo.id}`);
        this.toggleBlockedEdge(edgeInfo.id);
        this.updateGameState();
        
        // Add haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      });
      
      // Store edge info for potential use in pointer up
      (this as any).pendingEdge = edgeInfo;
      
    } else {
      console.log(`No edge found at (${x}, ${y})`);
    }
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer) {
    const duration = this.time.now - this.pointerDownTime;
    const pendingEdge = (this as any).pendingEdge;
    
    // Cancel long press timer if still active
    if (this.longPressTimer) {
      this.longPressTimer.destroy();
      this.longPressTimer = null;
    }
    
    console.log(`Pointer up after ${duration}ms, isLongPress: ${this.isLongPress}`);
    
    // Only handle short taps if it wasn't a long press
    if (!this.isLongPress && pendingEdge && duration < 600) {
      // Check for right click (desktop) or handle as normal tap
      if (pointer.rightButtonDown()) {
        // Right click - toggle blocked edge
        this.toggleBlockedEdge(pendingEdge.id);
      } else {
        // Normal tap - toggle drawn line
        this.toggleDrawnLine(pendingEdge.id, pendingEdge);
      }
      
      this.updateGameState();
    }
    
    // Clean up
    (this as any).pendingEdge = null;
    this.isLongPress = false;
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    // Optional: Add visual feedback for pointer movement if needed
    // This can be useful for debugging touch tracking
    if (process.env.NODE_ENV === 'development' && pointer.isDown) {
      console.log(`Pointer moving at: (${pointer.x}, ${pointer.y})`);
    }
  }

  private getEdgeFromCoordinates(x: number, y: number): { id: string, x1: number, y1: number, x2: number, y2: number, isHorizontal: boolean } | null {
    // Dynamic tolerance based on cell size for better mobile experience
    const baseTolerance = Math.max(15, this.cellSize * 0.3);
    const horizontalTolerance = baseTolerance;
    const verticalTolerance = baseTolerance;
    
    console.log(`Looking for edge at (${x}, ${y}) with tolerance ${baseTolerance}`);
    
    let bestMatch = null;
    let minDistance = Infinity;
    
    // Check horizontal edges with improved detection
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize - 1; col++) {
        const x1 = this.offsetX + col * this.cellSize;
        const y1 = this.offsetY + row * this.cellSize;
        const x2 = this.offsetX + (col + 1) * this.cellSize;
        const y2 = y1;
        
        // Check if click is within horizontal line bounds
        const withinX = x >= x1 - horizontalTolerance && x <= x2 + horizontalTolerance;
        const withinY = Math.abs(y - y1) <= horizontalTolerance;
        
        if (withinX && withinY) {
          // Calculate distance to line for prioritization
          const distance = Math.abs(y - y1);
          const edgeInfo = {
            id: `h-${row}-${col}`,
            x1, y1, x2, y2,
            isHorizontal: true
          };
          
          if (distance < minDistance) {
            minDistance = distance;
            bestMatch = edgeInfo;
            console.log(`Found horizontal edge candidate: ${edgeInfo.id} at distance ${distance}`);
          }
        }
      }
    }
    
    // Check vertical edges with improved detection
    for (let row = 0; row < this.gridSize - 1; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const x1 = this.offsetX + col * this.cellSize;
        const y1 = this.offsetY + row * this.cellSize;
        const x2 = x1;
        const y2 = this.offsetY + (row + 1) * this.cellSize;
        
        // Check if click is within vertical line bounds
        const withinY = y >= y1 - verticalTolerance && y <= y2 + verticalTolerance;
        const withinX = Math.abs(x - x1) <= verticalTolerance;
        
        if (withinX && withinY) {
          // Calculate distance to line for prioritization
          const distance = Math.abs(x - x1);
          const edgeInfo = {
            id: `v-${row}-${col}`,
            x1, y1, x2, y2,
            isHorizontal: false
          };
          
          if (distance < minDistance) {
            minDistance = distance;
            bestMatch = edgeInfo;
            console.log(`Found vertical edge candidate: ${edgeInfo.id} at distance ${distance}`);
          }
        }
      }
    }
    
    if (bestMatch) {
      console.log(`Selected best match: ${bestMatch.id} at distance ${minDistance}`);
    }
    
    return bestMatch;
  }

  private toggleDrawnLine(edgeId: string, edgeInfo: any) {
    if (this.blockedEdges.has(edgeId)) {
      // Remove blocked status first
      this.blockedEdges.delete(edgeId);
      const blockedMark = this.blockedMarks.get(edgeId);
      if (blockedMark) {
        blockedMark.destroy();
        this.blockedMarks.delete(edgeId);
      }
    }

    if (this.playerSolution.has(edgeId)) {
      // Remove existing line
      this.playerSolution.delete(edgeId);
      const line = this.drawnLines.get(edgeId);
      if (line) {
        line.destroy();
        this.drawnLines.delete(edgeId);
      }
    } else {
      // Add new line
      this.playerSolution.add(edgeId);
      this.drawPlayerLine(edgeId, edgeInfo);
    }
  }

  private toggleBlockedEdge(edgeId: string) {
    if (this.playerSolution.has(edgeId)) {
      // Remove drawn line first
      this.playerSolution.delete(edgeId);
      const line = this.drawnLines.get(edgeId);
      if (line) {
        line.destroy();
        this.drawnLines.delete(edgeId);
      }
    }

    if (this.blockedEdges.has(edgeId)) {
      // Remove blocked mark
      this.blockedEdges.delete(edgeId);
      const mark = this.blockedMarks.get(edgeId);
      if (mark) {
        mark.destroy();
        this.blockedMarks.delete(edgeId);
      }
    } else {
      // Add blocked mark
      this.blockedEdges.add(edgeId);
      this.drawBlockedMark(edgeId);
    }
  }

  private drawPlayerLine(edgeId: string, edgeInfo: any) {
    const line = this.add.graphics();
    line.lineStyle(4, this.colors.drawnLine);
    line.beginPath();
    line.moveTo(edgeInfo.x1, edgeInfo.y1);
    line.lineTo(edgeInfo.x2, edgeInfo.y2);
    line.strokePath();
    
    this.drawnLines.set(edgeId, line);
  }

  private drawBlockedMark(edgeId: string) {
    const edgeInfo = this.getEdgeInfoById(edgeId);
    if (!edgeInfo) return;

    const midX = (edgeInfo.x1 + edgeInfo.x2) / 2;
    const midY = (edgeInfo.y1 + edgeInfo.y2) / 2;
    
    const mark = this.add.text(midX, midY, '×', {
      fontSize: `${Math.floor(this.cellSize * 0.3)}px`,
      color: '#6b7280',
      fontFamily: 'Arial',
    });
    mark.setOrigin(0.5);
    
    this.blockedMarks.set(edgeId, mark);
  }

  private getEdgeInfoById(edgeId: string): { x1: number, y1: number, x2: number, y2: number } | null {
    const [type, row, col] = edgeId.split('-');
    const r = parseInt(row);
    const c = parseInt(col);

    if (type === 'h') {
      // Horizontal edge
      return {
        x1: this.offsetX + c * this.cellSize,
        y1: this.offsetY + r * this.cellSize,
        x2: this.offsetX + (c + 1) * this.cellSize,
        y2: this.offsetY + r * this.cellSize,
      };
    } else if (type === 'v') {
      // Vertical edge
      return {
        x1: this.offsetX + c * this.cellSize,
        y1: this.offsetY + r * this.cellSize,
        x2: this.offsetX + c * this.cellSize,
        y2: this.offsetY + (r + 1) * this.cellSize,
      };
    }

    return null;
  }

  private updateGameState() {
    // Check for errors first
    this.checkForErrors();
    
    // Check if puzzle is completed
    if (this.checkPuzzleCompletion()) {
      this.onPuzzleCompleted();
    }
    
    // Update cell status based on current lines
    this.updateCellStatus();
  }

  private checkForErrors() {
    if (!this.puzzle) return;

    // Check if any clue has too many connections
    const clues = this.puzzle.clues;
    for (let row = 0; row < clues.length; row++) {
      for (let col = 0; col < clues[row].length; col++) {
        const clue = clues[row][col];
        if (clue !== null && clue !== -1) {
          const connectedLines = this.getConnectedLinesForCell(row, col);
          if (connectedLines > clue) {
            // User has drawn too many lines for this clue - count as error
            if (typeof window !== 'undefined' && (window as any).gameStoreActions) {
              (window as any).gameStoreActions.addError();
            }
            return; // Only count one error per move
          }
        }
      }
    }
  }

  public checkPuzzleCompletion(): boolean {
    if (!this.puzzle) return false;

    // Simple completion check - verify all clues are satisfied
    const clues = this.puzzle.clues;
    for (let row = 0; row < clues.length; row++) {
      for (let col = 0; col < clues[row].length; col++) {
        const clue = clues[row][col];
        if (clue !== null && clue !== -1) {
          const connectedLines = this.getConnectedLinesForCell(row, col);
          if (connectedLines !== clue) {
            return false;
          }
        }
      }
    }

    return true;
  }

  private getConnectedLinesForCell(row: number, col: number): number {
    let count = 0;
    
    // Check four edges around the cell
    const edges = [
      `h-${row}-${col}`,        // top
      `h-${row + 1}-${col}`,    // bottom
      `v-${row}-${col}`,        // left
      `v-${row}-${col + 1}`,    // right
    ];
    
    edges.forEach(edgeId => {
      if (this.playerSolution.has(edgeId)) {
        count++;
      }
    });
    
    return count;
  }

  private updateCellStatus() {
    if (!this.puzzle) return;

    // Update visual feedback for cells and their numbers
    const clues = this.puzzle.clues;
    for (let row = 0; row < clues.length; row++) {
      for (let col = 0; col < clues[row].length; col++) {
        const clue = clues[row][col];
        if (clue !== null && clue !== -1) {
          const connectedLines = this.getConnectedLinesForCell(row, col);
          const textIndex = this.getCellTextIndex(row, col);
          
          if (textIndex >= 0 && textIndex < this.clueTexts.length) {
            const text = this.clueTexts[textIndex];
            
            if (connectedLines === clue) {
              // Correct number of lines - bright green
              text.setColor('#059669');
              text.setStroke('#ffffff', 2);
            } else if (connectedLines > clue) {
              // Too many lines - bright red
              text.setColor('#dc2626');
              text.setStroke('#ffffff', 2);
            } else {
              // Not enough lines yet - black with white outline
              text.setColor('#000000');
              text.setStroke('#ffffff', 1);
            }
          }
        }
      }
    }
    
    // Update line colors based on correctness
    this.updateLineColors();
  }

  private getCellTextIndex(row: number, col: number): number {
    // Calculate the index of the text object for this cell
    let index = 0;
    const clues = this.puzzle?.clues;
    if (!clues) return -1;
    
    for (let r = 0; r < clues.length; r++) {
      for (let c = 0; c < clues[r].length; c++) {
        if (r === row && c === col) {
          return index;
        }
        const clue = clues[r][c];
        if (clue !== null && clue !== -1) {
          index++;
        }
      }
    }
    return -1;
  }

  private updateLineColors() {
    // Check each drawn line and update its color based on whether it's part of the correct solution
    this.drawnLines.forEach((line, edgeId) => {
      const isCorrect = this.isLineInCorrectSolution(edgeId);
      
      // Destroy the old line and redraw with new color
      const edgeInfo = this.getEdgeInfoById(edgeId);
      if (edgeInfo) {
        line.destroy();
        
        const newLine = this.add.graphics();
        const color = isCorrect ? this.colors.correctLine : this.colors.drawnLine;
        newLine.lineStyle(4, color);
        newLine.beginPath();
        newLine.moveTo(edgeInfo.x1, edgeInfo.y1);
        newLine.lineTo(edgeInfo.x2, edgeInfo.y2);
        newLine.strokePath();
        
        this.drawnLines.set(edgeId, newLine);
      }
    });
  }

  private isLineInCorrectSolution(edgeId: string): boolean {
    if (!this.puzzle?.solution) return false;
    
    // Parse the edge ID to get the nodes it connects
    const [type, row, col] = edgeId.split('-');
    const r = parseInt(row);
    const c = parseInt(col);
    
    let node1, node2;
    const gridSize = this.puzzle.gridSize;
    
    if (type === 'h') {
      // Horizontal edge connects (r, c) to (r, c+1)
      node1 = r * gridSize + c;
      node2 = r * gridSize + (c + 1);
    } else if (type === 'v') {
      // Vertical edge connects (r, c) to (r+1, c)
      node1 = r * gridSize + c;
      node2 = (r + 1) * gridSize + c;
    } else {
      return false;
    }
    
    // Check if this connection exists in the solution
    const solution = this.puzzle.solution;
    return (solution[node1] === node2 || solution[node2] === node1);
  }

  public onPuzzleCompleted() {
    // Emit completion event or call callback
    console.log('Puzzle completed!');
    
    // Update React state through the global store
    if (typeof window !== 'undefined' && (window as any).gameStoreActions) {
      (window as any).gameStoreActions.completeGame();
    }
    
    // You can emit custom events here for the React components to handle
    this.events.emit('puzzleCompleted', {
      time: Date.now(),
      moves: this.playerSolution.size,
    });
  }

  public showSolution() {
    if (!this.puzzle) {
      console.log('No puzzle loaded');
      return;
    }
    
    if (!this.puzzle.solution) {
      console.log('No solution available for puzzle');
      return;
    }

    console.log('Showing solution with', this.puzzle.solution.length, 'nodes');
    this.isShowingSolution = true;
    this.clearSolutionDisplay();

    // Parse solution and draw solution lines
    const solution = this.puzzle.solution;
    let linesDrawn = 0;
    const drawnEdges = new Set<string>(); // Avoid drawing the same edge twice
    
    for (let i = 0; i < solution.length; i++) {
      const next = solution[i];
      if (next !== -1 && next !== i) {
        // This represents a connection in the adjacency list
        const edgeId = this.getEdgeIdFromNodes(i, next);
        if (edgeId && !drawnEdges.has(edgeId)) {
          this.drawSolutionLine(edgeId);
          drawnEdges.add(edgeId);
          linesDrawn++;
        }
      }
    }
    
    console.log('Drew', linesDrawn, 'solution lines', 'from solution array length:', solution.length);
  }

  public hideSolution() {
    this.isShowingSolution = false;
    this.clearSolutionDisplay();
  }

  private clearSolutionDisplay() {
    this.solutionLines.forEach(line => line.destroy());
    this.solutionLines = [];
  }

  private drawSolutionLine(edgeId: string) {
    const edgeInfo = this.getEdgeInfoById(edgeId);
    if (!edgeInfo) {
      console.log('No edge info found for:', edgeId);
      return;
    }

    console.log('Drawing solution line for edge:', edgeId, 'from', edgeInfo.x1, edgeInfo.y1, 'to', edgeInfo.x2, edgeInfo.y2);
    
    const line = this.add.graphics();
    line.lineStyle(8, this.colors.solutionLine, 0.9); // Thicker and more opaque
    line.beginPath();
    line.moveTo(edgeInfo.x1, edgeInfo.y1);
    line.lineTo(edgeInfo.x2, edgeInfo.y2);
    line.strokePath();
    
    this.solutionLines.push(line);
  }

  private getEdgeIdFromNodes(node1: number, node2: number): string | null {
    if (!this.puzzle) return null;

    const gridSize = this.puzzle.gridSize;
    
    // Convert node indices to grid coordinates
    const row1 = Math.floor(node1 / gridSize);
    const col1 = node1 % gridSize;
    const row2 = Math.floor(node2 / gridSize);
    const col2 = node2 % gridSize;
    
    // Determine if this is horizontal or vertical edge
    if (row1 === row2 && Math.abs(col1 - col2) === 1) {
      // Horizontal edge
      const minCol = Math.min(col1, col2);
      return `h-${row1}-${minCol}`;
    } else if (col1 === col2 && Math.abs(row1 - row2) === 1) {
      // Vertical edge
      const minRow = Math.min(row1, row2);
      return `v-${minRow}-${col1}`;
    }
    return null;
  }

  public resetPuzzle() {
    this.playerSolution.clear();
    this.blockedEdges.clear();
    this.hideSolution();
    
    // Clear all drawn lines and blocked marks
    this.drawnLines.forEach(line => line.destroy());
    this.drawnLines.clear();
    
    this.blockedMarks.forEach(mark => mark.destroy());
    this.blockedMarks.clear();
  }

  public getPlayerSolution(): string[] {
    return Array.from(this.playerSolution);
  }

  public getBlockedEdges(): string[] {
    return Array.from(this.blockedEdges);
  }
}