package com.puzzle.core;

import java.util.ArrayList;

public class EvalGen {

	public static void main(String[] args) {
		// create arraylists
		ArrayList<Double> easyTimes = new ArrayList();
		ArrayList<Double> easyGenTimes = new ArrayList();
		ArrayList<Integer> easyTours = new ArrayList();
		ArrayList<Long> easyNodes = new ArrayList();

		ArrayList<Double> mediumTimes = new ArrayList();
		ArrayList<Double> mediumGenTimes = new ArrayList();
		ArrayList<Integer> mediumTours = new ArrayList();
		ArrayList<Long> mediumNodes = new ArrayList();

		ArrayList<Double> diffTimes = new ArrayList();
		ArrayList<Double> diffGenTimes = new ArrayList();
		ArrayList<Integer> diffTours = new ArrayList();
		ArrayList<Long> diffNodes = new ArrayList();

		ArrayList<String> diffs = new ArrayList();
		diffs.add("easy");
		diffs.add("medium");
		diffs.add("difficult");

		for (int j = 0; j < diffs.size(); j++) {
			for (int i = 0; i <= 100; i++) {
				System.out.println("J IS " + j);
				System.out.println("I IS " + i);
				long genStart = System.currentTimeMillis();
				SLGen slg = new SLGen(10, diffs.get(j), false);
				slg.rules();
				int[][] answer = slg.generate();
				double genTime = ((System.currentTimeMillis() - genStart)) / 1000.0;
				long start = System.currentTimeMillis();
				SLSolve sl = new SLSolve(10, answer, false);
				sl.rules();
				sl.solve();
				long nodeCount = sl.getNodeCount();
				sl.stats();
				double time = ((System.currentTimeMillis() - start)) / 1000.0;

				if (diffs.get(j).equals("easy")) {

					easyTimes.add(time);
					easyGenTimes.add(genTime);
					easyTours.add(new SLSolve(10, answer, false).genSolutions(3)[1]);
					easyNodes.add(nodeCount);
				}

				if (diffs.get(j).equals("medium")) {
					mediumTimes.add(time);
					mediumGenTimes.add(genTime);
					mediumTours.add(new SLSolve(10, answer, false).genSolutions(3)[1]);
					mediumNodes.add(nodeCount);
				}
				if (diffs.get(j).equals("difficult")) {
					diffTimes.add(time);
					diffGenTimes.add(genTime);
					diffTours.add(new SLSolve(10, answer, false).genSolutions(3)[1]);
					diffNodes.add(nodeCount);
				}

			}

		}

		for (int j = 0; j < diffs.size(); j++) {
			System.out.println();
			double average = 0.0;
			long nodeAverage = 0;
			double genAverage = 0.0;
			if (diffs.get(j).equals("easy")) {

				for (Double d : easyTimes) {
					System.out.print(d + " ");
					average += d;
				}
				System.out.println();
				for (Double d : easyGenTimes) {
					System.out.print(d + " ");
					genAverage += d;
				}
				System.out.println();
				String easyNodesString = "";
				System.out.println();
				for (Long l : easyNodes) {
					nodeAverage += l;
					easyNodesString += l + " ";

				}
				System.out.println();
				System.out.println(easyNodesString);
				System.out.println("Easy Tours");
				for (Integer t : easyTours) {
					System.out.print(t + " ");

				}

				System.out.println("\n---------------------------------------");
				average = average / (Double.valueOf(easyTimes.size()));
				System.out.println(nodeAverage);
				nodeAverage = nodeAverage / ((easyNodes.size()));
				genAverage = genAverage / (Double.valueOf(easyGenTimes.size()));
				System.out.println("The easy average is " + average);
				System.out.println("The easy node average is " + nodeAverage);
				System.out.println("The easy gen average is " + genAverage);
			}
			if (diffs.get(j).equals("medium")) {
				for (Double d : mediumTimes) {
					System.out.print(d + " ");
					average += d;
				}
				System.out.println();
				for (Double d : mediumGenTimes) {
					System.out.print(d + " ");
					genAverage += d;
				}
				System.out.println();
				String mediumNodesString = "";
				for (Long l : mediumNodes) {
					nodeAverage += l;
					mediumNodesString += l + " ";
				}
				System.out.println();
				System.out.println(mediumNodesString);
				System.out.println("Medium Tours");
				for (Integer t : mediumTours) {
					System.out.print(t + " ");

				}
				System.out.println();

				System.out.println("\n---------------------------------------");
				average = average / (Double.valueOf(mediumTimes.size()));
				System.out.println(nodeAverage);
				nodeAverage = nodeAverage / ((mediumNodes.size()));
				genAverage = genAverage / (Double.valueOf(mediumGenTimes.size()));
				System.out.println("The medium average is " + average);
				System.out.println("The medium node average is " + nodeAverage);
				System.out.println("The medium gen average is " + genAverage);
			}
			if (diffs.get(j).equals("difficult")) {
				for (Double d : diffTimes) {
					System.out.print(d + " ");
					average += d;
				}
				System.out.println();
				for (Double d : diffGenTimes) {
					System.out.print(d + " ");
					genAverage += d;
				}
				System.out.println();
				String diffNodesString = "";
				for (Long l : diffNodes) {
					nodeAverage += l;
					diffNodesString += l + " ";
				}
				System.out.println();
				System.out.println(diffNodesString);
				System.out.println("Difficult Tours");
				for (Integer t : diffTours) {
					System.out.print(t + " ");

				}
				System.out.println();

				System.out.println("\n---------------------------------------");
				average = average / (Double.valueOf(diffTimes.size()));
				genAverage = genAverage / (Double.valueOf(diffGenTimes.size()));
				System.out.println(nodeAverage);
				nodeAverage = nodeAverage / ((diffNodes.size()));
				System.out.println("The difficult average is " + average);
				System.out.println("The difficult node average is " + nodeAverage);
				System.out.println("The difficult gen average is " + genAverage);

			}

		}
	}
}
