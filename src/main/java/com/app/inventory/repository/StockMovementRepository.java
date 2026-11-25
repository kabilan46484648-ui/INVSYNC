package com.app.inventory.repository;

import com.app.inventory.model.MovementType;
import com.app.inventory.model.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    @Query("SELECT sm FROM StockMovement sm " +
           "JOIN FETCH sm.product " +
           "JOIN FETCH sm.warehouse " +
           "ORDER BY sm.movementDate DESC, sm.id DESC")
    List<StockMovement> findAllDetailed();

    List<StockMovement> findByMovementDateBetweenOrderByMovementDateDescIdDesc(LocalDate from, LocalDate to);

    long countByMovementTypeIn(List<MovementType> movementTypes);
}
