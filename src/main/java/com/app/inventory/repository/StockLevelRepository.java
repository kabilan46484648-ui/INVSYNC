package com.app.inventory.repository;

import com.app.inventory.model.StockLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StockLevelRepository extends JpaRepository<StockLevel, Long> {
    
    /**
     * Determines and retrieves StockLevels falling below minimal quantities.
     */
    @Query("SELECT s FROM StockLevel s JOIN FETCH s.product JOIN FETCH s.warehouse WHERE s.quantity < s.lowStockThreshold")
    List<StockLevel> findLowStockLevels();

    @Query("SELECT s FROM StockLevel s JOIN FETCH s.product JOIN FETCH s.warehouse ORDER BY s.product.name, s.warehouse.name")
    List<StockLevel> findAllDetailed();

    Optional<StockLevel> findByProductIdAndWarehouseId(Long productId, Long warehouseId);
}
