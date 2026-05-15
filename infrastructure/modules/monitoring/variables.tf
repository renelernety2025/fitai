variable "project_name" { type = string }
variable "env" { type = string }
variable "tags" { type = map(string) }
variable "aws_region" { type = string }
variable "alert_email" { type = string }
variable "ecs_cluster_name" { type = string }
variable "ecs_api_service_name" { type = string }
variable "rds_identifier" { type = string }
variable "alb_arn_suffix" { type = string }
variable "rds_storage_alert_bytes" {
  type    = number
  default = 5368709120 # 5 GiB free
}
variable "cloudfront_distribution_id" {
  type    = string
  default = ""
}
variable "redis_cluster_id" {
  type    = string
  default = ""
}
