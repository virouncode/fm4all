ALTER TABLE "client_service_executions" DROP CONSTRAINT "client_service_executions_assignee_user_id_default_user_id_fk";
--> statement-breakpoint
ALTER TABLE "client_service_executions" DROP COLUMN "assignee_user_id_default";