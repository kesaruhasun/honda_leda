# MySQL Skill Summary

- Prefer narrow, monotonic PKs (BIGINT UNSIGNED AUTO_INCREMENT). Keep external UUID in a secondary unique column.
- Always utf8mb4. Prefer NOT NULL, DATETIME over TIMESTAMP.
- Composite indexes: equality first, then range/sort (leftmost prefix rule).
- Transactions: Use proper transaction isolation, SELECT ... FOR UPDATE when locking inventory / stock rows to prevent race conditions during dispense.
- Atomic operations for stock deduction: update drugs set quantity = quantity - requested where id = :id and quantity >= :requested, or select for update.
