package com.app.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class AppDtos {

    public record SupplierDto(
            Long id,
            @NotBlank String name,
            String contactEmail,
            String phoneNumber
    ) {}

    public record ProductDto(
            Long id,
            @NotBlank String sku,
            @NotBlank String name,
            @NotBlank String unit,
            @NotNull @Min(0) Integer minStockLevel,
            String category,
            BigDecimal price,
            Long supplierId,
            String supplierName,
            Boolean active
    ) {}

    public record WarehouseDto(
            Long id,
            @NotBlank String name,
            String location
    ) {}

    public record UserAccountDto(
            Long id,
            @NotBlank String name,
            @NotBlank String email,
            @NotBlank String role
    ) {}

    public record StockLevelDto(
            Long id,
            @NotNull Long productId,
            @NotNull Long warehouseId,
            @NotNull Integer quantity,
            @NotNull Integer lowStockThreshold,
            String productName,
            String warehouseName,
            String sku
    ) {}

    public record StockOverviewDto(
            Long stockLevelId,
            Long productId,
            String sku,
            String productName,
            String unit,
            Long warehouseId,
            String warehouseName,
            Integer openingStock,
            Integer stockIn,
            Integer stockOut,
            Integer currentQuantity,
            Integer minStockLevel,
            BigDecimal unitPrice,
            BigDecimal stockValue
    ) {}

    public record StockMovementRequestDto(
            @NotNull Long productId,
            @NotNull Long warehouseId,
            @NotNull @Min(1) Integer quantity,
            @NotBlank String movementType,
            LocalDate movementDate,
            BigDecimal unitCost,
            String notes
    ) {}

    public record StockMovementDto(
            Long id,
            Long productId,
            String productName,
            String sku,
            Long warehouseId,
            String warehouseName,
            String movementType,
            Integer quantity,
            Integer balanceAfter,
            BigDecimal unitCost,
            String referenceNumber,
            String notes,
            LocalDate movementDate
    ) {}

    public record LowStockAlertDto(
            Long stockLevelId,
            String productName,
            String warehouseName,
            Integer currentQuantity,
            Integer threshold,
            String sku
    ) {}

    public record PurchaseOrderLineDto(
            Long id,
            @NotNull Long productId,
            String productName,
            String sku,
            @NotNull Long warehouseId,
            String warehouseName,
            @NotNull @Min(1) Integer orderedQuantity,
            Integer receivedQuantity,
            @NotNull @DecimalMin("0.0") BigDecimal unitCost
    ) {}

    public record PurchaseOrderDto(
            Long id,
            String poNumber,
            @NotNull Long supplierId,
            String supplierName,
            String status,
            LocalDate orderDate,
            LocalDate expectedDate,
            LocalDate receivedDate,
            String notes,
            @NotEmpty List<@Valid PurchaseOrderLineDto> lines
    ) {}

    public record PurchaseReceiptDto(
            LocalDate receivedDate
    ) {}

    public record DashboardOverviewDto(
            BigDecimal totalStockValue,
            Long activeItems,
            Long lowStockAlerts,
            Long pendingPurchaseOrders,
            Long salesToday,
            Long stockInToday,
            Long stockOutToday
    ) {}

    public record ReportSummaryDto(
            Integer openingStock,
            Integer stockIn,
            Integer stockOut,
            Integer adjustments,
            Integer currentStock,
            BigDecimal stockValue
    ) {}

    public record StockValueDto(
            Long productId,
            String sku,
            String productName,
            Integer quantity,
            BigDecimal unitPrice,
            BigDecimal totalValue
    ) {}

    /**
     * Spring Data JPA Projection interface for the JPQL grouping query
     */
    public interface SalesTrendProjection {
        LocalDate getSaleDate();
        String getCategory();
        Long getTotalQuantitySold();
    }
}
