package com.puzzle.core;

import org.chocosolver.solver.exception.ContradictionException;

import java.io.*;
import java.util.*;

public class EvalSolve {

	public static void main(String[] args) throws IOException, ContradictionException {
		// solvePuzzle("src/test/java/com/puzzle/resources/dim8");
		// solvePuzzle("src/test/java/com/puzzle/resources/dim11");
		solvePuzzle("src/test/java/com/puzzle/resources/dim21");
	}

	public static void solvePuzzle(String fname) {
		FileReader fr = null;

		try {
			fr = new FileReader(fname);
			Scanner sc = new Scanner(fr);

			while (sc.hasNext()) {

				int n = sc.nextInt();
				int[][] count = new int[n - 1][n - 1];

				for (int i = 0; i < n - 1; i++) {
					for (int j = 0; j < n - 1; j++) {
						count[i][j] = sc.nextInt();
						System.out.print(count[i][j] + " ");
					}
					System.out.println();

				}

				SLSolve sl = new SLSolve(n, count, false);
				// sl.rules();
				sl.solve();

				sl.stats();
			}

		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}

	}
}
