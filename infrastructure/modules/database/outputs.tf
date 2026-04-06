output "endpoint" { value = aws_db_instance.postgres.endpoint }
output "database_url" {
  value     = "postgresql://fitai:${var.db_password}@${aws_db_instance.postgres.endpoint}/fitai_db"
  sensitive = true
}
