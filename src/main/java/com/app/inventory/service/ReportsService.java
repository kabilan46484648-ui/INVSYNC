package com.app.inventory.service;

import com.app.inventory.dto.AppDtos;
import com.app.inventory.model.MovementType;
import com.app.inventory.model.StockLevel;
import com.app.inventory.model.StockMovement;
import com.app.inventory.repository.StockLevelRepository;
import com.app.inventory.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportsService {

    private final StockLevelRepository stockLevelRepository;
    private final StockMovementRepository stockMovementRepository;
    private final InventoryService inventoryService;

    public AppDtos.ReportSummaryDto getSummary() {
        List<StockLevel> levels = stockLevelRepository.findAllDetailed();
        List<StockMovement> movements = stockMovementRepository.findAllDetailed();

        int stockIn = sumMovements(movements, List.of(MovementType.PURCHASE_RECEIPT, MovementType.ADJUSTMENT_IN));
        int stockOut = sumMovements(movements, List.of(MovementType.ISSUE, MovementType.SALE, MovementType.ADJUSTMENT_OUT));
        int adjustments = sumMovements(movements, List.of(MovementType.ADJUSTMENT_IN))
                - sumMovements(movements, List.of(MovementType.ADJUSTMENT_OUT));
        int currentStock = levels.stream().mapToInt(StockLevel::getQuantity).sum();
        BigDecimal stockValue = inventoryService.totalStockValue(levels);

        return new AppDtos.ReportSummaryDto(
                0,
                stockIn,
                stockOut,
                adjustments,
                currentStock,
                stockValue
        );
    }

    public List<AppDtos.LowStockAlertDto> getLowStockAlerts() {
        return inventoryService.scanForLowStock();
    }

    public List<AppDtos.StockMovementDto> getMovementHistory() {
        return inventoryService.getMovementHistory();
    }

    public List<AppDtos.StockValueDto> getStockValueReport() {
        return stockLevelRepository.findAllDetailed().stream()
                .map(level -> new AppDtos.StockValueDto(
                        level.getProduct().getId(),
                        level.getProduct().getSku(),
                        level.getProduct().getName(),
                        level.getQuantity(),
                        level.getProduct().getPrice() == null ? BigDecimal.ZERO : level.getProduct().getPrice(),
                        (level.getProduct().getPrice() == null ? BigDecimal.ZERO : level.getProduct().getPrice())
                                .multiply(BigDecimal.valueOf(level.getQuantity()))
                ))
                .toList();
    }

    private int sumMovements(List<StockMovement> movements, List<MovementType> types) {
        return movements.stream()
                .filter(movement -> types.contains(movement.getMovementType()))
                .mapToInt(StockMovement::getQuantity)
                .sum();
    }
}
