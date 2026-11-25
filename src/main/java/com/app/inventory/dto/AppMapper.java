package com.app.inventory.dto;

import com.app.inventory.model.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface AppMapper {

    AppDtos.SupplierDto toDto(Supplier entity);
    Supplier toEntity(AppDtos.SupplierDto dto);

    @Mapping(source = "supplier.id", target = "supplierId")
    @Mapping(source = "supplier.name", target = "supplierName")
    AppDtos.ProductDto toDto(Product entity);
    
    @Mapping(source = "supplierId", target = "supplier.id")
    Product toEntity(AppDtos.ProductDto dto);

    AppDtos.WarehouseDto toDto(Warehouse entity);
    Warehouse toEntity(AppDtos.WarehouseDto dto);

    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.name", target = "productName")
    @Mapping(source = "product.sku", target = "sku")
    @Mapping(source = "warehouse.id", target = "warehouseId")
    @Mapping(source = "warehouse.name", target = "warehouseName")
    AppDtos.StockLevelDto toDto(StockLevel entity);

    @Mapping(source = "productId", target = "product.id")
    @Mapping(source = "warehouseId", target = "warehouse.id")
    StockLevel toEntity(AppDtos.StockLevelDto dto);
}
