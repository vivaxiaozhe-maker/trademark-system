export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class StorageUnavailableError extends Error {
  constructor(cause: unknown) {
    super('Storage is unavailable', { cause });
    this.name = 'StorageUnavailableError';
  }
}

export async function storageOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof HttpError || error instanceof StorageUnavailableError) throw error;
    throw new StorageUnavailableError(error);
  }
}
