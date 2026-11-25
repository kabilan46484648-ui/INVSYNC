package com.app.inventory.service;

import com.app.inventory.dto.AppDtos;
import com.app.inventory.repository.ProductRepository;
import com.app.inventory.repository.PurchaseOrderRepository;
import com.app.inventory.repository.SaleRepository;
import com.app.inventory.repository.StockLevelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final SaleRepository saleRepository;
    private final StockLevelRepository stockLevelRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    public List<AppDtos.SalesTrendProjection> getSalesTrends() {
        return saleRepository.findSalesTrends();
    }

    public AppDtos.DashboardOverviewDto getOverview() {
        long lowStockCount = inventoryService.scanForLowStock().size();
        long pendingPurchaseOrders = purchaseOrderRepository.countByStatusIn(List.of(
                com.app.inventory.model.PurchaseOrderStatus.ORDERED,
                com.app.inventory.model.PurchaseOrderStatus.PARTIALLY_RECEIVED
        ));
        long salesToday = saleRepository.findAll().stream()
                .filter(sale -> sale.getSaleDate().isEqual(LocalDate.now()))
                .mapToLong(sale -> sale.getQuantity())
                .sum();

        int stockInToday = inventoryService.getMovementHistory().stream()
                .filter(movement -> movement.movementDate().isEqual(LocalDate.now()))
                .filter(movement -> List.of("PURCHASE_RECEIPT", "ADJUSTMENT_IN").contains(movement.movementType()))
                .mapToInt(AppDtos.StockMovementDto::quantity)
                .sum();

        int stockOutToday = inventoryService.getMovementHistory().stream()
                .filter(movement -> movement.movementDate().isEqual(LocalDate.now()))
                .filter(movement -> List.of("ISSUE", "SALE", "ADJUSTMENT_OUT").contains(movement.movementType()))
                .mapToInt(AppDtos.StockMovementDto::quantity)
                .sum();

        return new AppDtos.DashboardOverviewDto(
                inventoryService.totalStockValue(stockLevelRepository.findAllDetailed()),
                productRepository.count(),
                lowStockCount,
                pendingPurchaseOrders,
                salesToday,
                (long) stockInToday,
                (long) stockOutToday
        );
    }
}
