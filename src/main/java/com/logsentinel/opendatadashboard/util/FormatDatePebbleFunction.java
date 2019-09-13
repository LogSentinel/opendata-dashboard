package com.logsentinel.opendatadashboard.util;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import com.mitchellbosecke.pebble.extension.Function;
import com.mitchellbosecke.pebble.template.EvaluationContext;
import com.mitchellbosecke.pebble.template.PebbleTemplate;

/**
 * Custom Pebble function for formatting LocalDateTime instances
 */
public class FormatDatePebbleFunction implements Function {

    private static final String TIMESTAMP_PARAM = "timestamp";
    private static final String TIMEZONE_PARAM = "timezone";
    private static final String FORMAT_PARAM = "format";
    private static final String ISO_FORMAT = "ISO";

    private final List<String> argumentNames = Arrays.asList(TIMESTAMP_PARAM, TIMEZONE_PARAM, FORMAT_PARAM);

    @Override
    public List<String> getArgumentNames() {
        return argumentNames;
    }

    @Override
    public Object execute(Map<String, Object> args, PebbleTemplate self, EvaluationContext context, int lineNumber) {
        String userTimezone = (String) args.get(TIMEZONE_PARAM);

        Object timestampParam;
        if(args.get(TIMESTAMP_PARAM) instanceof String){
            timestampParam=Long.parseLong((String)args.get(TIMESTAMP_PARAM));
        }
        else
        timestampParam = args.get(TIMESTAMP_PARAM);

        if (timestampParam == null) {
            return null;
        }

        LocalDateTime localDateTime;
        if (timestampParam instanceof Long) {
            localDateTime = LocalDateTime.ofInstant(Instant.ofEpochMilli((Long) timestampParam), ZoneId.of("UTC"));
        } else if (timestampParam instanceof LocalDateTime) {
            localDateTime = (LocalDateTime) timestampParam;
        } else {
            throw new IllegalArgumentException("Argument must be either long or LocalDateTime");
        }

        ZonedDateTime zonedDateTime = localDateTime.atZone(ZoneId.of("UTC"))
                .withZoneSameInstant(ZoneId.of(userTimezone));

        String format = (String) args.get(FORMAT_PARAM);
        if (format.equals(ISO_FORMAT)) {
            return DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(zonedDateTime);
        } else {
            return DateTimeFormatter.ofPattern(format).format(zonedDateTime);
        }
    }
}
