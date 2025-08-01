package com.puzzle.core;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;

import org.junit.jupiter.api.*;

@DisplayName("SL Solve")
public class SLSolveTest {
	private static int dim;
	private static int[][] count;
	private static int[] countSolution;
	private static int[][] falseCount;
	private static SLSolve s;
	
	
	  @BeforeAll
	    static void beforeAll() {
		    System.out.println("Before all test methods");
		    dim=5;
	        count=new int[][]{{-1,3,-1,3},{-1,0,-1,2},{-1,1,-1,2},{1,2,2,-1}};
	        countSolution=new int[] {0,2,7,4,9,6,1,8,3,14,5,10,12,18,13,15,11,17,23,19,20,16,21,22,24};
	        falseCount=new int[][]{{3,3,3,3},{3,3,3,3},{-1,1,-1,2},{1,2,2,-1}};
	    }
	 
	    @BeforeEach
	    void beforeEach() {
	        System.out.println("Before each test method");
	    
	       
	        s=new SLSolve(dim,count,false);
	    }
	 
	    @AfterEach
	    void afterEach() {
	        System.out.println("After each test method");
	    }
	 
	    @AfterAll
	    static void afterAll() {
	        System.out.println("After all test methods");
	    }
	    
	    @Test
	    @DisplayName("Solve Method Test")
	    void testSolve() {
	        assertEquals(true,s.solve());
	        s=new SLSolve(dim,falseCount,false);
	        assertEquals(false,s.solve());
	        
	        
	    }
	    @Test
	    @DisplayName("Get Solution Test")
	    void testGetSolution() {
	    	if(s.solve()) {
	
	    	 assertArrayEquals(countSolution,s.getSolution());
	    	}
	    	
	    }
	    @Test
	    @DisplayName("Get Node Count Test")
	    void testGetNodeCount() {
	    	if(s.solve()) {
	        assertEquals(10,s.getNodeCount());
	    	}
	    	
	    }
	    @Test
	    @DisplayName("Find Number Solutions Test")
	    void testFindNumSolutions() {
	        assertEquals(2,s.findNumSolutions());	
	    }
	    @Test
	    @DisplayName("Find Number Solutions Test")
	    void testGenSolutions() {
	
	      assertArrayEquals(new int[] {2,18},s.genSolutions(3));
	    	
	    	
	    }
	 
	    @Test
	    @DisplayName("Rules Method Test")
	    void testRules() {
	    	s.rules();
	        if(s.solve()) {
	        	assertEquals(7,s.getNodeCount());
	        }
	    }
	    
	    

}
