package com.app.inventory.repository;

import com.app.inventory.model.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    @Query("SELECT DISTINCT po FROM PurchaseOrder po " +
           "JOIN FETCH po.supplier " +
           "LEFT JOIN FETCH po.lines lines " +
           "LEFT JOIN FETCH lines.product " +
           "LEFT JOIN FETCH lines.warehouse " +
           "ORDER BY po.orderDate DESC, po.id DESC")
    List<PurchaseOrder> findAllDetailed();

    long countByStatusIn(List<com.app.inventory.model.PurchaseOrderStatus> statuses);
}
