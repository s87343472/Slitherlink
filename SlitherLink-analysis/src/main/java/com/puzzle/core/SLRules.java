package com.puzzle.core;

import org.chocosolver.solver.Model;
import org.chocosolver.solver.Solver;
import org.chocosolver.solver.variables.IntVar;
import org.chocosolver.util.tools.ArrayUtils;

import java.util.*;

public class SLRules {

    private int n;  //puzzle dimension
    private int m;  //sub-tour ubound
    private int l; //sub-tour lbound


    private Model model;
    private Solver solver;

    private int[][] count;  //edge reqs
    private IntVar[][] a;   //adjacency matrix
    private IntVar[][] v;   //vertex matrix
    private IntVar[] tour;  //sub-tour array
    private IntVar tourLength;




    public SLRules(int n,int[][]count)  {
        model = new Model("SL Solver");
        solver = model.getSolver();
        this.n = n;
        this.count=count;
        m=n*n;
        l=m/2;
        a = new IntVar[n*n][n*n];
        v = new IntVar[n][n];

        //create node grid
        //define domains
        for(int i=0;i<n;i++){
            for(int j=0;j<n;j++){
                ArrayList<Integer> dom = new ArrayList<>();
                if(i > 0) dom.add((i - 1) * n + j); //above
                if(j > 0) dom.add(i * n + j - 1);   //left
                dom.add(i * n + j);                 //itself
                if(j < n-1 ) dom.add(i * n + j + 1);//right
                if(i < n-1) dom.add((i + 1) * n + j);//below

                int[] domain = new int[dom.size()];
                int k = 0;
                for(int x : dom){
                    domain[k++]=x;
                }
                v[i][j] = model.intVar("v["+i+"]"+"["+j+"]",domain);
            }


        }


        //subtour constraint
        tourLength = model.intVar("tour length",l,m);
        tour = ArrayUtils.flatten(v);

        model.subCircuit(tour,0,tourLength).post();

        //Link tour with adjacency matrix
        for (int i=0;i<n*n;i++){
            int ub = tour[i].getUB();
            for (int j = tour[i].getLB();j<=ub;j=tour[i].nextValue(j))
                if (i != j){
                    a[i][j] = model.intVar("A["+ i +"]["+ j +"]",0,1);
                    model.ifOnlyIf(model.arithm(a[i][j],"=",1),model.arithm(tour[i],"=",j));
                    //efficient search
                    model.ifThen(model.arithm(tour[i],"=",j),model.arithm(tour[j],"!=",i));
                }
        }


        System.out.println();
        for (int i=0;i<n;i++){
            for (int j=0;j<n;j++)
                System.out.print(v[i][j] +" ");
            System.out.println();
        }
        //constrain square edges
        for(int i = 0;i < n-1 ; i++){
            for(int j = 0;j < n-1; j++){
                if(count[i][j] > -1){
                    IntVar[] e = new IntVar[]{
                            a[(i*n)+j][(i*n)+j+1], //top
                            a[(i*n)+j+1][(i*n)+j], //top

                            a[(i*n)+j+n][(i*n)+j+n+1], //bottom
                            a[(i*n)+j+n+1][(i*n)+j+n], //bottom

                            a[(i*n)+j][(i*n)+j+n],     //left
                            a[(i*n)+j+n][(i*n)+j],     //left

                            a[(i*n)+j+1][(i*n)+j+n+1],  //right
                            a[(i*n)+j+n+1][(i*n)+j+1]  //right
                    };
                    model.sum(e,"=",count[i][j]).post();
                }
            }
        }

    }

    public Set<List<Integer>> test(){
        Set<List<Integer>> validTR = new HashSet<>();
        Set<List<Integer>> validTC = new HashSet<>();
        Set<List<Integer>> validTL = new HashSet<>();
        Set<List<Integer>> validLC = new HashSet<>();
        Set<List<Integer>> validRC = new HashSet<>();
        Set<List<Integer>> validC = new HashSet<>();
        Set<List<Integer>> validBR = new HashSet<>();
        Set<List<Integer>> validBC = new HashSet<>();
        Set<List<Integer>> validBL = new HashSet<>();

        while(solver.solve()){
            validTL.add(Arrays.asList(a[0][1].getValue(),a[1][n+1].getValue(),a[n+1][n].getValue(),a[n][0].getValue()
                    ,a[0][n].getValue(),a[n][n+1].getValue(),a[n+1][1].getValue(),a[1][0].getValue()));
            validTC.add(Arrays.asList(a[1][2].getValue(),a[2][n+2].getValue(),a[n+2][n+1].getValue(),a[n+1][1].getValue()
                    ,a[1][n+1].getValue(),a[n+1][n+2].getValue(),a[n+2][2].getValue(),a[2][1].getValue()));

            validTR.add(Arrays.asList(a[n-2][n-1].getValue(),a[n-1][(n+n)-1].getValue(),a[(n+n)-1][(n+n)-2].getValue(),a[(n+n)-2][n-2].getValue()
                    ,a[n-2][(n+n)-2].getValue(),a[(n+n)-2][(n+n)-1].getValue(),a[(n+n)-1][n-1].getValue(),a[n-1][n-2].getValue()));

            validLC.add(Arrays.asList(a[n][n+1].getValue(),a[n+1][(n+n)+1].getValue(),a[(n+n)+1][n+n].getValue(),a[n+n][n].getValue()
                    ,a[n][n+n].getValue(),a[n+n][(n+n)+1].getValue(),a[(n+n)+1][n+1].getValue(),a[n+1][n].getValue()));

            validRC.add(Arrays.asList(a[(n+n)-2][(n+n)-1].getValue(),a[(n+n)-1][(n+n+n)-1].getValue(),a[(n+n+n)-1][(n+n+n)-2].getValue(),a[(n+n+n)-2][(n+n)-2].getValue()
                    ,a[(n+n)-2][(n+n+n)-2].getValue(),a[(n+n+n)-2][(n+n+n)-1].getValue(),a[(n+n+n)-1][(n+n)-1].getValue(),a[(n+n)-1][(n+n)-2].getValue()));

            validC.add(Arrays.asList(a[n+1][n+2].getValue(),a[n+2][(n+n)+2].getValue(),a[(n+n)+2][(n+n)+1].getValue(),a[(n+n)+1][n+1].getValue()
                    ,a[n+1][(n+n)+1].getValue(),a[(n+n)+1][(n+n)+2].getValue(),a[(n+n)+2][n+2].getValue(),a[n+2][n+1].getValue()));

            validBL.add(Arrays.asList(a[(n*n)-n-n][(n*n)-n-n+1].getValue(),a[(n*n)-n-n+1][(n*n)-n+1].getValue(),a[(n*n)-n+1][(n*n)-n].getValue(),a[(n*n)-n][(n*n)-n-n].getValue()
                    ,a[(n*n)-n-n][(n*n)-n].getValue(),a[(n*n)-n][(n*n)-n+1].getValue(),a[(n*n)-n+1][(n*n)-n-n+1].getValue(),a[(n*n)-n-n+1][(n*n)-n-n].getValue()));

            validBC.add(Arrays.asList(a[(n*n)-n-n+1][(n*n)-n-n+2].getValue(),a[(n*n)-n-n+2][(n*n)-n+2].getValue(),a[(n*n)-n+2][(n*n)-n+1].getValue(),a[(n*n)-n+1][(n*n)-n-n+1].getValue()
                    ,a[(n*n)-n-n+1][(n*n)-n+1].getValue(),a[(n*n)-n+1][(n*n)-n+2].getValue(),a[(n*n)-n+2][(n*n)-n-n+2].getValue(),a[(n*n)-n-n+2][(n*n)-n-n+1].getValue()));

            validBR.add(Arrays.asList(a[(n*n)-2-n][(n*n)-1-n].getValue(),a[(n*n)-1-n][(n*n)-1].getValue(),a[(n*n)-1][(n*n)-2].getValue(),a[(n*n)-2][(n*n)-2-n].getValue()
                    ,a[(n*n)-2-n][(n*n)-2].getValue(),a[(n*n)-2][(n*n)-1].getValue(),a[(n*n)-1][(n*n)-1-n].getValue(),a[(n*n)-1-n][(n*n)-2-n].getValue()));

        }

    return validBC;

    }

    public static void main(String[] args){
       int[][] testCount;

               SLRules sl = new SLRules(5,new int[][]{{1,1,-1,1},{-1,-1,-1,2},{1,1,-1,-1},{-1,1,1,-1}});
               Set<List<Integer>> valid=sl.test();
               System.out.println("# Unique Valid Combinations");
               System.out.println(valid.size());

               for(List<Integer> s:valid){
                   System.out.print("BC.add(");
                   for(int i=0;i<s.size();i++){
                       if(i!=s.size()-1){
                           System.out.print(s.get(i)+",");
                       }
                       if(i==s.size()-1){
                           System.out.print(s.get(i));
                       }

                   }
                   System.out.print(");");
                   System.out.println();
               }


           }





}

