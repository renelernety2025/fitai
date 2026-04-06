output "videos_bucket_name" { value = aws_s3_bucket.videos.id }
output "videos_bucket_arn" { value = aws_s3_bucket.videos.arn }
output "assets_bucket_name" { value = aws_s3_bucket.assets.id }
output "cloudfront_url" { value = "https://${aws_cloudfront_distribution.videos.domain_name}" }
output "cloudfront_distribution_id" { value = aws_cloudfront_distribution.videos.id }
