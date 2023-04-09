CREATE TABLE `actual_finish_times` (
	`id` bigint AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`runner_id` bigint NOT NULL,
	`loop_id` bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE `loops` (
	`id` bigint AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`team_id` bigint NOT NULL,
	`order` bigint NOT NULL,
	`name` varchar(256) NOT NULL,
	`color` enum('red','green','yellow') NOT NULL,
	`length_miles` double NOT NULL
);
--> statement-breakpoint
CREATE TABLE `runners` (
	`id` bigint AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`team_id` bigint NOT NULL,
	`order` bigint NOT NULL,
	`name` varchar(256) NOT NULL,
	`pace_10k` varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` bigint AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`name` varchar(256) NOT NULL,
	`start_time` datetime NOT NULL,
	`trail_run_multiplier_low` double NOT NULL,
	`trail_run_multiplier_high` double NOT NULL
);
