package com.app.inventory.controller;

import com.app.inventory.dto.AppDtos;
import com.app.inventory.service.ReportsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportsController {

    private final ReportsService reportsService;

    @GetMapping("/summary")
    public ResponseEntity<AppDtos.ReportSummaryDto> getSummary() {
        return ResponseEntity.ok(reportsService.getSummary());
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<AppDtos.LowStockAlertDto>> getLowStockAlerts() {
        return ResponseEntity.ok(reportsService.getLowStockAlerts());
    }

    @GetMapping("/movements")
    public ResponseEntity<List<AppDtos.StockMovementDto>> getMovementHistory() {
        return ResponseEntity.ok(reportsService.getMovementHistory());
    }

    @GetMapping("/stock-value")
    public ResponseEntity<List<AppDtos.StockValueDto>> getStockValueReport() {
        return ResponseEntity.ok(reportsService.getStockValueReport());
    }
}
