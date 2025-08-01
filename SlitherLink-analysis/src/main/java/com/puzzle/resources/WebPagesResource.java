package com.puzzle.resources;

import javax.ws.rs.GET;




import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import com.puzzle.views.SolveScreenView;
import com.puzzle.views.GameScreenView;
import com.puzzle.views.HomeScreenView;


@Path("/sl")
@Produces(MediaType.TEXT_HTML)


public class WebPagesResource {

	@GET
	@Path("/")
	
	public HomeScreenView getHomeScreen() {
		return new HomeScreenView();
	}
	
	@GET
	@Path("/solve")

	public SolveScreenView getSolveScreen() {
		return new SolveScreenView();
	}
	
	@GET
	@Path("/game")

	public GameScreenView getGameScreen() {
		return new GameScreenView();
	}

	

}
