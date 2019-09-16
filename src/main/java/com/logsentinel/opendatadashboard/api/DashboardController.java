package com.logsentinel.opendatadashboard.api;

import com.logsentinel.opendatadashboard.data.AuditLogEntry;
import com.logsentinel.opendatadashboard.service.JSONStreamIterator;
import com.logsentinel.opendatadashboard.util.SearchUtil;
import com.logsentinel.opendatadashboard.util.TimestampPeriod;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import java.util.*;


@Controller
@Scope("session")
public class DashboardController {

    private JSONStreamIterator streamIterator;
    private int pageSize;
    private int currentPage;
    private int pagesToStash;
    private String currentKeyword;
    private TimestampPeriod currentPeriod;
    private List<AuditLogEntry> currentPageEntries;
    private Map<Integer, List<AuditLogEntry>> previousPages;

    public DashboardController() {
        this.pageSize = 10;
        this.currentPage = 0;
        this.pagesToStash = 10;
        this.currentKeyword = "";
        this.streamIterator = new JSONStreamIterator();
        this.currentPageEntries = new ArrayList<>();
        this.currentPeriod = new TimestampPeriod(0, 0);
        this.previousPages = new HashMap<>();
    }

    @RequestMapping(value = "/", method = RequestMethod.GET)
    public ModelAndView search(@RequestParam(value = "page", required = false, defaultValue = "1") Integer page,
                               @RequestParam(value = "keyword", required = false, defaultValue = "") String keyword,
                               @RequestParam(value = "start", required = false, defaultValue = "0") Long startTimestamp,
                               @RequestParam(value = "end", required = false, defaultValue = "0") Long endTimestamp) {

        TimestampPeriod queryPeriod = new TimestampPeriod(startTimestamp, endTimestamp);

        if (!currentPeriod.equals(queryPeriod)) resetIterator();
        if (!currentKeyword.equals(keyword)) resetIterator();
        if (page < currentPage && !previousPages.containsKey(page)) resetIterator();

        currentPeriod = queryPeriod;
        currentKeyword = keyword;

        Map<String, Object> model = new HashMap<>();

        if (page > currentPage && !previousPages.containsKey(page)) {
            this.currentPageEntries = new ArrayList<>();
            int seeksLeft = (page - currentPage) * pageSize;

            while (seeksLeft > 0) {
                AuditLogEntry currentEntry = streamIterator.next();
                if (currentEntry == null) {
                    break;
                }
                if (this.currentPeriod.fits(Long.parseLong(currentEntry.getTimestamp())) < 0) {
                    break;
                }
                if (this.currentPeriod.fits(Long.parseLong(currentEntry.getTimestamp())) == 0 && SearchUtil.fits(currentEntry, keyword)) {
                    if (seeksLeft <= pageSize) currentPageEntries.add(currentEntry);
                    seeksLeft--;
                }
            }

            previousPages.put(page, this.currentPageEntries);
        } else {
            currentPageEntries = previousPages.get(page);
        }

        //cleans previous pages that are not close to the current page
        new TreeSet<>(previousPages.keySet()).forEach(key -> {
            if (key < page - pagesToStash || key > page + pagesToStash) {
                previousPages.remove(key);
            }
        });

        currentPage = page;

        model.put("logEntries", currentPageEntries);
        model.put("currentPage", currentPage);
        model.put("searchString", currentKeyword);
        model.put("startTimestamp", startTimestamp);
        model.put("endTimestamp", endTimestamp);

        return new ModelAndView("dashboard", model);

    }

    private void resetIterator() {
        currentPage = 0;
        previousPages = new HashMap<>();
        streamIterator = new JSONStreamIterator();
    }
}
