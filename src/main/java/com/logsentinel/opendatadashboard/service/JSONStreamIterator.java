package com.logsentinel.opendatadashboard.service;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.logsentinel.opendatadashboard.data.AuditLogEntry;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.Iterator;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.GZIPInputStream;


@Service
public class JSONStreamIterator {

    private String recordsPath;
    private Iterator<AuditLogEntry> streamIterator;
    private int seekIndex;

    public JSONStreamIterator() {
        this.recordsPath = "/home/daniel/opendataLogs";
        this.seekIndex = 0;

        try {
            InitIterator();
        } catch (IOException ioe) {
            System.out.println(ioe.getMessage());
        }
    }


    private void InitIterator() throws IOException {

        File file=new File(this.recordsPath);
        InputStreamReader inputStreamReader = new InputStreamReader(new GZIPInputStream(new FileInputStream(file)));

        ObjectMapper mapper = new ObjectMapper();
        JsonFactory factory = new JsonFactory();

        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        factory.disable(JsonParser.Feature.AUTO_CLOSE_SOURCE);

        JsonParser parser = factory.createParser(inputStreamReader);
        parser.setCodec(mapper);

        //seeking iterator to start of first object
        JsonToken token = parser.nextToken();

        if (token == null) {
            throw new IOException("Invalid JSON.");
        }
        if (!JsonToken.START_ARRAY.equals(token)) {
            throw new IOException("JSON is not an array.");
        }

        do {
            token = parser.nextToken();
        }
        while (JsonToken.START_OBJECT.equals(token));

        //setting iterator to parse AuditLogEntry class
        this.streamIterator = parser.readValuesAs(AuditLogEntry.class);
    }

    public AuditLogEntry next() {
        if (this.streamIterator != null) {
            this.seekIndex++;
            AuditLogEntry entry = null;
            try {
                entry = this.streamIterator.next();
            } catch (Exception e) {
                Logger logger = Logger.getLogger(this.getClass().getName());
                logger.log(Level.FINE,e.getMessage());
            }
            return entry;
        }
        return null;
    }


    public int getSeek() {
        return seekIndex;
    }
}
