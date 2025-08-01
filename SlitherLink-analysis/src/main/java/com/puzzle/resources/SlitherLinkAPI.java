package com.puzzle.resources;

import java.util.Scanner;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.json.simple.JSONObject;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.puzzle.core.SLGen;
import com.puzzle.core.SLSolve;

@Path("/sl")
@Produces(MediaType.APPLICATION_JSON) 
@Consumes(MediaType.APPLICATION_JSON) 
public class SlitherLinkAPI {

	ObjectWriter oWriter = new ObjectMapper().writerWithDefaultPrettyPrinter();
/**
 * Receive dimension and difficulty and return instance data
 * @param puzzledim
 * @param diff
 * @return
 */
	@Path("/gen")
	@GET
	public String genPuzzle(@QueryParam("puzzledim") int puzzledim, @QueryParam("diff") String diff) {
		
		// Parameter validation
		if (diff == null || diff.trim().isEmpty()) {
			System.err.println("ERROR: diff parameter is required but was null or empty");
			JSONObject error = new JSONObject();
			error.put("error", "diff parameter is required (easy|medium|difficult)");
			return error.toJSONString();
		}
		
		if (puzzledim <= 0) {
			System.err.println("ERROR: puzzledim parameter must be positive, got: " + puzzledim);
			JSONObject error = new JSONObject();
			error.put("error", "puzzledim parameter must be positive");
			return error.toJSONString();
		}

		String pairsString = "";
		String countString = "";
		SLGen slGen = new SLGen(puzzledim, diff, false);
		slGen.rules();
		int[][] countArr = slGen.generate();
		long genSeed = slGen.getSeed();
		String genDiff = slGen.getDiff();

		String displaySeed = puzzledim + "-" + genDiff.charAt(0) + "-" + genSeed;
		SLSolve sl = new SLSolve(puzzledim, countArr, false);
		sl.rules();
		if (sl.solve()) {
			int[][] pairs = new int[sl.getSolution().length][2];

			for (int i = 0; i < sl.getSolution().length; i++) {
				pairs[i][0] = i;
				System.out.print(pairs[i][0] + " ");
				pairs[i][1] = sl.getSolution()[i];
				System.out.print(pairs[i][1] + " ");
				System.out.println();
			}

			try {
				pairsString = oWriter.writeValueAsString(pairs);
				countString = oWriter.writeValueAsString(countArr);

			} catch (JsonProcessingException e) {
				e.printStackTrace();
			}

			JSONObject data = new JSONObject();
			data.put("count", countString);
			data.put("pairs", pairsString);
			data.put("seed", displaySeed);
			return data.toJSONString();
		}
		return "Failure";

	}
	/**
	 * Recieve puzzle dimension difficulty and seed as input and return specific instance
	 * @param puzzledim
	 * @param diff
	 * @param seed
	 * @return
	 */

	@Path("/load")
	@GET
	public String loadSeedPuzzle(@QueryParam("inputPuzzleDim") int puzzledim, @QueryParam("inputDiff") String diff,
			@QueryParam("seed") String seed) {
		String pairsString = "";
		String countString = "";
		String difficulty = "";
		if (diff.equals("e")) {
			difficulty = "easy";
		}
		if (diff.equals("m")) {
			difficulty = "medium";
		}
		if (diff.equals("d")) {
			difficulty = "difficult";
		}
		System.out.println("diff is" + diff);
		System.out.println("difficulty is" + difficulty);
		long inputSeed = Long.parseLong(seed);
		SLGen slGen = new SLGen(puzzledim, difficulty, inputSeed, false);
		slGen.rules();
		int[][] countArr = slGen.generate();
		long genSeed = slGen.getSeed();

		String displaySeed = puzzledim + "-" + diff + "-" + genSeed;
		SLSolve sl = new SLSolve(puzzledim, countArr, false);
		sl.rules();
		if (sl.solve()) {
			int[][] pairs = new int[sl.getSolution().length][2];

			for (int i = 0; i < sl.getSolution().length; i++) {
				pairs[i][0] = i;
				System.out.print(pairs[i][0] + " ");
				pairs[i][1] = sl.getSolution()[i];
				System.out.print(pairs[i][1] + " ");
				System.out.println();
			}

			try {
				pairsString = oWriter.writeValueAsString(pairs);
				countString = oWriter.writeValueAsString(countArr);

			} catch (JsonProcessingException e) {
				e.printStackTrace();
			}

			JSONObject data = new JSONObject();
			data.put("count", countString);
			data.put("pairs", pairsString);
			data.put("seed", displaySeed);
			return data.toJSONString();
		}
		return "Failure";
	}

	/**
	 * Receive puzzle dimension clue values and stats boolean, return solution
	 * 
	 * @param puzzledim
	 * @param countvals
	 * @param stats
	 * @return solution
	 */
	@Path("/solve")
	@GET
	public String solvePuzzle(@QueryParam("puzzledim") int puzzledim, @QueryParam("countvals") String countvals,
			@QueryParam("stats") boolean stats) {
		String pairsString = "";
		int[][] countArr = new int[puzzledim - 1][puzzledim - 1];
		Scanner s = new Scanner(countvals);
		while (s.hasNextInt()) {
			for (int i = 0; i < puzzledim - 1; i++) {
				for (int j = 0; j < puzzledim - 1; j++) {
					countArr[i][j] = s.nextInt();
					System.out.print(countArr[i][j] + " ");

				}
				System.out.println();
			}

		}

		SLSolve sl = new SLSolve(puzzledim, countArr, false);
		sl.rules();
		if (sl.solve()) {
			int[][] pairs = new int[sl.getSolution().length][2];

			for (int i = 0; i < sl.getSolution().length; i++) {
				pairs[i][0] = i;
				System.out.print(pairs[i][0] + " ");
				pairs[i][1] = sl.getSolution()[i];
				System.out.print(pairs[i][1] + " ");
				System.out.println();
			}

			System.out.println("No stats wanted");
			try {
				pairsString = oWriter.writeValueAsString(pairs);
			} catch (JsonProcessingException e) {
				e.printStackTrace();
			}
			if (stats) {
				SLSolve sl2 = new SLSolve(puzzledim, countArr, false);
				sl2.rules();
				System.out.println("Stats ARE wanted");
				JSONObject data = new JSONObject();
				data.put("solveTime", sl.solveTime());
				data.put("numSolutions", sl2.findNumSolutions()/2);
				data.put("pairs", pairsString);
				return data.toJSONString();

			}
			if (!stats) {
				return pairsString;

			}
			return pairsString;
		}
		return "Failure";
	}
}