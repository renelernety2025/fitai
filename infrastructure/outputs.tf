output "alb_url" {
  description = "Application Load Balancer URL"
  value       = module.compute.alb_url
}

output "cloudfront_url" {
  description = "CloudFront distribution URL for video assets"
  value       = module.storage.cloudfront_url
}

output "ecr_api_url" {
  description = "ECR repository URL for API"
  value       = module.compute.ecr_api_url
}

output "ecr_web_url" {
  description = "ECR repository URL for Web"
  value       = module.compute.ecr_web_url
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = module.database.endpoint
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = module.cache.endpoint
}
