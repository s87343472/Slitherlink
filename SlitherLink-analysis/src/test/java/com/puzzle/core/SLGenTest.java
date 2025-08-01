package com.puzzle.core;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;

import org.junit.jupiter.api.*;

@DisplayName("SL Gen")
public class SLGenTest {
	private static int dim;
	private static int[][] count;
	private static int[] countSolution;
	private static int[][] falseCount;
	private static SLSolve s;
	private static SLGen sl;
	private static String[] diffs;
	private static long seed;

	
	
	
	  @BeforeAll
	    static void beforeAll() {
		    System.out.println("Before all test methods");
		    dim=5;
		    diffs=new String[] {"easy","medium","difficult"};}

	 
		 
	    @Test
	    @DisplayName("Puzzle Generation Test")
	    void testCountSolve() { 
	    	for(int i=0;i<100;i++) {
	    	for(String diff:diffs) {
	    sl=new SLGen(dim,diff,false);
	    	s=new SLSolve(dim,sl.generate(),false);
	       assertEquals(2,s.findNumSolutions());
	        
	        }}
	    }
		 
	    @Test
	    @DisplayName("Rules Test")
	    void testRules() { 
	   seed=1596895970558L;
	   sl=new SLGen(dim,diffs[0],seed,false);
	   int[][] sol1=sl.generate();
	   sl=new SLGen(dim,diffs[0],seed,false);
	   sl.rules();
	   int[][] sol2=sl.generate();
	   assertArrayEquals(sol1,sol2);
	   
	   
	    }
	    
	    
	    

}
