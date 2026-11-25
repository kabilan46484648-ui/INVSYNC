package com.app.inventory.service;

import com.app.inventory.dto.AppDtos;
import com.app.inventory.dto.AppMapper;
import com.app.inventory.exception.ResourceNotFoundException;
import com.app.inventory.model.Product;
import com.app.inventory.model.Supplier;
import com.app.inventory.model.UserAccount;
import com.app.inventory.model.Warehouse;
import com.app.inventory.repository.ProductRepository;
import com.app.inventory.repository.SupplierRepository;
import com.app.inventory.repository.UserAccountRepository;
import com.app.inventory.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SetupService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final UserAccountRepository userAccountRepository;
    private final AppMapper appMapper;

    public List<AppDtos.ProductDto> getItems() {
        return productRepository.findAll().stream()
                .map(appMapper::toDto)
                .toList();
    }

    @Transactional
    public AppDtos.ProductDto createItem(AppDtos.ProductDto dto) {
        Product product = appMapper.toEntity(dto);
        product.setActive(dto.active() == null ? Boolean.TRUE : dto.active());
        product.setSupplier(resolveSupplier(dto.supplierId()));
        return appMapper.toDto(productRepository.save(product));
    }

    public List<AppDtos.WarehouseDto> getWarehouses() {
        return warehouseRepository.findAll().stream()
                .map(appMapper::toDto)
                .toList();
    }

    @Transactional
    public AppDtos.WarehouseDto createWarehouse(AppDtos.WarehouseDto dto) {
        Warehouse warehouse = appMapper.toEntity(dto);
        return appMapper.toDto(warehouseRepository.save(warehouse));
    }

    public List<AppDtos.UserAccountDto> getUsers() {
        return userAccountRepository.findAll().stream()
                .map(user -> new AppDtos.UserAccountDto(user.getId(), user.getName(), user.getEmail(), user.getRole()))
                .toList();
    }

    @Transactional
    public AppDtos.UserAccountDto createUser(AppDtos.UserAccountDto dto) {
        UserAccount user = UserAccount.builder()
                .name(dto.name())
                .email(dto.email())
                .role(dto.role())
                .build();
        UserAccount saved = userAccountRepository.save(user);
        return new AppDtos.UserAccountDto(saved.getId(), saved.getName(), saved.getEmail(), saved.getRole());
    }

    private Supplier resolveSupplier(Long supplierId) {
        if (supplierId == null) {
            return null;
        }
        return supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + supplierId));
    }
}
