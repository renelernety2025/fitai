resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.env}-db-subnet"
  subnet_ids = var.private_subnet_ids
  tags       = merge(var.tags, { Name = "${var.project_name}-${var.env}-db-subnet" })
}

resource "aws_db_instance" "postgres" {
  identifier     = "${var.project_name}-${var.env}-postgres"
  engine         = "postgres"
  engine_version = "16"
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"

  db_name  = "fitai_db"
  username = "fitai"
  password = var.db_password

  multi_az               = var.multi_az # flip via tfvars in a maintenance window (failover ~1-2 min)
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.rds_sg_id]
  parameter_group_name   = "default.postgres16"

  backup_retention_period   = 7
  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.project_name}-${var.env}-postgres-final"
  deletion_protection       = true

  tags = merge(var.tags, { Name = "${var.project_name}-${var.env}-postgres" })
}
