package com.puzzle.core;

import org.chocosolver.solver.Model;
import org.chocosolver.solver.Solution;
import org.chocosolver.solver.Solver;
import org.chocosolver.solver.constraints.Constraint;
import org.chocosolver.solver.constraints.extension.Tuples;
import org.chocosolver.solver.exception.ContradictionException;
import org.chocosolver.solver.search.strategy.Search;
import org.chocosolver.solver.variables.IntVar;
import org.chocosolver.util.tools.ArrayUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * Reads in a SlitherLink puzzle and returns a solution
 */
public class SLSolve {

	private int n; // puzzle dimension
	private int m; // sub-tour ubound
	private int l; // sub-tour lbound

	private Model model;
	private Solver solver;

	private int[][] count; // edge reqs
	private IntVar[][] a; // adjacency matrix
	private IntVar[][] v; // vertex matrix
	private IntVar[] tour; // sub-tour array
	private IntVar tourLength;
	private Boolean trace;

	public SLSolve(int n, int[][] count, Boolean trace) {
		this.trace = trace;
		model = new Model("SL Solver");
		solver = model.getSolver();
		this.n = n;
		this.count = count;
		m = n * n;
		l = m / 2;
		a = new IntVar[n * n][n * n];
		v = new IntVar[n][n];

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
		if (trace) {
			for (int i = 0; i < n; i++) {
				for (int j = 0; j < n; j++)
					System.out.print(v[i][j] + " ");
				System.out.println();
			}
		}

		// subtour constraint
		tourLength = model.intVar("tour length", l, m);
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
	 * 
	 * @return solve time
	 */
	public float solveTime() {
		System.out.println(solver.getTimeCount());
		return solver.getTimeCount();
	}

	/**
	 * applies table constraints for allowed values
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

	/**
	 * 
	 * @return if solution found
	 */
	public boolean solve() {
		solver.setSearch(Search.minDomLBSearch(tour)); // fail-first

		return solver.solve();
	}

	/**
	 * 
	 * @return solution to problem
	 */
	public int[] getSolution() {

		int[] solution = new int[tour.length];

		for (int i = 0; i < n * n; i++) {
			solution[i] = tour[i].getValue();
		}
		return solution;
	}

	/**
	 * prints solve statistics
	 */
	public void stats() {
		solver.printShortStatistics();
	}

	/**
	 * 
	 * @return number of solutions
	 */
	public int findNumSolutions() {
		solver.setSearch(Search.minDomLBSearch(tour)); // fail-first
		int numSolutions = 0;
		while (solver.solve()) {
			numSolutions++;
		}
		return numSolutions;

	}

	/**
	 * function for generation checks number of solutions and tour length
	 * 
	 * @param limit
	 * @return number solutions and tour length
	 */
	public int[] genSolutions(int limit) {
		solver.limitSolution(limit);
		solver.setSearch(Search.minDomLBSearch(tour)); // fail-first
		int solNum = 0;
		int lengthTour = 0;
		while (solver.solve()) {
			solNum++;
			lengthTour = tourLength.getValue();
		}
		return new int[] { solNum, lengthTour };

	}

	/**
	 * prints the length of the shortest tour
	 */
	public void minimumTour() {
		int shortest;
		while (solver.solve()) {
			shortest = tourLength.getValue();
			System.out.println(shortest);
			model.arithm(tourLength, "<", shortest).post();
		}
	}

	/**
	 * 
	 * @return number of nodes
	 */
	public long getNodeCount() {
		return solver.getNodeCount();
	}

	/**
	 * prints the length of the longest tour
	 */
	public void maximumTour() {
		int longest;
		while (solver.solve()) {
			longest = tourLength.getValue();
			System.out.println(longest);
			model.arithm(tourLength, ">", longest).post();
		}
	}

}
