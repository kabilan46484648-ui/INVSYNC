package com.app.inventory.controller;

import com.app.inventory.dto.AppDtos.SalesTrendProjection;
import com.app.inventory.dto.AppDtos.DashboardOverviewDto;
import com.app.inventory.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/sales-trends")
    public ResponseEntity<List<SalesTrendProjection>> getSalesTrends() {
        return ResponseEntity.ok(dashboardService.getSalesTrends());
    }

    @GetMapping("/overview")
    public ResponseEntity<DashboardOverviewDto> getOverview() {
        return ResponseEntity.ok(dashboardService.getOverview());
    }
}
