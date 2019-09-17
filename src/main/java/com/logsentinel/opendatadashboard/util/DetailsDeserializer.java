package com.logsentinel.opendatadashboard.util;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.logsentinel.opendatadashboard.data.AuditLogEntryDetails;

import java.io.IOException;
import java.util.Iterator;

public class DetailsDeserializer<Object> extends JsonDeserializer<Object> {
    @Override
    public Object deserialize(JsonParser jsonParser, DeserializationContext deserializationContext) throws IOException, JsonProcessingException {
        String text = jsonParser.getText();
        if (text.equals("anonymized")) {
            return (Object) "anonymized";
        }

        AuditLogEntryDetails details = new AuditLogEntryDetails();
        ObjectMapper mapper = new ObjectMapper();
        details = mapper.readValue(text, AuditLogEntryDetails.class);
        return (Object) details;

    }
}
