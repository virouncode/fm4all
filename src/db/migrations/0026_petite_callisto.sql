DROP INDEX "user_client_adhesions_user_id_idx";--> statement-breakpoint
DROP INDEX "user_client_adhesions_user_entreprise_udx";--> statement-breakpoint
DROP INDEX "user_prestataire_adhesions_user_id_idx";--> statement-breakpoint
DROP INDEX "user_prestataire_adhesions_user_entreprise_udx";--> statement-breakpoint
CREATE UNIQUE INDEX "user_client_adhesions_user_udx" ON "user_client_adhesions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_prestataire_adhesions_user_udx" ON "user_prestataire_adhesions" USING btree ("user_id");