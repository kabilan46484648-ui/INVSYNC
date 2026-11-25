package com.app.inventory.controller;

import com.app.inventory.dto.AppDtos;
import com.app.inventory.service.PurchaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseService purchaseService;

    @GetMapping("/orders")
    public ResponseEntity<List<AppDtos.PurchaseOrderDto>> getPurchaseOrders() {
        return ResponseEntity.ok(purchaseService.getPurchaseOrders());
    }

    @PostMapping("/orders")
    public ResponseEntity<AppDtos.PurchaseOrderDto> createPurchaseOrder(@Valid @RequestBody AppDtos.PurchaseOrderDto dto) {
        return new ResponseEntity<>(purchaseService.createPurchaseOrder(dto), HttpStatus.CREATED);
    }

    @PostMapping("/orders/{id}/receive")
    public ResponseEntity<AppDtos.PurchaseOrderDto> receivePurchaseOrder(
            @PathVariable Long id,
            @RequestBody(required = false) AppDtos.PurchaseReceiptDto receiptDto
    ) {
        AppDtos.PurchaseReceiptDto safeReceipt = receiptDto == null
                ? new AppDtos.PurchaseReceiptDto(null)
                : receiptDto;
        return ResponseEntity.ok(purchaseService.receivePurchaseOrder(id, safeReceipt));
    }
}
