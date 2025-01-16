class BaseError extends Error {
  constructor(e?: string) {
    super(e);
    this.name = new.target.name;
  }
}

export class NetworkAccessError extends BaseError {
  constructor(
    readonly statusCode: number,
    e?: string,
  ) {
    super(e);
  }
}

export class InvalidMerkletreeError extends NetworkAccessError {
  constructor(e = "Invalid Merkletree") {
    super(422, e);
  }
}

export class UnauthorizedError extends NetworkAccessError {
  constructor(e = "Unauthorized") {
    super(401, e);
  }
}

export class AirdropNotFoundError extends NetworkAccessError {
  constructor(e = "Airdrop not found") {
    super(404, e);
  }
}

export class InvalidOwnerError extends NetworkAccessError {
  constructor(e = "Invalid owner") {
    super(403, e);
  }
}
