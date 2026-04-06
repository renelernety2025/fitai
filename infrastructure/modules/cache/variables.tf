variable "project_name" { type = string }
variable "env" { type = string }
variable "tags" { type = map(string) }
variable "private_subnet_ids" { type = list(string) }
variable "redis_sg_id" { type = string }
