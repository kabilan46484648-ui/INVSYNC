package com.app.inventory.repository;

import com.app.inventory.dto.AppDtos.SalesTrendProjection;
import com.app.inventory.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    /**
     * Aggregation query to retrieve daily sum of product classifications sold.
     */
    @Query("SELECT s.saleDate as saleDate, p.category as category, SUM(s.quantity) as totalQuantitySold " +
           "FROM Sale s JOIN s.product p " +
           "GROUP BY s.saleDate, p.category " +
           "ORDER BY s.saleDate DESC")
    List<SalesTrendProjection> findSalesTrends();
}
