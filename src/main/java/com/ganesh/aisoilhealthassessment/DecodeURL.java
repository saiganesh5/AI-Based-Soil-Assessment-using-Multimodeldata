package com.ganesh.aisoilhealthassessment;

import java.util.Base64;

public class DecodeURL{
    public static void main(String[] args) {

        String encoded = "aHR0cHM6Ly9zaW1wbGlmeWluZ3NraWxscy5jb20~";

        // remove trailing "~"
        encoded = encoded.replace("~", "");

        byte[] decodedBytes = Base64.getDecoder().decode(encoded);

        String decodedUrl = new String(decodedBytes);

        System.out.println("Original URL: " + decodedUrl);
    }
}