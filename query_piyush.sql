ALTER TABLE `sanguine`.`user_details`
ADD COLUMN `first_name` VARCHAR(255) NULL DEFAULT NULL
AFTER `created_at`,
  ADD COLUMN `last_name` VARCHAR(255) NULL DEFAULT NULL
AFTER `first_name`,
  ADD COLUMN `company_name` VARCHAR(255) NULL DEFAULT NULL
AFTER `last_name`,
  ADD COLUMN `gstin` VARCHAR(255) NULL DEFAULT NULL
AFTER `company_name`;
-- 
CREATE TABLE `sanguine`.`sanguine_wishlist` (
  `row_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(255) NULL DEFAULT NULL,
  `product_id` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`row_id`)
);
-- 
CREATE TABLE `sanguine`.`sanguine_cart` (
  `row_id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(45) NULL DEFAULT NULL,
  `product_id` VARCHAR(45) NULL DEFAULT NULL,
  `qty` VARCHAR(45) NULL,
  PRIMARY KEY (`row_id`)
);
-- 
DROP TABLE `sanguine`.`sanguine_cart`;
-- 
ALTER TABLE `sanguine`.`sanguine_cart` CHANGE COLUMN `row_id` `row_id` BIGINT NOT NULL AUTO_INCREMENT;