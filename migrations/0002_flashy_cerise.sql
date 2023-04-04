ALTER TABLE actual_finish_times MODIFY COLUMN `id` serial AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE loops MODIFY COLUMN `order` int NOT NULL;--> statement-breakpoint
ALTER TABLE loops MODIFY COLUMN `name` varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE loops MODIFY COLUMN `length_miles` decimal NOT NULL;--> statement-breakpoint
ALTER TABLE runners MODIFY COLUMN `order` int NOT NULL;--> statement-breakpoint
ALTER TABLE runners MODIFY COLUMN `name` varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE runners MODIFY COLUMN `pace_10k` time NOT NULL;--> statement-breakpoint
ALTER TABLE teams MODIFY COLUMN `name` varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE teams MODIFY COLUMN `start_time` time NOT NULL;--> statement-breakpoint
ALTER TABLE teams MODIFY COLUMN `trail_run_multiplier_low` decimal NOT NULL;--> statement-breakpoint
ALTER TABLE teams MODIFY COLUMN `trail_run_multiplier_high` decimal NOT NULL;