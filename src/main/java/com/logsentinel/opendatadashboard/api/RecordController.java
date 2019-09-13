package com.logsentinel.opendatadashboard.api;

import com.logsentinel.opendatadashboard.data.Record;
import com.logsentinel.opendatadashboard.service.JSONStreamIterator;
import com.logsentinel.opendatadashboard.util.SearchUtil;
import com.logsentinel.opendatadashboard.util.TimeStampPeriod;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Controller
@Scope("session")
public class RecordController {

    private JSONStreamIterator JSIT;
    private int pageSize;
    private int currentPage;
    private String currentKeyword;
    private TimeStampPeriod currentPeriod;
    private List<Record> currentRecords;

    public RecordController() {
        this.pageSize = 30;
        this.currentPage = 0;
        currentKeyword = "";
        JSIT = new JSONStreamIterator();
        this.currentRecords = new ArrayList<>();
        this.currentPeriod = new TimeStampPeriod(0, 0);
    }

    @RequestMapping(value = "/", method = RequestMethod.GET)
    public ModelAndView search(@RequestParam(value = "page", required = false, defaultValue = "1") Integer page,
                               @RequestParam(value = "keyWord", required = false, defaultValue = "") String keyword,
                               @RequestParam(value = "start", required = false, defaultValue = "0") Long startTimestamp,
                               @RequestParam(value = "end", required = false, defaultValue = "0") Long endTimestamp) {

        TimeStampPeriod queryPeriod = new TimeStampPeriod(startTimestamp, endTimestamp);

        if (!currentPeriod.equals(queryPeriod)) resetIterator();
        if (!currentKeyword.equals(keyword)) resetIterator();
        if (page < currentPage) resetIterator();

        currentPeriod = queryPeriod;
        currentKeyword = keyword;

        Map<String, Object> model = new HashMap<>();

        if (page > this.currentPage) {
            this.currentRecords = new ArrayList<>();
            int seeksLeft=(page - currentPage) * pageSize;

            while (seeksLeft > 0) {
                Record currentRecord = this.JSIT.next();
                if (currentRecord == null) break;
                if (this.currentPeriod.fits(Long.parseLong(currentRecord.getTimestamp())) < 0) break;
                if (this.currentPeriod.fits(Long.parseLong(currentRecord.getTimestamp())) == 0 && SearchUtil.fits(currentRecord, keyword)) {
                    if(seeksLeft<=pageSize) currentRecords.add(currentRecord);
                    seeksLeft--;
                }
            }

            currentPage = page;
        }


        model.put("logEntries", currentRecords);
        model.put("currentPage", currentPage);
        model.put("searchString", currentKeyword);
        model.put("startTimestamp", startTimestamp);
        model.put("endTimestamp", endTimestamp);

        return new ModelAndView("dashboard", model);

    }

    private void resetIterator() {
        currentPage = 0;
        this.JSIT = new JSONStreamIterator();
    }
}
