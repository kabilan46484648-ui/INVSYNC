package com.app.inventory.service;

import com.app.inventory.dto.AppDtos;
import com.app.inventory.exception.ResourceNotFoundException;
import com.app.inventory.model.*;
import com.app.inventory.repository.ProductRepository;
import com.app.inventory.repository.PurchaseOrderRepository;
import com.app.inventory.repository.SupplierRepository;
import com.app.inventory.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryService inventoryService;

    public List<AppDtos.PurchaseOrderDto> getPurchaseOrders() {
        return purchaseOrderRepository.findAllDetailed().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public AppDtos.PurchaseOrderDto createPurchaseOrder(AppDtos.PurchaseOrderDto dto) {
        Supplier supplier = supplierRepository.findById(dto.supplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + dto.supplierId()));

        PurchaseOrder purchaseOrder = PurchaseOrder.builder()
                .poNumber(generatePoNumber())
                .supplier(supplier)
                .status(PurchaseOrderStatus.ORDERED)
                .orderDate(dto.orderDate() == null ? LocalDate.now() : dto.orderDate())
                .expectedDate(dto.expectedDate())
                .notes(dto.notes())
                .lines(new ArrayList<>())
                .build();

        for (AppDtos.PurchaseOrderLineDto lineDto : dto.lines()) {
            Product product = productRepository.findById(lineDto.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + lineDto.productId()));
            Warehouse warehouse = warehouseRepository.findById(lineDto.warehouseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found: " + lineDto.warehouseId()));

            PurchaseOrderLine line = PurchaseOrderLine.builder()
                    .purchaseOrder(purchaseOrder)
                    .product(product)
                    .warehouse(warehouse)
                    .orderedQuantity(lineDto.orderedQuantity())
                    .receivedQuantity(0)
                    .unitCost(defaultCost(lineDto.unitCost()))
                    .build();
            purchaseOrder.getLines().add(line);
        }

        return toDto(purchaseOrderRepository.save(purchaseOrder));
    }

    @Transactional
    public AppDtos.PurchaseOrderDto receivePurchaseOrder(Long id, AppDtos.PurchaseReceiptDto receiptDto) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found: " + id));

        LocalDate receivedDate = receiptDto.receivedDate() == null ? LocalDate.now() : receiptDto.receivedDate();

        AtomicInteger totalOrdered = new AtomicInteger();
        AtomicInteger totalReceived = new AtomicInteger();

        for (PurchaseOrderLine line : purchaseOrder.getLines()) {
            int remaining = line.getOrderedQuantity() - line.getReceivedQuantity();
            if (remaining <= 0) {
                totalOrdered.addAndGet(line.getOrderedQuantity());
                totalReceived.addAndGet(line.getReceivedQuantity());
                continue;
            }

            inventoryService.recordPurchaseReceipt(
                    line.getProduct().getId(),
                    line.getWarehouse().getId(),
                    remaining,
                    line.getUnitCost(),
                    purchaseOrder.getPoNumber(),
                    receivedDate,
                    "Goods received for " + purchaseOrder.getPoNumber()
            );
            line.setReceivedQuantity(line.getOrderedQuantity());
            totalOrdered.addAndGet(line.getOrderedQuantity());
            totalReceived.addAndGet(line.getReceivedQuantity());
        }

        purchaseOrder.setReceivedDate(receivedDate);
        purchaseOrder.setStatus(totalReceived.get() >= totalOrdered.get()
                ? PurchaseOrderStatus.RECEIVED
                : PurchaseOrderStatus.PARTIALLY_RECEIVED);

        return toDto(purchaseOrderRepository.save(purchaseOrder));
    }

    private AppDtos.PurchaseOrderDto toDto(PurchaseOrder purchaseOrder) {
        List<AppDtos.PurchaseOrderLineDto> lines = purchaseOrder.getLines().stream()
                .map(line -> new AppDtos.PurchaseOrderLineDto(
                        line.getId(),
                        line.getProduct().getId(),
                        line.getProduct().getName(),
                        line.getProduct().getSku(),
                        line.getWarehouse().getId(),
                        line.getWarehouse().getName(),
                        line.getOrderedQuantity(),
                        line.getReceivedQuantity(),
                        line.getUnitCost()
                ))
                .toList();

        return new AppDtos.PurchaseOrderDto(
                purchaseOrder.getId(),
                purchaseOrder.getPoNumber(),
                purchaseOrder.getSupplier().getId(),
                purchaseOrder.getSupplier().getName(),
                purchaseOrder.getStatus().name(),
                purchaseOrder.getOrderDate(),
                purchaseOrder.getExpectedDate(),
                purchaseOrder.getReceivedDate(),
                purchaseOrder.getNotes(),
                lines
        );
    }

    private String generatePoNumber() {
        return "PO-" + System.currentTimeMillis();
    }

    private BigDecimal defaultCost(BigDecimal unitCost) {
        return unitCost == null ? BigDecimal.ZERO : unitCost;
    }
}
