package com.ganesh.aisoilhealthassessment;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

public class DecodeURL{
    public static void main(String[] args) {

//        String encoded = "aHR0cHM6Ly9zaW1wbGlmeWluZ3NraWxscy5jb20~";
//
//        // remove trailing "~"
//        encoded = encoded.replace("~", "");
//
//        byte[] decodedBytes = Base64.getDecoder().decode(encoded);
//
//        String decodedUrl = new String(decodedBytes);
//
//        System.out.println("Original URL: " + decodedUrl);

        List<String> list1 = Arrays.asList("A","B","C");
        list1.set(0,"Z");
        System.out.println(list1);

        List<String> list2 = List.of("A","B","C");
        list2.set(0,"Z");
        System.out.println(list2);


    }
}