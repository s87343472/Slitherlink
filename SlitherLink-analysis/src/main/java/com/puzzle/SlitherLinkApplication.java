package com.puzzle;

import java.util.EnumSet;

import javax.servlet.DispatcherType;
import javax.servlet.FilterRegistration;

import org.eclipse.jetty.servlets.CrossOriginFilter;

import com.puzzle.resources.SlitherLinkAPI;
import com.puzzle.resources.WebPagesResource;

import io.dropwizard.Application;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import io.dropwizard.views.ViewBundle;


public class SlitherLinkApplication extends Application<SlitherLinkConfiguration> {

    public static void main(final String[] args) throws Exception {
    	try {
        new SlitherLinkApplication().run(args);}
    	catch(Exception e) {
    		e.printStackTrace();
    	}
        

        
    }

    @Override
    public String getName() {
        return "SlitherLink";
    }

    @Override
    public void initialize(final Bootstrap<SlitherLinkConfiguration> bootstrap) {
     
    	bootstrap.addBundle(new ViewBundle<SlitherLinkConfiguration>());
    	  
    }

    @Override
    public void run(final SlitherLinkConfiguration configuration,
                    final Environment environment) {
		final FilterRegistration.Dynamic cors =
				environment.servlets().addFilter("CORS", CrossOriginFilter.class);
		
		cors.setInitParameter("allowedOrigins", "*");
		cors.setInitParameter("allowedHeaders", "X-Requested-With,Content-Type,Accept,Origin");
		cors.setInitParameter("allowedMethods", "OPTIONS,GET,PUT,POST,DELETE,HEAD");
		
		cors.addMappingForUrlPatterns(EnumSet.allOf(DispatcherType.class), true, "/*");

     
    	environment.jersey().register(new SlitherLinkAPI());
    	environment.jersey().register(new WebPagesResource());
    }

}
