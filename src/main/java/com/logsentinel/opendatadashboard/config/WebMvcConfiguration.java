package com.logsentinel.opendatadashboard.config;

import com.logsentinel.opendatadashboard.util.ContainsStringPebbleFunction;
import com.logsentinel.opendatadashboard.util.FormatDatePebbleFunction;
import com.mitchellbosecke.pebble.PebbleEngine;
import com.mitchellbosecke.pebble.attributes.AttributeResolver;
import com.mitchellbosecke.pebble.extension.*;
import com.mitchellbosecke.pebble.extension.escaper.EscapingStrategy;
import com.mitchellbosecke.pebble.loader.ClasspathLoader;
import com.mitchellbosecke.pebble.operator.BinaryOperator;
import com.mitchellbosecke.pebble.operator.UnaryOperator;
import com.mitchellbosecke.pebble.spring.PebbleViewResolver;
import com.mitchellbosecke.pebble.spring.extension.SpringExtension;
import com.mitchellbosecke.pebble.tokenParser.TokenParser;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.config.annotation.ViewResolverRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Configuration for the WEB MVC component of spring mvc
 */
@Component
@Configuration
public class WebMvcConfiguration implements WebMvcConfigurer {


    @Bean
    public PebbleEngine pebbleEngine() {
        PebbleEngine.Builder builder = new PebbleEngine.Builder()
                .loader(new ClasspathLoader())
                .extension(new SpringExtension(), new OpenDataDashboardExtension())
                .addEscapingStrategy("jsFull", new JavascriptEscapeStrategy());
        return builder.build();
    }


    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {

        PebbleViewResolver viewResolver = new PebbleViewResolver();
        viewResolver.setRedirectHttp10Compatible(false);
        viewResolver.setPrefix("static/");
        viewResolver.setSuffix(".html");
        viewResolver.setCharacterEncoding("UTF-8");
        viewResolver.setPebbleEngine(pebbleEngine());
        registry.viewResolver(viewResolver);
    }


    public static final class OpenDataDashboardExtension implements Extension {
        @Override
        public Map<String, Filter> getFilters() {
            return null;
        }

        @Override
        public Map<String, Test> getTests() {
            return null;
        }

        @Override
        public Map<String, Function> getFunctions() {
            Map<String, Function> functions = new HashMap<>();
            functions.put("formatDate", new FormatDatePebbleFunction());
            return functions;
        }

        @Override
        public List<TokenParser> getTokenParsers() {
            return null;
        }

        @Override
        public List<BinaryOperator> getBinaryOperators() {
            return null;
        }

        @Override
        public List<UnaryOperator> getUnaryOperators() {
            return null;
        }

        @Override
        public Map<String, Object> getGlobalVariables() {
            return null;
        }

        @Override
        public List<NodeVisitorFactory> getNodeVisitors() {
            return null;
        }

        @Override
        public List<AttributeResolver> getAttributeResolver() {
            return null;
        }
    }


    public static final class JavascriptEscapeStrategy implements EscapingStrategy {

        @Override
        public String escape(String input) {
            return input.replace("\\", "\\u005C").replace("\t", "\\u0009")
                    .replace("\n", "\\u000A").replace("\f", "\\u000C")
                    .replace("\r", "\\u000D").replace("\"", "\\u0022")
                    .replace("%", "\\u0025").replace("&", "\\u0026").replace("'", "\\u0027")
                    .replace("/", "\\u002F").replace("<", "\\u003C").replace(">", "\\u003E");
        }
    }

}
