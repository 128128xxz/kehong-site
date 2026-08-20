import type { InquiryRepository } from "./types";
import { getMemoryRepository } from "./repository";
import { PostgresInquiryRepository } from "./postgres-repository";

let postgresRepository: PostgresInquiryRepository | null = null;

export function getInquiryRepository(): InquiryRepository {
  if (process.env.DATABASE_URL?.trim()) {
    postgresRepository ??= new PostgresInquiryRepository();
    return postgresRepository;
  }
  return getMemoryRepository();
}

export function databaseStatus() {
  return process.env.DATABASE_URL?.trim() ? "postgres_configured_migration_pending" : "NOT_CONFIGURED_MEMORY_MOCK";
}
