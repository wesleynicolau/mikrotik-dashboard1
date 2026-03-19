CREATE TABLE `interface_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` int NOT NULL,
	`interfaceName` varchar(255) NOT NULL,
	`rxBytes` varchar(255) NOT NULL,
	`txBytes` varchar(255) NOT NULL,
	`rxPackets` varchar(255) NOT NULL,
	`txPackets` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `interface_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mikrotik_devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`port` int NOT NULL DEFAULT 8728,
	`username` varchar(255) NOT NULL,
	`password` text NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`lastConnected` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mikrotik_devices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` int NOT NULL,
	`cpuUsage` int NOT NULL,
	`memoryUsage` int NOT NULL,
	`memoryTotal` int NOT NULL,
	`diskUsage` int,
	`diskTotal` int,
	`uptime` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `system_metrics_id` PRIMARY KEY(`id`)
);
