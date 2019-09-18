package com.logsentinel.opendatadashboard.util;

import com.logsentinel.opendatadashboard.data.AuditLogEntry;

public class SearchUtil {

    public static boolean fits(AuditLogEntry record, String keyWord) {

        if (keyWord.equals("")) {
            return true;
        }
        for (String kw : keyWord.toLowerCase().split(" ")) {
            if (record.getAction().toLowerCase().contains(kw)) {
                return true;
            }
            if (record.getActorDisplayName().toLowerCase().contains(kw)) {
                return true;
            }
            if (record.getDetails().toString().toLowerCase().contains(kw)) {
                return true;
            }
            if (record.getId().toLowerCase().contains(kw)) {
                return true;
            }
        }

        return false;
    }


}
