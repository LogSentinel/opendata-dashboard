package com.logsentinel.opendatadashboard.service;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.logsentinel.opendatadashboard.data.Record;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.Iterator;
import java.util.zip.GZIPInputStream;


@Service
public class JSONStreamIterator {

    private String recordsURL;
    private Iterator<Record> streamIterator;
    private int seek;

    public JSONStreamIterator() {
        this.recordsURL = "https://auditlog-ls.egov.bg/opendata/application/cc02fc50-5cd4-11e8-bf32-256719737274";
        this.seek=0;

        try {
            InitIterator();
        } catch (IOException ioe) {
            System.out.println(ioe.getMessage());
        }
    }


    private void InitIterator() throws IOException {
        InputStreamReader inputStreamReader = new InputStreamReader(new GZIPInputStream(new URL(recordsURL).openStream()));

        ObjectMapper mapper = new ObjectMapper();
        JsonFactory factory = new JsonFactory();

        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        factory.disable(JsonParser.Feature.AUTO_CLOSE_SOURCE);

        JsonParser parser = factory.createParser(inputStreamReader);
        parser.setCodec(mapper);

        //seeking iterator to start of first object
        JsonToken token = parser.nextToken();

        if (token == null) throw new IOException("Invalid JSON.");
        if (!JsonToken.START_ARRAY.equals(token)) throw new IOException("JSON is not an array.");

        do {token = parser.nextToken();}
        while (JsonToken.START_OBJECT.equals(token));

        //setting iterator to parse Record class
        this.streamIterator = parser.readValuesAs(Record.class);
    }

    public Record next() {
        if (this.streamIterator != null) {
            this.seek++;
            Record record = null;
            try {
                record = this.streamIterator.next();
            } catch (Exception e) {
                System.out.println(e.getMessage());
            }
                return record;
            }
            return null;
        }


    public int getSeek() {
        return seek;
    }
}
