package com.pulseos.config;

import lombok.extern.slf4j.Slf4j;
import org.h2.tools.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.sql.SQLException;

@Slf4j
@Configuration
@Profile("demo")
public class H2TcpServerConfig {

    /**
     * Starts an H2 TCP Server on port 9092 allowing external GUI tools
     * (e.g., DBeaver, DataGrip, IntelliJ Database Explorer) to connect
     * directly to the running in-memory demo database (jdbc:h2:tcp://localhost:9092/mem:pulseos_db).
     */
    @Bean(initMethod = "start", destroyMethod = "stop")
    public Server h2TcpServer() throws SQLException {
        log.info("Starting H2 TCP Server on port 9092 for external DBeaver / DataGrip connections...");
        return Server.createTcpServer("-tcp", "-tcpAllowOthers", "-tcpPort", "9092");
    }
}
