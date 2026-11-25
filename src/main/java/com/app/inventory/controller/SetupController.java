package com.app.inventory.controller;

import com.app.inventory.dto.AppDtos;
import com.app.inventory.service.SetupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/setup")
@RequiredArgsConstructor
public class SetupController {

    private final SetupService setupService;

    @GetMapping("/items")
    public ResponseEntity<List<AppDtos.ProductDto>> getItems() {
        return ResponseEntity.ok(setupService.getItems());
    }

    @PostMapping("/items")
    public ResponseEntity<AppDtos.ProductDto> createItem(@Valid @RequestBody AppDtos.ProductDto dto) {
        return new ResponseEntity<>(setupService.createItem(dto), HttpStatus.CREATED);
    }

    @GetMapping("/warehouses")
    public ResponseEntity<List<AppDtos.WarehouseDto>> getWarehouses() {
        return ResponseEntity.ok(setupService.getWarehouses());
    }

    @PostMapping("/warehouses")
    public ResponseEntity<AppDtos.WarehouseDto> createWarehouse(@Valid @RequestBody AppDtos.WarehouseDto dto) {
        return new ResponseEntity<>(setupService.createWarehouse(dto), HttpStatus.CREATED);
    }

    @GetMapping("/users")
    public ResponseEntity<List<AppDtos.UserAccountDto>> getUsers() {
        return ResponseEntity.ok(setupService.getUsers());
    }

    @PostMapping("/users")
    public ResponseEntity<AppDtos.UserAccountDto> createUser(@Valid @RequestBody AppDtos.UserAccountDto dto) {
        return new ResponseEntity<>(setupService.createUser(dto), HttpStatus.CREATED);
    }
}
