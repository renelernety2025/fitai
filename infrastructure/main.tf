terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}

module "networking" {
  source       = "./modules/networking"
  vpc_cidr     = var.vpc_cidr
  project_name = var.project_name
  env          = var.env
  tags         = local.common_tags
}

module "database" {
  source             = "./modules/database"
  project_name       = var.project_name
  env                = var.env
  tags               = local.common_tags
  private_subnet_ids = module.networking.private_subnet_ids
  rds_sg_id          = module.networking.rds_sg_id
  db_password        = var.db_password
}

module "cache" {
  source             = "./modules/cache"
  project_name       = var.project_name
  env                = var.env
  tags               = local.common_tags
  private_subnet_ids = module.networking.private_subnet_ids
  redis_sg_id        = module.networking.redis_sg_id
}

module "storage" {
  source       = "./modules/storage"
  project_name = var.project_name
  env          = var.env
  tags         = local.common_tags
}

module "compute" {
  source             = "./modules/compute"
  project_name       = var.project_name
  env                = var.env
  tags               = local.common_tags
  vpc_id             = module.networking.vpc_id
  public_subnet_ids  = module.networking.public_subnet_ids
  private_subnet_ids = module.networking.private_subnet_ids
  alb_sg_id          = module.networking.alb_sg_id
  api_sg_id          = module.networking.api_sg_id
  web_sg_id          = module.networking.web_sg_id
  database_url       = module.database.database_url
  redis_url          = module.cache.redis_url
  jwt_secret         = var.jwt_secret
  openai_api_key     = var.openai_api_key
  anthropic_api_key  = var.anthropic_api_key
  videos_bucket_name = module.storage.videos_bucket_name
  videos_bucket_arn  = module.storage.videos_bucket_arn
  cloudfront_url     = module.storage.cloudfront_url
  api_url            = "http://${module.compute.alb_dns_name}"
}

module "cicd" {
  source               = "./modules/cicd"
  project_name         = var.project_name
  env                  = var.env
  tags                 = local.common_tags
  aws_region           = var.aws_region
  ecr_api_url          = module.compute.ecr_api_url
  ecr_web_url          = module.compute.ecr_web_url
  ecr_api_arn          = "arn:aws:ecr:${var.aws_region}:*:repository/${var.project_name}-api"
  ecr_web_arn          = "arn:aws:ecr:${var.aws_region}:*:repository/${var.project_name}-web"
  ecs_cluster_name     = module.compute.ecs_cluster_name
  ecs_api_service_name = module.compute.ecs_api_service_name
  ecs_web_service_name = module.compute.ecs_web_service_name
  api_url              = "http://${module.compute.alb_dns_name}"
}

module "monitoring" {
  source               = "./modules/monitoring"
  project_name         = var.project_name
  env                  = var.env
  tags                 = local.common_tags
  aws_region           = var.aws_region
  alert_email          = var.alert_email
  ecs_cluster_name     = module.compute.ecs_cluster_name
  ecs_api_service_name = module.compute.ecs_api_service_name
  rds_identifier       = "${var.project_name}-${var.env}-postgres"
  alb_arn_suffix       = replace(module.compute.alb_arn, "/.*:loadbalancer\\//", "")
}
