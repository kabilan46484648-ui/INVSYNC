package com.app.inventory.controller;

import com.app.inventory.dto.AppDtos.LowStockAlertDto;
import com.app.inventory.dto.AppDtos.StockLevelDto;
import com.app.inventory.dto.AppDtos.StockMovementDto;
import com.app.inventory.dto.AppDtos.StockMovementRequestDto;
import com.app.inventory.dto.AppDtos.StockOverviewDto;
import com.app.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/stock")
    public ResponseEntity<StockLevelDto> addStockLevel(@Valid @RequestBody StockLevelDto dto) {
        return new ResponseEntity<>(inventoryService.addStockLevel(dto), HttpStatus.CREATED);
    }

    @GetMapping("/stock")
    public ResponseEntity<List<StockOverviewDto>> getCurrentStock() {
        return ResponseEntity.ok(inventoryService.getCurrentStock());
    }

    @PostMapping("/stock-out")
    public ResponseEntity<StockMovementDto> recordStockOut(@Valid @RequestBody StockMovementRequestDto dto) {
        return new ResponseEntity<>(inventoryService.recordStockOut(dto), HttpStatus.CREATED);
    }

    @PostMapping("/adjustments")
    public ResponseEntity<StockMovementDto> recordAdjustment(@Valid @RequestBody StockMovementRequestDto dto) {
        return new ResponseEntity<>(inventoryService.recordAdjustment(dto), HttpStatus.CREATED);
    }

    @GetMapping("/movements")
    public ResponseEntity<List<StockMovementDto>> getMovementHistory() {
        return ResponseEntity.ok(inventoryService.getMovementHistory());
    }

    @GetMapping("/low-stock-alerts")
    public ResponseEntity<List<LowStockAlertDto>> getLowStockAlerts() {
        return ResponseEntity.ok(inventoryService.scanForLowStock());
    }
}
