output "alb_url" { value = "http://${aws_lb.main.dns_name}" }
output "alb_dns_name" { value = aws_lb.main.dns_name }
output "ecr_api_url" { value = aws_ecr_repository.api.repository_url }
output "ecr_web_url" { value = aws_ecr_repository.web.repository_url }
output "ecs_cluster_name" { value = aws_ecs_cluster.main.name }
output "ecs_api_service_name" { value = aws_ecs_service.api.name }
output "ecs_web_service_name" { value = aws_ecs_service.web.name }
output "alb_arn" { value = aws_lb.main.arn }
