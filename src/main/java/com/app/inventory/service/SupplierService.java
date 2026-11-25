package com.app.inventory.service;

import com.app.inventory.dto.AppDtos.SupplierDto;
import com.app.inventory.dto.AppMapper;
import com.app.inventory.exception.ResourceNotFoundException;
import com.app.inventory.model.Supplier;
import com.app.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final AppMapper appMapper;

    public List<SupplierDto> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(appMapper::toDto)
                .collect(Collectors.toList());
    }

    public SupplierDto getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        return appMapper.toDto(supplier);
    }

    @Transactional
    public SupplierDto createSupplier(SupplierDto supplierDto) {
        Supplier supplier = appMapper.toEntity(supplierDto);
        return appMapper.toDto(supplierRepository.save(supplier));
    }

    @Transactional
    public SupplierDto updateSupplier(Long id, SupplierDto supplierDto) {
        Supplier existing = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        
        existing.setName(supplierDto.name());
        existing.setContactEmail(supplierDto.contactEmail());
        existing.setPhoneNumber(supplierDto.phoneNumber());
        
        return appMapper.toDto(supplierRepository.save(existing));
    }

    @Transactional
    public void deleteSupplier(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new ResourceNotFoundException("Supplier not found with id: " + id);
        }
        supplierRepository.deleteById(id);
    }
}
