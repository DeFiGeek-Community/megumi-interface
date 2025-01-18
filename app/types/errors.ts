import { getErrorMessage } from "../utils/shared";

class BaseError extends Error {
  constructor(e?: string) {
    super(e);
    this.name = new.target.name;
  }
}

export class NetworkAccessError extends BaseError {
  constructor(
    readonly statusCode: number,
    e?: string | unknown,
  ) {
    super(getErrorMessage(e));
  }
}

export class InvalidParameterError extends NetworkAccessError {
  constructor(e: string | unknown = "Invalid Parameter") {
    super(422, e);
  }
}

export class InvalidMerkletreeError extends NetworkAccessError {
  constructor(e: string | unknown = "Invalid Merkletree") {
    super(422, e);
  }
}

export class UnauthorizedError extends NetworkAccessError {
  constructor(e: string | unknown = "Unauthorized") {
    super(401, e);
  }
}

export class AirdropNotFoundError extends NetworkAccessError {
  constructor(e: string | unknown = "Airdrop not found") {
    super(404, e);
  }
}

export class InvalidOwnerError extends NetworkAccessError {
  constructor(e: string | unknown = "Invalid owner") {
    super(403, e);
  }
}
