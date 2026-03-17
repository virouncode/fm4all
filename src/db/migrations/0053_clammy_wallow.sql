CREATE INDEX "service_entreprises_actif_idx" ON "service_entreprises" USING btree ("actif");--> statement-breakpoint
CREATE INDEX "facture_ligne_allocations_created_at_idx" ON "facture_ligne_allocations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "cso_created_at_idx" ON "client_service_occurrences" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "cso_started_by_field_session_idx" ON "client_service_occurrences" USING btree ("started_by_field_session_id");--> statement-breakpoint
CREATE INDEX "cso_done_by_field_session_idx" ON "client_service_occurrences" USING btree ("done_by_field_session_id");--> statement-breakpoint
CREATE INDEX "ot_started_by_field_session_idx" ON "occurrence_taches" USING btree ("started_by_field_session_id");--> statement-breakpoint
CREATE INDEX "ot_done_by_field_session_idx" ON "occurrence_taches" USING btree ("done_by_field_session_id");--> statement-breakpoint
CREATE INDEX "sites_arborescence_profondeur_idx" ON "sites_arborescence" USING btree ("profondeur");