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

    private Server server;

    @Bean
    public Server h2TcpServer() {
        try {
            log.info("Starting H2 TCP Server on port 9092 for external DBeaver / DataGrip connections...");
            this.server = Server.createTcpServer("-tcp", "-tcpAllowOthers", "-tcpPort", "9092");
            this.server.start();
            return this.server;
        } catch (SQLException e) {
            log.warn("H2 TCP Server on port 9092 could not start (port in use or background instance active): {}", e.getMessage());
            return null;
        }
    }

    @jakarta.annotation.PreDestroy
    public void stopServer() {
        if (server != null && server.isRunning(false)) {
            server.stop();
        }
    }
}
