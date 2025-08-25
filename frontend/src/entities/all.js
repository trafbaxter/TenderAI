// Mock entity classes for frontend-only demo
class BaseEntity {
  static async list(sort, limit) {
    // Mock data - in real app this would call the backend API
    return [];
  }
  
  static async create(data) {
    // Mock creation
    return { id: Date.now(), ...data };
  }
  
  static async update(id, data) {
    // Mock update
    return { id, ...data };
  }
}

export class Tender extends BaseEntity {
  static async list(sort = '-match_score', limit = 10) {
    // Mock tender data
    return [
      {
        id: 1,
        title: "Digital Infrastructure Modernization",
        description: "Comprehensive upgrade of legacy systems to cloud-native architecture",
        organization: "City of San Francisco",
        category: "technology",
        budget_min: 500000,
        budget_max: 1200000,
        deadline: "2024-12-15",
        location: "San Francisco, CA",
        match_score: 95,
        status: "active"
      },
      {
        id: 2,
        title: "Healthcare Data Analytics Platform",
        description: "Development of AI-powered analytics for patient care optimization",
        organization: "Regional Medical Center",
        category: "healthcare",
        budget_min: 800000,
        budget_max: 1500000,
        deadline: "2024-11-30",
        location: "New York, NY",
        match_score: 88,
        status: "active"
      }
    ];
  }
}

export class Portfolio extends BaseEntity {
  static async list(sort = '-created_date', limit = 5) {
    // Mock portfolio data
    return [
      {
        id: 1,
        title: "Cloud Migration Services",
        description: "End-to-end cloud migration and modernization services for enterprise clients",
        category: "technology",
        tags: ["AWS", "Azure", "DevOps", "Microservices"],
        project_value: 2500000,
        completion_date: "2024-01-15",
        client_name: "Fortune 500 Tech Company",
        status: "completed"
      },
      {
        id: 2,
        title: "AI-Powered Analytics Platform",
        description: "Custom machine learning platform for predictive analytics and business intelligence",
        category: "technology",
        tags: ["Machine Learning", "Python", "React", "PostgreSQL"],
        project_value: 1800000,
        completion_date: "2023-11-30",
        client_name: "Healthcare Analytics Corp",
        status: "completed"
      }
    ];
  }
}

export class Integration extends BaseEntity {
  static async list() {
    // Mock integration data
    return [
      {
        id: 1,
        name: "OpenAI GPT-4",
        provider: "openai",
        type: "ai_model",
        status: "active",
        config: {
          model: "gpt-4",
          api_key: "sk-...",
          max_tokens: 4000,
          temperature: 0.7
        },
        last_sync: "2024-01-15T10:30:00Z"
      }
    ];
  }
}

export class AgentConfig extends BaseEntity {}