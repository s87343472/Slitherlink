package com.puzzle.core;

import org.chocosolver.solver.Model;
import org.chocosolver.solver.Solver;
import org.chocosolver.solver.constraints.extension.Tuples;
import org.chocosolver.solver.search.strategy.Search;
import org.chocosolver.solver.variables.IntVar;
import org.chocosolver.util.tools.ArrayUtils;

import java.util.ArrayList;
import java.util.Random;

public class SLGen {
	private int n; // puzzle dimension
	private int m; // sub-tour ubound
	private int l; // sub-tour lbound

	private Model model;
	private Solver solver;

	private Random rand; // random number generator
	private long seed; // gen specific puzzle
	private String diff; // puzzle difficulty specified

	private int[][] count; // edge reqs
	private IntVar[][] a; // adjacency matrix
	private IntVar[][] v; // vertex matrix
	private IntVar[] tour; // sub-tour array
	private boolean trace;

	public SLGen(int n, String diff, long seed, Boolean trace) {
		this(n, diff, trace);
		this.seed = seed;
		rand = new Random(seed);

	}

	public SLGen(int n, String diff, Boolean trace) {
		this.trace = trace;
		seed = System.currentTimeMillis();
		this.diff = diff;

		rand = new Random(seed);
		model = new Model("SL Solver");
		solver = model.getSolver();
		this.n = n;
		m = n * n;
		l = (3 * m) / 4;
		a = new IntVar[n * n][n * n];
		v = new IntVar[n][n];
		count = new int[n - 1][n - 1];

		// create node grid
		// define domains
		for (int i = 0; i < n; i++) {
			for (int j = 0; j < n; j++) {
				ArrayList<Integer> dom = new ArrayList<>();
				if (i > 0)
					dom.add((i - 1) * n + j); // above
				if (j > 0)
					dom.add(i * n + j - 1); // left
				dom.add(i * n + j); // itself
				if (j < n - 1)
					dom.add(i * n + j + 1);// right
				if (i < n - 1)
					dom.add((i + 1) * n + j);// below

				int[] domain = new int[dom.size()];
				int k = 0;
				for (int x : dom) {
					domain[k++] = x;
				}
				v[i][j] = model.intVar("v[" + i + "]" + "[" + j + "]", domain);
			}
		}

		// subtour constraint
		IntVar tourLength = model.intVar("tour length", l, m);
		tour = ArrayUtils.flatten(v);

		model.subCircuit(tour, 0, tourLength).post();

		// Link tour with adjacency matrix
		for (int i = 0; i < n * n; i++) {
			int ub = tour[i].getUB();
			for (int j = tour[i].getLB(); j <= ub; j = tour[i].nextValue(j))
				if (i != j) {
					a[i][j] = model.intVar("A[" + i + "][" + j + "]", 0, 1);
					model.ifOnlyIf(model.arithm(a[i][j], "=", 1), model.arithm(tour[i], "=", j));
					// efficient search
					model.ifThen(model.arithm(tour[i], "=", j), model.arithm(tour[j], "!=", i));
				}
		}

		// fill count matrix
		for (int i = 0; i < n - 1; i++) {
			for (int j = 0; j < n - 1; j++) {
				count[i][j] = -1;
			}
		}

	}

	/**
	 * Returns the seed of the generated instance
	 * 
	 * @return seed
	 */
	public long getSeed() {
		return seed;
	}

	/**
	 * Returns the difficulty of the generated instance
	 * 
	 * @return difficulty
	 */
	public String getDiff() {
		return diff;
	}

	/**
	 * Private method to set the count of generator before using the generator solve
	 * method
	 * 
	 * @param count
	 */
	private void setCount(int[][] count) {
		this.count = count;
		// constrain square edges
		for (int i = 0; i < n - 1; i++) {
			for (int j = 0; j < n - 1; j++) {
				if (count[i][j] > -1) {
					IntVar[] e = new IntVar[] { a[(i * n) + j][(i * n) + j + 1], // top
							a[(i * n) + j + 1][(i * n) + j], // top

							a[(i * n) + j + n][(i * n) + j + n + 1], // bottom
							a[(i * n) + j + n + 1][(i * n) + j + n], // bottom

							a[(i * n) + j][(i * n) + j + n], // left
							a[(i * n) + j + n][(i * n) + j], // left

							a[(i * n) + j + 1][(i * n) + j + n + 1], // right
							a[(i * n) + j + n + 1][(i * n) + j + 1] // right
					};
					model.sum(e, "=", count[i][j]).post();
				}

			}
		}

	}

	/**
	 * method to generate a puzzle
	 * 
	 * @return
	 */
	public int[][] generate() {
		int[][] randCount = new int[n - 1][n - 1];
		for (int i = 0; i < n - 1; i++) {
			for (int j = 0; j < n - 1; j++) {
				randCount[i][j] = -1;
			}
		}
		int solNum = 3;
		SLGen newGen = null;
		// randomly initialise the count grid

		for (int i = 0; i < n - 1; i++) {
			int a = rand.nextInt(n - 1);
			int b = rand.nextInt(n - 1);
			randCount[a][b] = rand.nextInt(4);
		}
		for (int i = 0; i < n - 1; i++) {
			for (int j = 0; j < n - 1; j++) {

				System.out.print(randCount[i][j] + " ");
			}
			System.out.println();
		}
		int mulFullLoop = 0;
		while (solNum != 2) {
			mulFullLoop++;
			newGen = new SLGen(n, diff, false);
			newGen.setCount(randCount);
			solNum = newGen.solve();

			if (solNum == 0 || mulFullLoop > 2) {
				for (int i = 0; i < n - 1; i++) {
					for (int j = 0; j < n - 1; j++) {
						randCount[i][j] = -1;
					}
				}
				for (int i = 0; i < n - 1; i++) {
					int a = rand.nextInt(n - 1);
					int b = rand.nextInt(n - 1);
					randCount[a][b] = rand.nextInt(4);

				}
				mulFullLoop = 0;
			}
			if (trace) {
				System.out.print("\n---------------------------\n" + "The number of solutions is " + solNum
						+ "\n---------------------------\n");
				for (int i = 0; i < n - 1; i++) {
					for (int j = 0; j < n - 1; j++) {

						System.out.print(randCount[i][j] + " ");
					}
					System.out.println();
				}
				System.out.print("\n--------------------------------\n");

			}

		}
		return reducePuzzle(diff, newGen.getCount());

	}

	private int[][] getCount() {
		return count;
	}

	/**
	 * generator solve method
	 * 
	 * @return number of solutions
	 */
	private int solve() {
		int[][] fullCount = new int[0][];
		solver.setSearch(Search.minDomLBSearch(tour)); // fail-first
		solver.limitSolution(3);
		solver.limitTime("5 s");
		int numSol = 0;
		while (solver.solve()) {
			fullCount = getFullCount();
			numSol++;
		}
		solver.printShortStatistics();
		count = fullCount;
		return numSol;
	}

	/**
	 * Fill all faces in the grid with edge numbers
	 * 
	 * @return count matrix
	 */
	private int[][] getFullCount() {
		for (int i = 0; i < n - 1; i++) {
			for (int j = 0; j < n - 1; j++) {

				int e = a[(i * n) + j][(i * n) + j + 1].getValue() + a[(i * n) + j + 1][(i * n) + j].getValue() +

						a[(i * n) + j + n][(i * n) + j + n + 1].getValue()
						+ a[(i * n) + j + n + 1][(i * n) + j + n].getValue() +

						a[(i * n) + j][(i * n) + j + n].getValue() + a[(i * n) + j + n][(i * n) + j].getValue() +

						a[(i * n) + j + 1][(i * n) + j + n + 1].getValue()
						+ a[(i * n) + j + n + 1][(i * n) + j + 1].getValue();

				count[i][j] = e;
			}

		}
		return count;
	}

	/**
	 * Further reduce number of provided clues
	 * 
	 * @param oldCount
	 * @return count matrix
	 */
	protected int[][] clueReduction(int[][] oldCount) {
		int clueCount = 0;
		int tryCount = 0;
		for (int i = 0; i < n - 1; i++) {
			for (int j = 0; j < n - 1; j++) {
				if (oldCount[i][j] != -1) {
					clueCount++;
					System.out.println("clueCount is " + clueCount);
				}
			}
		}
		while (clueCount > (((n - 1) * (n - 1)) / 2) && tryCount < 20) {
			System.out.println("Reducing clue count");
			System.out.println(clueCount);
			int val1 = rand.nextInt(n - 1);
			int val2 = rand.nextInt(n - 1);
			int temp = oldCount[val1][val2];
			oldCount[val1][val2] = -1;
			SLSolve sl2 = new SLSolve(n, oldCount, false);
			int[] ans2 = sl2.genSolutions(3);
			int num2 = ans2[0];
			int size2 = ans2[1];

			if (num2 != 2 || size2 < l) {
				System.out.println("The number of solutions is " + num2);
				oldCount[val1][val2] = temp;

			}
			clueCount = 0;
			for (int i = 0; i < n - 1; i++) {
				for (int j = 0; j < n - 1; j++) {
					if (oldCount[i][j] != -1) {
						clueCount++;
						// System.out.println("clueCount is "+clueCount);
					}
				}
			}
			tryCount++;
		}
		return oldCount;
	}

	/**
	 * Reduce clue count according to difficulty with proper density control
	 * 
	 * @param diff
	 * @param oldCount
	 * @return count matrix
	 */
	protected int[][] reducePuzzle(String diff, int[][] oldCount) {
		// Apply improved density control
		return reducePuzzleWithDensityControl(diff, oldCount);
	}
	
	/**
	 * Improved puzzle reduction with proper density control
	 * 
	 * @param diff difficulty level
	 * @param oldCount complete puzzle with all clues
	 * @return puzzle with appropriate clue density
	 */
	private int[][] reducePuzzleWithDensityControl(String diff, int[][] oldCount) {
		int totalCells = (n - 1) * (n - 1);
		
		// Define target density ranges based on difficulty and grid size
		DensityRange targetRange = getTargetDensityRange(n, diff);
		int minClues = (int) Math.ceil(totalCells * targetRange.min);
		int maxClues = (int) Math.floor(totalCells * targetRange.max);
		
		System.out.println(String.format("Grid: %dx%d, Difficulty: %s, Target: %d-%d clues (%.1f%%-%.1f%%)", 
			n, n, diff, minClues, maxClues, targetRange.min*100, targetRange.max*100));
		
		// Count current clues
		int currentClues = countNonEmptyClues(oldCount);
		System.out.println("Starting with " + currentClues + " clues");
		
		if (currentClues <= maxClues) {
			System.out.println("Already within target range");
			return currentClues >= minClues ? oldCount : fallbackToOriginal(diff, oldCount);
		}
		
		// Strategic reduction to reach target density
		return strategicClueReduction(oldCount, minClues, maxClues, diff);
	}
	
	/**
	 * Define target density ranges based on grid size and difficulty
	 */
	private DensityRange getTargetDensityRange(int gridSize, String difficulty) {
		if (gridSize <= 7) {
			// Small grids need higher density for solvability
			switch (difficulty.toLowerCase()) {
				case "easy": return new DensityRange(0.45, 0.65);
				case "medium": return new DensityRange(0.35, 0.50);
				case "difficult": return new DensityRange(0.25, 0.40);
				default: return new DensityRange(0.35, 0.50);
			}
		} else if (gridSize <= 10) {
			// Standard 10x10 grid density
			switch (difficulty.toLowerCase()) {
				case "easy": return new DensityRange(0.35, 0.50);
				case "medium": return new DensityRange(0.25, 0.35);
				case "difficult": return new DensityRange(0.15, 0.25);
				default: return new DensityRange(0.25, 0.35);
			}
		} else {
			// Large grids can work with lower density
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
	private int[][] strategicClueReduction(int[][] puzzle, int minClues, int maxClues, String difficulty) {
		int[][] working = new int[n-1][n-1];
		// Copy original puzzle
		for (int i = 0; i < n-1; i++) {
			for (int j = 0; j < n-1; j++) {
				working[i][j] = puzzle[i][j];
			}
		}
		
		// Create ordered list of clues to potentially remove
		ArrayList<ClueCandidate> candidates = new ArrayList<>();
		
		for (int i = 0; i < n-1; i++) {
			for (int j = 0; j < n-1; j++) {
				if (working[i][j] != -1) {
					int priority = calculateRemovalPriority(i, j, working[i][j], difficulty);
					candidates.add(new ClueCandidate(i, j, working[i][j], priority));
				}
			}
		}
		
		// Sort by removal priority (higher = remove first)
		candidates.sort((a, b) -> Integer.compare(b.priority, a.priority));
		
		// Remove clues until we reach target range
		int currentClues = countNonEmptyClues(working);
		
		for (ClueCandidate candidate : candidates) {
			if (currentClues <= maxClues) break;
			
			// Try removing this clue
			int originalValue = working[candidate.row][candidate.col];
			working[candidate.row][candidate.col] = -1;
			
			// Verify puzzle still solvable
			if (validatePuzzleSolvability(working)) {
				currentClues--;
				System.out.println("Removed clue at (" + candidate.row + "," + candidate.col + 
					"), remaining: " + currentClues);
			} else {
				// Restore the clue
				working[candidate.row][candidate.col] = originalValue;
			}
		}
		
		int finalClues = countNonEmptyClues(working);
		System.out.println(String.format("Final puzzle: %d clues (%.1f%% density)", 
			finalClues, (finalClues * 100.0) / ((n-1) * (n-1))));
		
		return working;
	}
	
	/**
	 * Calculate removal priority for a clue position
	 */
	private int calculateRemovalPriority(int row, int col, int clueValue, String difficulty) {
		int priority = 0;
		
		// Distance from center - center clues are more important
		int centerRow = (n-1) / 2;
		int centerCol = (n-1) / 2;
		int distanceFromCenter = Math.abs(row - centerRow) + Math.abs(col - centerCol);
		priority += distanceFromCenter;
		
		// Clue value importance
		switch (clueValue) {
			case 0: priority += 3; break; // 0s are often redundant
			case 3: priority += 3; break; // 3s are often redundant
			case 1: priority += 1; break; // 1s are useful
			case 2: priority -= 1; break; // 2s are often crucial
		}
		
		// Corner and edge handling based on difficulty
		boolean isCorner = (row == 0 || row == n-2) && (col == 0 || col == n-2);
		boolean isEdge = (row == 0 || row == n-2 || col == 0 || col == n-2);
		
		if ("difficult".equals(difficulty)) {
			if (isCorner) priority += 5; // Remove corners first in hard puzzles
		} else {
			if (isCorner) priority -= 3; // Keep corners in easier puzzles
		}
		
		return priority;
	}
	
	/**
	 * Validate that puzzle still has exactly one solution
	 */
	private boolean validatePuzzleSolvability(int[][] puzzle) {
		try {
			SLSolve solver = new SLSolve(n, puzzle, false);
			int[] result = solver.genSolutions(3);
			return result[0] == 2; // Should have exactly 2 solutions (forward and reverse)
		} catch (Exception e) {
			return false;
		}
	}
	
	/**
	 * Count non-empty clues
	 */
	private int countNonEmptyClues(int[][] puzzle) {
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
	 * Fallback to original algorithm if improved version fails
	 */
	private int[][] fallbackToOriginal(String diff, int[][] oldCount) {
		System.out.println("Falling back to original algorithm for " + diff + " difficulty");
		return clueReduction(oldCount);
	}

	// Helper classes for improved density control
	private static class DensityRange {
		final double min, max;
		
		DensityRange(double min, double max) {
			this.min = min;
			this.max = max;
		}
	}
	
	private static class ClueCandidate {
		final int row, col, value, priority;
		
		ClueCandidate(int row, int col, int value, int priority) {
			this.row = row;
			this.col = col;
			this.value = value;
			this.priority = priority;
		}
	}
	
	/**
	 * Original reducePuzzle implementation (preserved for fallback)
	 */
	private int[][] reducePuzzleOriginal(String diff, int[][] oldCount) {

		if (diff.equals("easy")) {

			if (n < 10) {
				int zeroCount = 0;
				for (int i = 0; i < n - 1; i++) {
					for (int j = 0; j < n - 1; j++) {
						if (oldCount[i][j] == 0) {
							zeroCount++;
						}
					}
				}
				if (zeroCount > n / 2) {
					for (int i = 0; i < n - 1; i++) {
						for (int j = 0; j < n - 1; j++) {

							if (oldCount[i][j] == 0) {
								int oldNum = oldCount[i][j];
								oldCount[i][j] = -1;
								zeroCount--;
								SLSolve sl = new SLSolve(n, oldCount, false);
								int[] ans = sl.genSolutions(3);
								int num = ans[0];
								int size = ans[1];
								if (num != 2 || size < l) {
									oldCount[i][j] = oldNum;
									zeroCount++;
								}
							}
						}
					}
				}
			}
			// take out in bulk and add back in

			ArrayList<Integer[]> locations = new ArrayList();
			ArrayList<Integer> values = new ArrayList();
			int zeroCount = 0;
			for (int i = 0; i < n - 1; i++) {
				for (int j = 0; j < n - 1; j++) {
					if (oldCount[i][j] == 0) {
						zeroCount++;
					}
				}
			}
			for (int i = 0; i < n - 1; i++) {
				for (int j = 0; j < n - 1; j++) {
					if (!(i == 0 && j == 0) && !(i == 0 && j == n - 2) && !(i == n - 2 && j == 0)
							&& !(i == n - 2 && j == n - 2)) {
						if (oldCount[i][j] == 2 || oldCount[i][j] == 1 || (oldCount[i][j] == 0 && zeroCount > 16)) {
							int oldNum = oldCount[i][j];
							oldCount[i][j] = -1;
							locations.add(new Integer[] { i, j });

							values.add(oldNum);
							oldCount[i][j] = -1;
						}
					}
				}
			}

			SLSolve sl = new SLSolve(n, oldCount, false);
			sl.rules();
			int[] ans = sl.genSolutions(3);
			int num = ans[0];
			int size = ans[1];

			while ((num != 2 || size < l)) {
				System.out.println(locations.size());
				System.out.println("size is " + size);
				// add back in values in order#
				System.out.println("l is " + l);
				int index1 = rand.nextInt(locations.size());

				Integer[] locationvals1 = locations.get(index1);

				oldCount[locationvals1[0]][locationvals1[1]] = values.get(index1);

				locations.remove(index1);
				values.remove(index1);

				sl = new SLSolve(n, oldCount, false);
				sl.rules();
				ans = sl.genSolutions(3);
				num = ans[0];
				size = ans[1];

			}
			// remove additional clues if necessary
			oldCount = clueReduction(oldCount);

			return oldCount;

		}

		if (diff.equals("medium")) {
			ArrayList<Integer[]> locations = new ArrayList();
			ArrayList<Integer> values = new ArrayList();
			int[][] corners = new int[][] { { 0, 0 }, { 0, n - 2 }, { n - 2, 0 }, { n - 2, n - 2 } };
			int randCorner1 = rand.nextInt(4);
			int randCorner2 = rand.nextInt(4);
			for (int i = 0; i < n - 1; i++) {
				for (int j = 0; j < n - 1; j++) {
					if (!(i == corners[randCorner1][0] && j == corners[randCorner1][1])
							&& !(i == corners[randCorner2][0] && j == corners[randCorner2][1])) {
						if (oldCount[i][j] == 2 || oldCount[i][j] == 1 || oldCount[i][j] == 0) {
							int oldNum = oldCount[i][j];

							locations.add(new Integer[] { i, j });

							values.add(oldNum);
							oldCount[i][j] = -1;
						}
					}
					SLSolve sl = new SLSolve(n, oldCount, false);
					sl.rules();
					int[] ans = sl.genSolutions(3);

					int num = ans[0];
					int size = ans[1];
					while ((num != 2 || size < l)) {
						System.out.println(locations.size());
						System.out.println("size is " + size);
						// add back in values in order#
						System.out.println("l is " + l);
						int index1 = rand.nextInt(locations.size());

						Integer[] locationvals1 = locations.get(index1);

						oldCount[locationvals1[0]][locationvals1[1]] = values.get(index1);

						locations.remove(index1);
						values.remove(index1);

						sl = new SLSolve(n, oldCount, false);
						sl.rules();
						ans = sl.genSolutions(3);
						num = ans[0];
						size = ans[1];

					}

				}
			}

		}

		if (diff.equals("difficult")) {
			int[][] corners = new int[][] { { 0, 0 }, { 0, n - 2 }, { n - 2, 0 }, { n - 2, n - 2 } };
			// try to remove all corners first
			for (int k = 0; k < corners.length; k++) {
				System.out.println("k is " + k + " " + "l is " + l);
				int oldNum = oldCount[corners[k][0]][corners[k][1]];
				System.out.println(oldNum);
				oldCount[corners[k][0]][corners[k][1]] = -1;
				System.out.println(oldCount[corners[k][0]][corners[k][1]]);
				SLSolve sl = new SLSolve(n, oldCount, false);
				int[] ans = sl.genSolutions(3);
				int num = ans[0];
				int size = ans[1];
				if (num != 2 || size < l) {
					oldCount[corners[k][0]][corners[k][1]] = oldNum;

				}

			}

			ArrayList<Integer[]> locations = new ArrayList();
			ArrayList<Integer> values = new ArrayList();
			for (int i = 0; i < (n - 1) / 2; i++) {
				for (int j = 0; j < (n - 1) / 2; j++) {

					int val1 = rand.nextInt(n - 1);
					int val2 = rand.nextInt(n - 1);
					int temp = oldCount[val1][val2];
					oldCount[val1][val2] = -1;
					locations.add(new Integer[] { val1, val2 });

					values.add(temp);

				}
			}
			SLSolve sl = new SLSolve(n, oldCount, false);
			int[] ans = sl.genSolutions(3);
			int num = ans[0];
			int size = ans[1];
			while (num != 2 || size < l) {
				System.out.println(locations.size());
				System.out.println("size is " + size);
				System.out.println("#sol is " + num);
				// add back in values in order#
				System.out.println("l is " + l);
				int index1 = rand.nextInt(locations.size());

				Integer[] locationvals1 = locations.get(index1);

				oldCount[locationvals1[0]][locationvals1[1]] = values.get(index1);

				locations.remove(index1);
				values.remove(index1);

				sl = new SLSolve(n, oldCount, false);
				sl.rules();
				ans = sl.genSolutions(3);
				num = ans[0];
				size = ans[1];
			}

		}

		// remove additional clues if necessary
		oldCount = clueReduction(oldCount);
		return oldCount;
	}

	/**
	 * Apply rules before solving
	 */
	public void rules() {
		Tuples LC = new Tuples();
		LC.add(1, 1, 1, 0, 0, 0, 0, 0);
		LC.add(0, 0, 0, 0, 1, 0, 1, 1);
		LC.add(0, 0, 0, 0, 1, 1, 1, 0);
		LC.add(0, 0, 0, 0, 0, 0, 0, 0);
		LC.add(1, 0, 0, 0, 0, 0, 0, 0);
		LC.add(0, 0, 0, 0, 0, 1, 0, 0);
		LC.add(0, 0, 0, 0, 0, 0, 0, 1);
		LC.add(0, 0, 0, 0, 0, 1, 0, 1);
		LC.add(0, 1, 1, 1, 0, 0, 0, 0);
		LC.add(0, 0, 0, 1, 0, 0, 0, 0);
		LC.add(1, 0, 0, 1, 0, 0, 0, 0);
		LC.add(0, 0, 1, 0, 0, 0, 0, 0);
		LC.add(0, 0, 0, 0, 0, 0, 1, 0);
		LC.add(0, 0, 0, 0, 1, 0, 0, 0);
		LC.add(0, 0, 0, 0, 0, 1, 1, 0);
		LC.add(0, 0, 0, 0, 1, 0, 0, 1);
		LC.add(0, 0, 0, 0, 1, 1, 0, 0);
		LC.add(1, 0, 1, 0, 0, 0, 0, 0);
		LC.add(0, 0, 0, 0, 0, 0, 1, 1);
		LC.add(0, 0, 0, 0, 1, 1, 0, 1);
		LC.add(0, 0, 1, 1, 0, 0, 0, 0);
		LC.add(0, 0, 0, 0, 0, 1, 1, 1);
		LC.add(0, 1, 0, 0, 0, 0, 0, 0);
		LC.add(1, 0, 1, 1, 0, 0, 0, 0);
		LC.add(1, 1, 0, 0, 0, 0, 0, 0);
		LC.add(0, 1, 0, 1, 0, 0, 0, 0);
		LC.add(1, 1, 0, 1, 0, 0, 0, 0);
		LC.add(0, 0, 0, 0, 1, 0, 1, 0);
		LC.add(0, 1, 1, 0, 0, 0, 0, 0);

		for (int i = n; i < n - 1; i += n) {
			IntVar[] adjLC = new IntVar[] { a[i][i + 1], a[i + 1][(i + n) + 1], a[(i + n) + 1][i + n], a[i + n][i],
					a[i][i + n], a[i + n][(i + n) + 1], a[(i + n) + 1][i + 1], a[i + 1][i] };
			model.table(adjLC, LC).post();

		}

		Tuples RC = new Tuples();
		RC.add(1, 1, 1, 0, 0, 0, 0, 0);
		RC.add(0, 0, 0, 0, 1, 1, 1, 0);
		RC.add(0, 0, 0, 0, 1, 0, 1, 1);
		RC.add(1, 0, 0, 0, 0, 0, 0, 0);
		RC.add(0, 0, 0, 0, 0, 0, 0, 0);
		RC.add(0, 0, 0, 0, 0, 1, 0, 0);
		RC.add(0, 0, 0, 0, 0, 0, 0, 1);
		RC.add(0, 0, 0, 0, 0, 1, 0, 1);
		RC.add(0, 1, 1, 1, 0, 0, 0, 0);
		RC.add(0, 0, 0, 1, 0, 0, 0, 0);
		RC.add(1, 0, 0, 1, 0, 0, 0, 0);
		RC.add(0, 0, 1, 0, 0, 0, 0, 0);
		RC.add(0, 0, 0, 0, 0, 0, 1, 0);
		RC.add(0, 0, 0, 0, 1, 0, 0, 0);
		RC.add(0, 0, 0, 0, 0, 1, 1, 0);
		RC.add(0, 0, 0, 0, 0, 0, 1, 1);
		RC.add(0, 0, 0, 0, 1, 1, 0, 0);
		RC.add(0, 0, 0, 0, 1, 0, 0, 1);
		RC.add(1, 0, 1, 0, 0, 0, 0, 0);
		RC.add(0, 0, 0, 0, 0, 1, 1, 1);
		RC.add(0, 0, 0, 0, 1, 1, 0, 1);
		RC.add(0, 0, 1, 1, 0, 0, 0, 0);
		RC.add(0, 1, 0, 0, 0, 0, 0, 0);
		RC.add(1, 0, 1, 1, 0, 0, 0, 0);
		RC.add(1, 1, 0, 0, 0, 0, 0, 0);
		RC.add(1, 1, 0, 1, 0, 0, 0, 0);
		RC.add(0, 1, 0, 1, 0, 0, 0, 0);
		RC.add(0, 0, 0, 0, 1, 0, 1, 0);
		RC.add(0, 1, 1, 0, 0, 0, 0, 0);

		for (int i = n; i < n - 1; i += n) {
			IntVar[] adjRC = new IntVar[] { a[(i + n) - 2][(i + n) - 1], a[(i + n) - 1][(i + n + n) - 1],
					a[(i + n + n) - 1][(i + n + n) - 2], a[(i + n + n) - 2][(i + n) - 2],
					a[(i + n) - 2][(i + n + n) - 2], a[(i + n + n) - 2][(i + n + n) - 1],
					a[(i + n + n) - 1][(i + n) - 1], a[(i + n) - 1][(i + n) - 2] };
			model.table(adjRC, RC).post();

		}

		Tuples TL = new Tuples();
		TL.add(0, 0, 0, 0, 1, 0, 1, 1);
		TL.add(0, 0, 0, 0, 0, 0, 1, 0);
		TL.add(0, 0, 0, 0, 0, 0, 0, 0);
		TL.add(0, 0, 0, 0, 1, 0, 0, 1);
		TL.add(0, 0, 0, 0, 0, 1, 1, 0);
		TL.add(0, 0, 0, 0, 0, 1, 0, 0);
		TL.add(0, 0, 0, 0, 1, 1, 0, 1);
		TL.add(0, 1, 0, 0, 0, 0, 0, 0);
		TL.add(1, 0, 1, 1, 0, 0, 0, 0);
		TL.add(1, 0, 0, 1, 0, 0, 0, 0);
		TL.add(0, 0, 1, 0, 0, 0, 0, 0);
		TL.add(1, 1, 0, 1, 0, 0, 0, 0);
		TL.add(0, 1, 1, 0, 0, 0, 0, 0);

		IntVar[] adjTL = new IntVar[] { a[0][1], a[1][n + 1], a[n + 1][n], a[n][0], a[0][n], a[n][n + 1], a[n + 1][1],
				a[1][0] };

		model.table(adjTL, TL).post();

		Tuples TC = new Tuples();
		TC.add(1, 1, 1, 0, 0, 0, 0, 0);
		TC.add(0, 0, 0, 0, 1, 1, 1, 0);
		TC.add(0, 0, 0, 0, 1, 0, 1, 1);
		TC.add(0, 0, 0, 0, 0, 0, 0, 0);
		TC.add(1, 0, 0, 0, 0, 0, 0, 0);
		TC.add(0, 0, 0, 0, 0, 1, 0, 0);
		TC.add(0, 0, 0, 0, 0, 0, 0, 1);
		TC.add(0, 0, 0, 0, 0, 1, 0, 1);
		TC.add(0, 1, 1, 1, 0, 0, 0, 0);
		TC.add(0, 0, 0, 1, 0, 0, 0, 0);
		TC.add(1, 0, 0, 1, 0, 0, 0, 0);
		TC.add(0, 0, 1, 0, 0, 0, 0, 0);
		TC.add(0, 0, 0, 0, 1, 0, 0, 0);
		TC.add(0, 0, 0, 0, 0, 0, 1, 0);
		TC.add(0, 0, 0, 0, 0, 1, 1, 0);
		TC.add(0, 0, 0, 0, 1, 1, 0, 0);
		TC.add(0, 0, 0, 0, 1, 0, 0, 1);
		TC.add(0, 0, 0, 0, 0, 0, 1, 1);
		TC.add(1, 0, 1, 0, 0, 0, 0, 0);
		TC.add(0, 0, 1, 1, 0, 0, 0, 0);
		TC.add(0, 0, 0, 0, 0, 1, 1, 1);
		TC.add(0, 0, 0, 0, 1, 1, 0, 1);
		TC.add(0, 1, 0, 0, 0, 0, 0, 0);
		TC.add(1, 0, 1, 1, 0, 0, 0, 0);
		TC.add(1, 1, 0, 0, 0, 0, 0, 0);
		TC.add(0, 0, 0, 0, 1, 0, 1, 0);
		TC.add(0, 1, 0, 1, 0, 0, 0, 0);
		TC.add(1, 1, 0, 1, 0, 0, 0, 0);
		TC.add(0, 1, 1, 0, 0, 0, 0, 0);
		for (int i = 1; i < n - 2; i++) {
			IntVar[] adjTC = new IntVar[] { a[i][i + 1], a[i + 1][i + n + 1], a[i + n + 1][i + n], a[i + n][i],
					a[i][i + n], a[i + n][i + n + 1], a[i + n + 1][i + 1], a[i + 1][i] };
			model.table(adjTC, TC).post();

		}

		Tuples BC = new Tuples();
		BC.add(1, 1, 1, 0, 0, 0, 0, 0);
		BC.add(0, 0, 0, 0, 1, 1, 1, 0);
		BC.add(0, 0, 0, 0, 1, 0, 1, 1);
		BC.add(0, 0, 0, 0, 0, 0, 0, 0);
		BC.add(1, 0, 0, 0, 0, 0, 0, 0);
		BC.add(0, 0, 0, 0, 0, 0, 0, 1);
		BC.add(0, 0, 0, 0, 0, 1, 0, 0);
		BC.add(0, 0, 0, 0, 0, 1, 0, 1);
		BC.add(0, 1, 1, 1, 0, 0, 0, 0);
		BC.add(0, 0, 0, 1, 0, 0, 0, 0);
		BC.add(1, 0, 0, 1, 0, 0, 0, 0);
		BC.add(0, 0, 1, 0, 0, 0, 0, 0);
		BC.add(0, 0, 0, 0, 0, 0, 1, 0);
		BC.add(0, 0, 0, 0, 1, 0, 0, 0);
		BC.add(0, 0, 0, 0, 1, 0, 0, 1);
		BC.add(1, 0, 1, 0, 0, 0, 0, 0);
		BC.add(0, 0, 0, 0, 0, 1, 1, 0);
		BC.add(0, 0, 0, 0, 1, 1, 0, 0);
		BC.add(0, 0, 0, 0, 0, 0, 1, 1);
		BC.add(0, 0, 1, 1, 0, 0, 0, 0);
		BC.add(0, 0, 0, 0, 1, 1, 0, 1);
		BC.add(0, 0, 0, 0, 0, 1, 1, 1);
		BC.add(1, 0, 1, 1, 0, 0, 0, 0);
		BC.add(0, 1, 0, 0, 0, 0, 0, 0);
		BC.add(1, 1, 0, 0, 0, 0, 0, 0);
		BC.add(0, 1, 0, 1, 0, 0, 0, 0);
		BC.add(1, 1, 0, 1, 0, 0, 0, 0);
		BC.add(0, 0, 0, 0, 1, 0, 1, 0);
		BC.add(0, 1, 1, 0, 0, 0, 0, 0);
		for (int i = 1; i < n - 2; i++) {
			IntVar[] adjBC = new IntVar[] { a[(n * n) - n - n + i][(n * n) - n - n + i + 1],
					a[(n * n) - n - n + i + 1][(n * n) - n + i + 1], a[(n * n) - n + i + 1][(n * n) - n + i],
					a[(n * n) - n + i][(n * n) - n - n + i], a[(n * n) - n - n + i][(n * n) - n + i],
					a[(n * n) - n + i][(n * n) - n + i + 1], a[(n * n) - n + i + 1][(n * n) - n - n + i + 1],
					a[(n * n) - n - n + i + 1][(n * n) - n - n + i] };
			model.table(adjBC, BC).post();

		}

		Tuples TR = new Tuples();
		TR.add(1, 1, 1, 0, 0, 0, 0, 0);
		TR.add(0, 0, 0, 0, 1, 0, 1, 1);
		TR.add(0, 0, 0, 0, 1, 0, 0, 0);
		TR.add(0, 0, 0, 0, 1, 1, 0, 0);
		TR.add(0, 0, 0, 0, 0, 0, 0, 0);
		TR.add(0, 0, 0, 0, 0, 0, 1, 1);
		TR.add(0, 0, 0, 0, 0, 1, 0, 0);
		TR.add(0, 0, 0, 0, 0, 1, 1, 1);
		TR.add(0, 0, 1, 1, 0, 0, 0, 0);
		TR.add(1, 1, 0, 0, 0, 0, 0, 0);
		TR.add(0, 0, 0, 1, 0, 0, 0, 0);
		TR.add(0, 0, 1, 0, 0, 0, 0, 0);
		TR.add(1, 1, 0, 1, 0, 0, 0, 0);

		IntVar[] adjTR = new IntVar[] { a[n - 2][n - 1], a[n - 1][(n + n) - 1], a[(n + n) - 1][(n + n) - 2],
				a[(n + n) - 2][n - 2], a[n - 2][(n + n) - 2], a[(n + n) - 2][(n + n) - 1], a[(n + n) - 1][n - 1],
				a[n - 1][n - 2] };
		model.table(adjTR, TC).post();

		Tuples BL = new Tuples();
		BL.add(0, 0, 0, 0, 1, 1, 1, 0);
		BL.add(0, 0, 0, 0, 0, 0, 1, 0);
		BL.add(0, 0, 0, 0, 0, 0, 1, 1);
		BL.add(0, 0, 0, 0, 0, 0, 0, 0);
		BL.add(1, 0, 0, 0, 0, 0, 0, 0);
		BL.add(0, 0, 0, 0, 1, 1, 0, 0);
		BL.add(0, 0, 1, 1, 0, 0, 0, 0);
		BL.add(0, 0, 0, 0, 0, 0, 0, 1);
		BL.add(0, 0, 0, 0, 1, 1, 0, 1);
		BL.add(1, 0, 1, 1, 0, 0, 0, 0);
		BL.add(0, 1, 0, 0, 0, 0, 0, 0);
		BL.add(1, 1, 0, 0, 0, 0, 0, 0);
		BL.add(0, 1, 1, 1, 0, 0, 0, 0);

		IntVar[] adjBL = new IntVar[] { a[(n * n) - n - n][(n * n) - n - n + 1],
				a[(n * n) - n - n + 1][(n * n) - n + 1], a[(n * n) - n + 1][(n * n) - n],
				a[(n * n) - n][(n * n) - n - n], a[(n * n) - n - n][(n * n) - n], a[(n * n) - n][(n * n) - n + 1],
				a[(n * n) - n + 1][(n * n) - n - n + 1], a[(n * n) - n - n + 1][(n * n) - n - n] };
		model.table(adjBL, BL).post();

		Tuples BR = new Tuples();
		BR.add(1, 1, 1, 0, 0, 0, 0, 0);
		BR.add(0, 0, 0, 0, 1, 1, 1, 0);
		BR.add(0, 0, 0, 0, 1, 0, 0, 0);
		BR.add(0, 0, 0, 0, 0, 0, 0, 0);
		BR.add(0, 0, 0, 0, 0, 1, 1, 0);
		BR.add(1, 0, 0, 0, 0, 0, 0, 0);
		BR.add(0, 0, 0, 0, 1, 0, 0, 1);
		BR.add(0, 0, 0, 0, 0, 1, 1, 1);
		BR.add(0, 0, 0, 0, 0, 0, 0, 1);
		BR.add(0, 1, 1, 1, 0, 0, 0, 0);
		BR.add(0, 0, 0, 1, 0, 0, 0, 0);
		BR.add(1, 0, 0, 1, 0, 0, 0, 0);
		BR.add(0, 1, 1, 0, 0, 0, 0, 0);
		IntVar[] adjBR = new IntVar[] { a[(n * n) - 2 - n][(n * n) - 1 - n], a[(n * n) - 1 - n][(n * n) - 1],
				a[(n * n) - 1][(n * n) - 2], a[(n * n) - 2][(n * n) - 2 - n], a[(n * n) - 2 - n][(n * n) - 2],
				a[(n * n) - 2][(n * n) - 1], a[(n * n) - 1][(n * n) - 1 - n], a[(n * n) - 1 - n][(n * n) - 2 - n] };
		model.table(adjBR, BR).post();

		Tuples C = new Tuples();
		C.add(1, 1, 1, 0, 0, 0, 0, 0);
		C.add(0, 0, 0, 0, 1, 0, 1, 1);
		C.add(0, 0, 0, 0, 1, 1, 1, 0);
		C.add(1, 0, 0, 0, 0, 0, 0, 0);
		C.add(0, 0, 0, 0, 0, 0, 0, 0);
		C.add(0, 0, 0, 0, 0, 1, 0, 0);
		C.add(0, 0, 0, 0, 0, 0, 0, 1);
		C.add(0, 0, 0, 0, 0, 1, 0, 1);
		C.add(0, 1, 1, 1, 0, 0, 0, 0);
		C.add(0, 0, 0, 1, 0, 0, 0, 0);
		C.add(1, 0, 0, 1, 0, 0, 0, 0);
		C.add(0, 0, 1, 0, 0, 0, 0, 0);
		C.add(0, 0, 0, 0, 1, 0, 0, 0);
		C.add(0, 0, 0, 0, 0, 0, 1, 0);
		C.add(0, 0, 0, 0, 1, 1, 0, 0);
		C.add(1, 0, 1, 0, 0, 0, 0, 0);
		C.add(0, 0, 0, 0, 1, 0, 0, 1);
		C.add(0, 0, 0, 0, 0, 0, 1, 1);
		C.add(0, 0, 0, 0, 0, 1, 1, 0);
		C.add(0, 0, 1, 1, 0, 0, 0, 0);
		C.add(0, 0, 0, 0, 1, 1, 0, 1);
		C.add(0, 0, 0, 0, 0, 1, 1, 1);
		C.add(1, 0, 1, 1, 0, 0, 0, 0);
		C.add(0, 1, 0, 0, 0, 0, 0, 0);
		C.add(1, 1, 0, 0, 0, 0, 0, 0);
		C.add(1, 1, 0, 1, 0, 0, 0, 0);
		C.add(0, 1, 0, 1, 0, 0, 0, 0);
		C.add(0, 0, 0, 0, 1, 0, 1, 0);
		C.add(0, 1, 1, 0, 0, 0, 0, 0);
		for (int i = 1; i < n - 2; i++) {
			for (int j = n; j < n - 2; j++) {
				IntVar[] adjC = new IntVar[] { a[(j * i) + 1][(j * i) + 2], a[(j * i) + 2][((j * i) + n) + 2],
						a[((j * i) + n) + 2][((j * i) + n) + 1], a[((j * i) + n) + 1][(j * i) + 1],
						a[(j * i) + 1][((j * i) + n) + 1], a[((j * i) + n) + 1][((j * i) + n) + 2],
						a[((j * i) + n) + 2][(j * i) + 2], a[(j * i) + 2][(j * i) + 1] };

				model.table(adjC, C).post();
			}
		}

	}

}
