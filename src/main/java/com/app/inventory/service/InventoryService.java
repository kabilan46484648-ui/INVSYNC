package com.app.inventory.service;

import com.app.inventory.dto.AppDtos;
import com.app.inventory.dto.AppMapper;
import com.app.inventory.exception.ResourceNotFoundException;
import com.app.inventory.model.*;
import com.app.inventory.repository.ProductRepository;
import com.app.inventory.repository.SaleRepository;
import com.app.inventory.repository.StockLevelRepository;
import com.app.inventory.repository.StockMovementRepository;
import com.app.inventory.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final StockLevelRepository stockLevelRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final StockMovementRepository stockMovementRepository;
    private final SaleRepository saleRepository;
    private final AppMapper appMapper;

    @Transactional
    public AppDtos.StockLevelDto addStockLevel(AppDtos.StockLevelDto dto) {
        Product product = findProduct(dto.productId());
        Warehouse warehouse = findWarehouse(dto.warehouseId());

        StockLevel stockLevel = stockLevelRepository.findByProductIdAndWarehouseId(dto.productId(), dto.warehouseId())
                .orElseGet(() -> StockLevel.builder()
                        .product(product)
                        .warehouse(warehouse)
                        .quantity(0)
                        .lowStockThreshold(resolveThreshold(product, dto.lowStockThreshold()))
                        .build());

        stockLevel.setLowStockThreshold(resolveThreshold(product, dto.lowStockThreshold()));
        stockLevel.setQuantity(dto.quantity());

        return appMapper.toDto(stockLevelRepository.save(stockLevel));
    }

    public List<AppDtos.StockOverviewDto> getCurrentStock() {
        return stockLevelRepository.findAllDetailed().stream()
                .map(level -> {
                    BigDecimal unitPrice = level.getProduct().getPrice() == null ? BigDecimal.ZERO : level.getProduct().getPrice();
                    BigDecimal stockValue = unitPrice.multiply(BigDecimal.valueOf(level.getQuantity()));
                    return new AppDtos.StockOverviewDto(
                            level.getId(),
                            level.getProduct().getId(),
                            level.getProduct().getSku(),
                            level.getProduct().getName(),
                            level.getProduct().getUnit(),
                            level.getWarehouse().getId(),
                            level.getWarehouse().getName(),
                            0,
                            quantityFor(level, List.of(MovementType.PURCHASE_RECEIPT, MovementType.ADJUSTMENT_IN)),
                            quantityFor(level, List.of(MovementType.ISSUE, MovementType.SALE, MovementType.ADJUSTMENT_OUT)),
                            level.getQuantity(),
                            level.getLowStockThreshold(),
                            unitPrice,
                            stockValue
                    );
                })
                .toList();
    }

    @Transactional
    public AppDtos.StockMovementDto recordStockOut(AppDtos.StockMovementRequestDto dto) {
        MovementType movementType = parseMovementType(dto.movementType(), List.of(MovementType.ISSUE, MovementType.SALE));
        return createMovement(dto, movementType, -dto.quantity(), dto.unitCost(), null);
    }

    @Transactional
    public AppDtos.StockMovementDto recordAdjustment(AppDtos.StockMovementRequestDto dto) {
        MovementType movementType = parseMovementType(dto.movementType(), List.of(MovementType.ADJUSTMENT_IN, MovementType.ADJUSTMENT_OUT));
        int signedQuantity = movementType == MovementType.ADJUSTMENT_IN ? dto.quantity() : -dto.quantity();
        return createMovement(dto, movementType, signedQuantity, dto.unitCost(), null);
    }

    @Transactional
    public void recordPurchaseReceipt(Long productId, Long warehouseId, Integer quantity, BigDecimal unitCost, String referenceNumber, LocalDate movementDate, String notes) {
        AppDtos.StockMovementRequestDto dto = new AppDtos.StockMovementRequestDto(
                productId,
                warehouseId,
                quantity,
                MovementType.PURCHASE_RECEIPT.name(),
                movementDate,
                unitCost,
                notes
        );
        createMovement(dto, MovementType.PURCHASE_RECEIPT, quantity, unitCost, referenceNumber);
    }

    public List<AppDtos.StockMovementDto> getMovementHistory() {
        return stockMovementRepository.findAllDetailed().stream()
                .map(this::toMovementDto)
                .toList();
    }

    /**
     * Low-Stock Intelligence: Scans and reports items below thresholds.
     */
    public List<AppDtos.LowStockAlertDto> scanForLowStock() {
        return stockLevelRepository.findLowStockLevels().stream()
                .map(s -> new AppDtos.LowStockAlertDto(
                        s.getId(),
                        s.getProduct().getName(),
                        s.getWarehouse().getName(),
                        s.getQuantity(),
                        s.getLowStockThreshold(),
                        s.getProduct().getSku()
                ))
                .toList();
    }

    public BigDecimal totalStockValue(List<StockLevel> levels) {
        return levels.stream()
                .map(level -> (level.getProduct().getPrice() == null ? BigDecimal.ZERO : level.getProduct().getPrice())
                        .multiply(BigDecimal.valueOf(level.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private AppDtos.StockMovementDto createMovement(AppDtos.StockMovementRequestDto dto, MovementType movementType, int signedQuantity, BigDecimal unitCost, String referenceNumber) {
        Product product = findProduct(dto.productId());
        Warehouse warehouse = findWarehouse(dto.warehouseId());
        StockLevel stockLevel = stockLevelRepository.findByProductIdAndWarehouseId(dto.productId(), dto.warehouseId())
                .orElseGet(() -> StockLevel.builder()
                        .product(product)
                        .warehouse(warehouse)
                        .quantity(0)
                        .lowStockThreshold(product.getMinStockLevel())
                        .build());

        int newQuantity = stockLevel.getQuantity() + signedQuantity;
        if (newQuantity < 0) {
            throw new IllegalArgumentException("Stock cannot go below zero for " + product.getName());
        }

        stockLevel.setLowStockThreshold(resolveThreshold(product, stockLevel.getLowStockThreshold()));
        stockLevel.setQuantity(newQuantity);
        StockLevel savedLevel = stockLevelRepository.save(stockLevel);

        StockMovement movement = StockMovement.builder()
                .product(product)
                .warehouse(warehouse)
                .movementType(movementType)
                .quantity(dto.quantity())
                .balanceAfter(newQuantity)
                .unitCost(unitCost)
                .referenceNumber(referenceNumber)
                .notes(dto.notes())
                .movementDate(dto.movementDate() == null ? LocalDate.now() : dto.movementDate())
                .build();
        StockMovement savedMovement = stockMovementRepository.save(movement);

        if (movementType == MovementType.SALE) {
            saleRepository.save(Sale.builder()
                    .product(product)
                    .quantity(dto.quantity())
                    .saleDate(savedMovement.getMovementDate())
                    .build());
        }

        return toMovementDto(savedMovement);
    }

    private AppDtos.StockMovementDto toMovementDto(StockMovement movement) {
        return new AppDtos.StockMovementDto(
                movement.getId(),
                movement.getProduct().getId(),
                movement.getProduct().getName(),
                movement.getProduct().getSku(),
                movement.getWarehouse().getId(),
                movement.getWarehouse().getName(),
                movement.getMovementType().name(),
                movement.getQuantity(),
                movement.getBalanceAfter(),
                movement.getUnitCost(),
                movement.getReferenceNumber(),
                movement.getNotes(),
                movement.getMovementDate()
        );
    }

    private int quantityFor(StockLevel level, List<MovementType> types) {
        return stockMovementRepository.findAllDetailed().stream()
                .filter(movement -> movement.getProduct().getId().equals(level.getProduct().getId()))
                .filter(movement -> movement.getWarehouse().getId().equals(level.getWarehouse().getId()))
                .filter(movement -> types.contains(movement.getMovementType()))
                .mapToInt(StockMovement::getQuantity)
                .sum();
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }

    private Warehouse findWarehouse(Long id) {
        return warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found: " + id));
    }

    private int resolveThreshold(Product product, Integer requestedThreshold) {
        if (requestedThreshold != null && requestedThreshold > 0) {
            return requestedThreshold;
        }
        return product.getMinStockLevel();
    }

    private MovementType parseMovementType(String rawType, List<MovementType> allowedTypes) {
        MovementType parsedType = MovementType.valueOf(rawType.toUpperCase());
        if (!allowedTypes.contains(parsedType)) {
            throw new IllegalArgumentException("Unsupported movement type: " + rawType);
        }
        return parsedType;
    }
}
