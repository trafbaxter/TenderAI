# Configure the Google Cloud Provider
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.0"
}

# Configure variables
variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "The GCP zone"
  type        = string
  default     = "us-central1-a"
}

# Configure the provider
provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "firestore.googleapis.com",
    "containerregistry.googleapis.com",
    "artifactregistry.googleapis.com"
  ])
  
  project = var.project_id
  service = each.value
  
  disable_dependent_services = true
}

# Create Artifact Registry repository
resource "google_artifact_registry_repository" "tendermatch_repo" {
  location      = var.region
  project       = var.project_id
  repository_id = "tendermatch"
  description   = "Docker repository for TenderMatch AI application images"
  format        = "DOCKER"

  depends_on = [google_project_service.required_apis]
}

# Create Firestore database
resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"

  depends_on = [google_project_service.required_apis]
}

# Create service account for the application
resource "google_service_account" "app_service_account" {
  account_id   = "tendermatch-app"
  display_name = "TenderMatch AI Application Service Account"
  description  = "Service account for TenderMatch AI application"
}

# Grant Firestore permissions to service account
resource "google_project_iam_member" "firestore_user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.app_service_account.email}"
}

# Create Cloud Build trigger for automatic deployment
resource "google_cloudbuild_trigger" "github_trigger" {
  name        = "tendermatch-deploy"
  description = "Deploy TenderMatch AI on push to main branch"
  
  github {
    owner = "your-github-username"  # Replace with your GitHub username
    name  = "your-repo-name"        # Replace with your repository name
    push {
      branch = "^main$"
    }
  }
  
  filename = "cloudbuild.yaml"
  
  depends_on = [google_project_service.required_apis]
}

# Output important values
output "project_id" {
  description = "The GCP project ID"
  value       = var.project_id
}

output "firestore_database" {
  description = "Firestore database name"
  value       = google_firestore_database.database.name
}

output "service_account_email" {
  description = "Service account email"
  value       = google_service_account.app_service_account.email
}