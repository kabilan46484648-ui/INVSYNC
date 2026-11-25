CREATE TABLE IF NOT EXISTS supplier (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    phone_number VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS user_account (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS warehouse (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(100) NOT NULL,
    min_stock_level INT NOT NULL,
    category VARCHAR(255),
    price DECIMAL(10, 2),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    supplier_id BIGINT,
    FOREIGN KEY (supplier_id) REFERENCES supplier(id)
);

CREATE TABLE IF NOT EXISTS stock_level (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    warehouse_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    low_stock_threshold INT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES product(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouse(id)
);

CREATE TABLE IF NOT EXISTS purchase_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(255) NOT NULL UNIQUE,
    supplier_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    order_date DATE NOT NULL,
    expected_date DATE,
    received_date DATE,
    notes VARCHAR(1000),
    FOREIGN KEY (supplier_id) REFERENCES supplier(id)
);

CREATE TABLE IF NOT EXISTS purchase_order_line (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    warehouse_id BIGINT NOT NULL,
    ordered_quantity INT NOT NULL,
    received_quantity INT NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_order(id),
    FOREIGN KEY (product_id) REFERENCES product(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouse(id)
);

CREATE TABLE IF NOT EXISTS stock_movement (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    warehouse_id BIGINT NOT NULL,
    movement_type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    balance_after INT NOT NULL,
    unit_cost DECIMAL(10, 2),
    reference_number VARCHAR(255),
    notes VARCHAR(1000),
    movement_date DATE NOT NULL,
    FOREIGN KEY (product_id) REFERENCES product(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouse(id)
);

CREATE TABLE IF NOT EXISTS sale (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    sale_date DATE NOT NULL,
    FOREIGN KEY (product_id) REFERENCES product(id)
);

INSERT INTO supplier (id, name, contact_email, phone_number)
SELECT 1, 'Gowsik Joy', 'joygowsik@gmail.com', '9943154044'
WHERE NOT EXISTS (SELECT 1 FROM supplier WHERE id = 1);

INSERT INTO supplier (id, name, contact_email, phone_number)
SELECT 2, 'Office Basics Co.', 'support@officebasics.local', '9000000011'
WHERE NOT EXISTS (SELECT 1 FROM supplier WHERE id = 2);

INSERT INTO user_account (id, name, email, role)
SELECT 1, 'Admin User', 'admin@invsync.local', 'System Administrator'
WHERE NOT EXISTS (SELECT 1 FROM user_account WHERE id = 1);

INSERT INTO user_account (id, name, email, role)
SELECT 2, 'Store Executive', 'store@invsync.local', 'Store Keeper'
WHERE NOT EXISTS (SELECT 1 FROM user_account WHERE id = 2);

INSERT INTO warehouse (id, name, location)
SELECT 1, 'Main Warehouse', 'Chennai'
WHERE NOT EXISTS (SELECT 1 FROM warehouse WHERE id = 1);

INSERT INTO product (id, sku, name, unit, min_stock_level, category, price, active, supplier_id)
SELECT 1, 'PPR-A4-80', 'A4 Paper Ream', 'ream', 15, 'Stationery', 285.00, TRUE, 2
WHERE NOT EXISTS (SELECT 1 FROM product WHERE id = 1);

INSERT INTO product (id, sku, name, unit, min_stock_level, category, price, active, supplier_id)
SELECT 2, 'INK-BLK-01', 'Black Ink Cartridge', 'piece', 6, 'Printer Supplies', 950.00, TRUE, 1
WHERE NOT EXISTS (SELECT 1 FROM product WHERE id = 2);

INSERT INTO stock_level (id, product_id, warehouse_id, quantity, low_stock_threshold)
SELECT 1, 1, 1, 28, 15
WHERE NOT EXISTS (SELECT 1 FROM stock_level WHERE id = 1);

INSERT INTO stock_level (id, product_id, warehouse_id, quantity, low_stock_threshold)
SELECT 2, 2, 1, 4, 6
WHERE NOT EXISTS (SELECT 1 FROM stock_level WHERE id = 2);

INSERT INTO purchase_order (id, po_number, supplier_id, status, order_date, expected_date, received_date, notes)
SELECT 1, 'PO-20260428-001', 2, 'ORDERED', DATE '2026-04-28', DATE '2026-04-30', NULL, 'Monthly office stock replenishment'
WHERE NOT EXISTS (SELECT 1 FROM purchase_order WHERE id = 1);

INSERT INTO purchase_order_line (id, purchase_order_id, product_id, warehouse_id, ordered_quantity, received_quantity, unit_cost)
SELECT 1, 1, 1, 1, 20, 0, 270.00
WHERE NOT EXISTS (SELECT 1 FROM purchase_order_line WHERE id = 1);

INSERT INTO stock_movement (id, product_id, warehouse_id, movement_type, quantity, balance_after, unit_cost, reference_number, notes, movement_date)
SELECT 1, 1, 1, 'PURCHASE_RECEIPT', 40, 40, 270.00, 'GRN-20260420-001', 'Opening receipt for office paper', DATE '2026-04-20'
WHERE NOT EXISTS (SELECT 1 FROM stock_movement WHERE id = 1);

INSERT INTO stock_movement (id, product_id, warehouse_id, movement_type, quantity, balance_after, unit_cost, reference_number, notes, movement_date)
SELECT 2, 1, 1, 'ISSUE', 12, 28, NULL, 'ISS-20260426-001', 'Issued to admin floor', DATE '2026-04-26'
WHERE NOT EXISTS (SELECT 1 FROM stock_movement WHERE id = 2);

INSERT INTO stock_movement (id, product_id, warehouse_id, movement_type, quantity, balance_after, unit_cost, reference_number, notes, movement_date)
SELECT 3, 2, 1, 'PURCHASE_RECEIPT', 8, 8, 910.00, 'GRN-20260418-002', 'Printer cartridge receipt', DATE '2026-04-18'
WHERE NOT EXISTS (SELECT 1 FROM stock_movement WHERE id = 3);

INSERT INTO stock_movement (id, product_id, warehouse_id, movement_type, quantity, balance_after, unit_cost, reference_number, notes, movement_date)
SELECT 4, 2, 1, 'SALE', 4, 4, NULL, 'SAL-20260427-001', 'Issued against copier usage', DATE '2026-04-27'
WHERE NOT EXISTS (SELECT 1 FROM stock_movement WHERE id = 4);

INSERT INTO sale (id, product_id, quantity, sale_date)
SELECT 1, 2, 4, DATE '2026-04-27'
WHERE NOT EXISTS (SELECT 1 FROM sale WHERE id = 1);
