terraform {
  backend "s3" {
    bucket         = "fitai-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "eu-west-1"
    encrypt        = true
    dynamodb_table = "fitai-terraform-lock"
  }
}
