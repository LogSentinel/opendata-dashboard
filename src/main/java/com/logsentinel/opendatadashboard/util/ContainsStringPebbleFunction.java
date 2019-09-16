package com.logsentinel.opendatadashboard.util;

import com.mitchellbosecke.pebble.extension.Function;
import com.mitchellbosecke.pebble.template.EvaluationContext;
import com.mitchellbosecke.pebble.template.PebbleTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Custom Pebble function for checking if string.contains(..)
 */
public class ContainsStringPebbleFunction implements Function {

    private static final String STRING = "string";
    private static final String SUBSTRING = "substring";

    private final List<String> argumentNames = Arrays.asList(STRING, SUBSTRING);
    
    @Override
    public List<String> getArgumentNames() {
        return argumentNames;
    }

    @Override
    public Object execute(Map<String, Object> args, PebbleTemplate self, EvaluationContext context, int lineNumber) {
        String firstString = (String) args.get(STRING);
        String secondString = (String) args.get(SUBSTRING);
        if (firstString == null || secondString == null) {
            return false;
        }
        return firstString.contains(secondString);
    }
}
