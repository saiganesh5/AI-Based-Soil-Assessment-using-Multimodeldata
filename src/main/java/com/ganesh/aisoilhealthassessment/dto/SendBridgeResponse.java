package com.ganesh.aisoilhealthassessment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class SendBridgeResponse {
    private String email;
    @JsonProperty("valid_syntax")
    private boolean validSyntax;
    @JsonProperty("valid_tld")
    private boolean validTld;
    @JsonProperty("mx_server")
    private String mxServer;
    private boolean freemail;
    private boolean catchall;
    @JsonProperty("a_valid")
    private Boolean aValid;
    @JsonProperty("temporarily_undeliverable")
    private boolean temporarilyUndeliverable;
    private boolean greylisted;
    @JsonProperty("rcpt_exists")
    private boolean rcptExists;
    @JsonProperty("rcpt_status_code")
    private int rcptStatusCode;
    @JsonProperty("mx_valid")
    private boolean mxValid;
    private int score;
    @JsonProperty("time_taken")
    private String timeTaken;
}
