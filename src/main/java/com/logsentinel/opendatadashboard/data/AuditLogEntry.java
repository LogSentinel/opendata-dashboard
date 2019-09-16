package com.logsentinel.opendatadashboard.data;


import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.Arrays;

public class AuditLogEntry {
    private String id;
    private String timestamp;
    private String action;
    private String actorId;
    private String[] actorRoles;
    private String entityId;
    private String entityType;
    private String details;
    private String applicationId;
    private String ipAddress;
    private String actorDisplayName;
    private String entryType;
    private int hashVersion;
    private String previousEntryId;
    private String hash;
    private String timestampGroupHash;
    private String timestampTokenId;
    private String timestampTime;
    private int timestampGroupSize;
    private int estimatedEntrySize;
    @JsonIgnore
    private String numericParams;
    private String standaloneHash;

    public AuditLogEntry(String id, String timestamp, String action, String actorId, String[] actorRoles, String entityId, String entityType, String details, String applicationId, String ipAddress, String actorDisplayName, String entryType, int hashVersion, String previousEntryId, String hash, String timestampGroupHash, String timestampTokenId, String timestampTime, int timestampGroupSize, int estimatedEntrySize, String numericParams, String standaloneHash) {
        super();
        this.setId(id);
        this.setTimestamp(timestamp);
        this.setAction(action);
        this.setActorId(actorId);
        this.setActorRoles(actorRoles);
        this.setEntityId(entityId);
        this.setEntityType(entityType);
        this.setDetails(details);
        this.setApplicationId(applicationId);
        this.setIpAddress(ipAddress);
        this.setActorDisplayName(actorDisplayName);
        this.setEntryType(entryType);
        this.setHashVersion(hashVersion);
        this.setPreviousEntryId(previousEntryId);
        this.setHash(hash);
        this.setTimestampGroupHash(timestampGroupHash);
        this.setTimestampTokenId(timestampTokenId);
        this.setTimestampTime(timestampTime);
        this.setTimestampGroupSize(timestampGroupSize);
        this.setEstimatedEntrySize(estimatedEntrySize);
        this.numericParams=numericParams;
        this.setStandaloneHash(standaloneHash);
    }
    public AuditLogEntry(){}

    public void setId(String id) {
        this.id = id;
    }
    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
    public void setAction(String action) {
        this.action = action;
    }
    public void setActorId(String actorId) {
        this.actorId = actorId;
    }
    public void setActorRoles(String[] actorRoles) {
        this.actorRoles = actorRoles;
    }
    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }
    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }
    public void setDetails(String details) {
        this.details = details;
    }
    public void setApplicationId(String applicationId) {
        this.applicationId = applicationId;
    }
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
    public void setActorDisplayName(String actorDisplayName) {
        this.actorDisplayName = actorDisplayName;
    }
    public void setEntryType(String entryType) {
        this.entryType = entryType;
    }
    public void setHashVersion(int hashVersion) {
        this.hashVersion = hashVersion;
    }
    public void setPreviousEntryId(String previousEntryId) {
        this.previousEntryId = previousEntryId;
    }
    public void setHash(String hash) {
        this.hash = hash;
    }
    public void setTimestampGroupHash(String timestampGroupHash) {
        this.timestampGroupHash = timestampGroupHash;
    }
    public void setTimestampTokenId(String timestampTokenId) {
        this.timestampTokenId = timestampTokenId;
    }
    public void setTimestampTime(String timestampTime) {
        this.timestampTime = timestampTime;
    }
    public void setTimestampGroupSize(int timestampGroupSize) {
        this.timestampGroupSize = timestampGroupSize;
    }
    public void setEstimatedEntrySize(int estimatedEntrySize) {
        this.estimatedEntrySize = estimatedEntrySize;
    }
    public void setStandaloneHash(String standaloneHash) {
        this.standaloneHash = standaloneHash;
    }


    public String getId() {
        return id;
    }

    public String getTimestamp() {
        return timestamp;
    }
    public String getAction() {
        return action==null?"":action;
    }

    public String getActorId() {
        return actorId;
    }

    public String[] getActorRoles() {
        return actorRoles;
    }

    public String getEntityId() {
        return entityId;
    }
    public String getEntityType() {
        return entityType;
    }

    public String getDetails() {
        return details;
    }

    public String getApplicationId() {
        return applicationId;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public String getActorDisplayName() {
        return actorDisplayName;
    }

    public String getEntryType() {
        return entryType;
    }

    public int getHashVersion() {
        return hashVersion;
    }

    public String getPreviousEntryId() {
        return previousEntryId;
    }

    public String getHash() {
        return hash;
    }

    public String getTimestampGroupHash() {
        return timestampGroupHash;
    }

    public String getTimestampTokenId() {
        return timestampTokenId;
    }

    public String getTimestampTime() {
        return timestampTime;
    }

    public int getTimestampGroupSize() {
        return timestampGroupSize;
    }

    public int getEstimatedEntrySize() {
        return estimatedEntrySize;
    }

    public String getStandaloneHash() {
        return standaloneHash;
    }

    @Override
    public String toString() {
        return "Record{" +
                "id='" + id + '\'' +
                ", timestamp='" + timestamp + '\'' +
                ", actorId='" + actorId + '\'' +
                ", actorRoles=" + Arrays.toString(actorRoles) +
                ", entityId='" + entityId + '\'' +
                ", entityType='" + entityType + '\'' +
                ", details='" + details + '\'' +
                ", applicationId='" + applicationId + '\'' +
                ", ipAddress='" + ipAddress + '\'' +
                ", actorDisplayName='" + actorDisplayName + '\'' +
                ", entryType='" + entryType + '\'' +
                ", hashVersion=" + hashVersion +
                ", previousEntryId='" + previousEntryId + '\'' +
                ", hash='" + hash + '\'' +
                ", timestampGroupHash='" + timestampGroupHash + '\'' +
                ", timestampTokenId='" + timestampTokenId + '\'' +
                ", timestampTime='" + timestampTime + '\'' +
                ", timestampGroupSize=" + timestampGroupSize +
                ", estimatedEntrySize=" + estimatedEntrySize +
                ", standaloneHash='" + standaloneHash + '\'' +
                '}';
    }
}