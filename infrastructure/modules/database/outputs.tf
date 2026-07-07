output "endpoint" { value = aws_db_instance.postgres.endpoint }
# connection_limit: t3.micro caps max_connections at ~112. The pool ceiling is
# (api max_capacity) x connection_limit + migrate + admin sessions, which MUST
# stay under it. With api max_capacity=10 and connection_limit=8 → 80, leaving
# ~32 for the migrate task, psql/admin, and replication. Keep these two numbers
# (here + aws_appautoscaling_target.api.max_capacity) reconciled.
output "database_url" {
  value     = "postgresql://fitai:${var.db_password}@${aws_db_instance.postgres.endpoint}/fitai_db?connection_limit=8&pool_timeout=20"
  sensitive = true
}
