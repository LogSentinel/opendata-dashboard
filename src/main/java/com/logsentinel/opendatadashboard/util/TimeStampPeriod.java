package com.logsentinel.opendatadashboard.util;

public class TimeStampPeriod {
    Long start;
    Long end;

    // if end=0 - no upper bound
    public TimeStampPeriod(long start, long end) {
        assert (start < end || (start > 0 && end == 0) || (start == 0 && end == 0));
        this.start = start;
        this.end = end;

    }

    public int fits(Long stamp) {
        if (start == 0 && end == 0) return 0;
        if (stamp < start) return -1;
        if (stamp > end && end != 0) return 1;
        return 0;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof TimeStampPeriod) {
            return this.start.equals(((TimeStampPeriod) obj).start) &&
                    this.end.equals(((TimeStampPeriod) obj).end);
        }
        return false;
    }

    @Override
    public int hashCode() {
        return start.hashCode() * end.hashCode();
    }
}
