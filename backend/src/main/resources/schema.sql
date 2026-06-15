-- FEIRS Schema Initialization
-- Drops legacy PoC tables before Hibernate creates the new 7-table enterprise schema.
-- Executed by Spring Boot auto-config (spring.sql.init.mode=always).

DROP TABLE IF EXISTS persons CASCADE;
