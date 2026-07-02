output "endpoint" { value = aws_db_instance.postgres.endpoint }
# connection_limit: t3.micro caps max_connections at ~112; 3 api tasks x 10
# + migrate task + admin sessions must stay under it (Prisma default pool is
# num_cpus*2+1 per task with no cross-task coordination).
output "database_url" {
  value     = "postgresql://fitai:${var.db_password}@${aws_db_instance.postgres.endpoint}/fitai_db?connection_limit=10&pool_timeout=20"
  sensitive = true
}
