package com.pulseos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PulseOsApplication {

    public static void main(String[] args) {
        SpringApplication.run(PulseOsApplication.class, args);
    }
}
