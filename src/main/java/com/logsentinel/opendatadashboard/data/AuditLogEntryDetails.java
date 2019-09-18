package com.logsentinel.opendatadashboard.data;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AuditLogEntryDetails {

    @JsonProperty("@timestamp")
    public String timestamp;
    @JsonProperty("@version")
    public String version;
    @JsonProperty("apiServiceCallId")
    public String apiServiceCallId;
    @JsonProperty("apiServiceOperationID")
    public String apiServiceOperationID;
    @JsonProperty("clientIPAddres")
    public String clientIPAddres;
    @JsonProperty("consumer")
    public String consumer;
    @JsonProperty("consumerAdministration")
    public String consumerAdministration;
    @JsonProperty("consumerCertificateID")
    public String consumerCertificateID;
    @JsonProperty("consumerOID")
    public String consumerOID;
    @JsonProperty("contextAdministrationName")
    public String contextAdministrationName;
    @JsonProperty("contextAdministrationOID")
    public String contextAdministrationOID;
    @JsonProperty("contextEmployeeIdentifier")
    public String contextEmployeeIdentifier;
    @JsonProperty("contextEmployeeNames")
    public String contextEmployeeNames;
    @JsonProperty("contextEmployeePosition")
    public String contextEmployeePosition;
    @JsonProperty("contextLawReason")
    public String contextLawReason;
    @JsonProperty("contextServiceType")
    public String contextServiceType;
    @JsonProperty("contextServiceURI")
    public String contextServiceURI;
    @JsonProperty("fullContractName")
    public String fullContractName;
    @JsonProperty("host")
    public String host;
    @JsonProperty("identifier")
    public String identifier;
    @JsonProperty("identifierType")
    public String identifierType;
    @JsonProperty("producer")
    public String producer;
    @JsonProperty("producerAdministration")
    public String producerAdministration;
    @JsonProperty("reportName")
    public String reportName;
    @JsonProperty("request")
    public String request;
    @JsonProperty("startTime")
    public String startTime;


    public AuditLogEntryDetails() {
    }

    @Override
    public String toString() {
        return "{" +
                "apiServiceCallId='" + apiServiceCallId + '\'' +
                ", apiServiceOperationID='" + apiServiceOperationID + '\'' +
                ", clientIPAddres='" + clientIPAddres + '\'' +
                ", consumer='" + consumer + '\'' +
                ", consumerAdministration='" + consumerAdministration + '\'' +
                ", consumerCertificateID='" + consumerCertificateID + '\'' +
                ", consumerOID='" + consumerOID + '\'' +
                ", contextAdministrationName='" + contextAdministrationName + '\'' +
                ", contextAdministrationOID='" + contextAdministrationOID + '\'' +
                ", contextEmployeeIdentifier='" + contextEmployeeIdentifier + '\'' +
                ", contextEmployeeNames='" + contextEmployeeNames + '\'' +
                ", contextEmployeePosition='" + contextEmployeePosition + '\'' +
                ", contextLawReason='" + contextLawReason + '\'' +
                ", contextServiceType='" + contextServiceType + '\'' +
                ", contextServiceURI='" + contextServiceURI + '\'' +
                ", fullContractName='" + fullContractName + '\'' +
                ", host='" + host + '\'' +
                ", identifier='" + identifier + '\'' +
                ", identifierType='" + identifierType + '\'' +
                ", producer='" + producer + '\'' +
                ", producerAdministration='" + producerAdministration + '\'' +
                ", reportName='" + reportName + '\'' +
                ", request='" + request + '\'' +
                ", startTime='" + startTime + '\'' +
                '}';
    }
}
