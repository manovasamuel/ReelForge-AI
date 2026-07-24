export class BrandKnowledgeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends BrandKnowledgeError {
  constructor(message: string) {
    super(message);
  }
}

export class AuthorizationError extends BrandKnowledgeError {
  constructor(message: string = "Unauthorized access to brand resource") {
    super(message);
  }
}

export class StorageError extends BrandKnowledgeError {
  constructor(message: string) {
    super(message);
  }
}

export class RepositoryError extends BrandKnowledgeError {
  constructor(message: string) {
    super(message);
  }
}
