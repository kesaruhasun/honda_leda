package com.pulseos.common;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller that forwards client-side React SPA routes to index.html
 * so that page refreshes and direct links work seamlessly when hosted on Render.
 */
@Controller
public class SpaForwardController {

    @GetMapping(value = {
        "/",
        "/physicians",
        "/services",
        "/patient/**",
        "/admin",
        "/staff",
        "/staff/**",
        "/dashboard",
        "/dashboard/**"
    })
    public String forwardSpaRoutes() {
        return "forward:/index.html";
    }
}
