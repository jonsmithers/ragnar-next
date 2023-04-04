CREATE TABLE `actual_finish_times` (
	`id` serial AUTO_INCREMENT
);
--> statement-breakpoint
CREATE TABLE `loops` (
	`id` serial AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`order` int,
	`name` varchar(256),
	`length_miles` decimal
);
--> statement-breakpoint
CREATE TABLE `runners` (
	`id` serial AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`order` int,
	`name` varchar(256),
	`pace_10k` time
);
--> statement-breakpoint
DROP TABLE users;--> statement-breakpoint
ALTER TABLE teams ADD `id` serial PRIMARY KEY AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE teams ADD `start_time` time;--> statement-breakpoint
ALTER TABLE teams ADD `trail_run_multiplier_low` decimal;--> statement-breakpoint
ALTER TABLE teams ADD `trail_run_multiplier_high` decimal;