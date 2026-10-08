CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`size` text NOT NULL,
	`crust` text NOT NULL,
	`extras` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_cents` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`request_key` text NOT NULL,
	`customer` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`address` text NOT NULL,
	`zone` text NOT NULL,
	`notes` text NOT NULL,
	`subtotal_cents` integer NOT NULL,
	`delivery_cents` integer NOT NULL,
	`total_cents` integer NOT NULL,
	`status` text DEFAULT 'Placed' NOT NULL,
	`payment_status` text DEFAULT 'Unpaid' NOT NULL,
	`rider` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_ref_uq` ON `orders` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `order_request_uq` ON `orders` (`request_key`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`price_cents` integer NOT NULL,
	`available` integer DEFAULT 1 NOT NULL
);
