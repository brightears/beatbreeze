---
argument-hint: [table-name]
description: Add a new database table to Prisma schema with RLS
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Add Database Table: $ARGUMENTS

## Current Schema
@prisma/schema.prisma

## Your Task

Add a new table named `$ARGUMENTS` to the Prisma schema:

1. **Update prisma/schema.prisma** with the new model

2. **Follow these conventions**:
   - Use `cuid()` for primary keys
   - Include `createdAt` and `updatedAt` timestamps
   - Add proper relations with foreign keys
   - Include indexes on foreign keys and frequently queried fields
   - Add appropriate data types and constraints

3. **Consider Multi-Tenancy**:
   - If tenant-specific, add `organizationId` relation
   - Or relate through Venue/Zone hierarchy

## Model Template

```prisma
model $ARGUMENTS {
  id        String   @id @default(cuid())

  // Foreign key (if needed)
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id])

  // Fields
  name        String
  description String?
  isActive    Boolean  @default(true)

  // JSON for flexible data
  settings    Json     @default("{}")
  metadata    Json?

  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  // relatedItems RelatedModel[]

  // Indexes
  @@index([organizationId])
}
```

4. **Create RLS Policy** (for Supabase):

```sql
-- Enable RLS
ALTER TABLE $ARGUMENTS ENABLE ROW LEVEL SECURITY;

-- Policy for organization members
CREATE POLICY ${ARGUMENTS}_org_policy ON $ARGUMENTS
  FOR ALL
  USING (organization_id = (
    SELECT organization_id FROM users
    WHERE id = auth.uid()
  ));
```

5. **After adding the model**:
   - Run `npm run db:generate` to update Prisma client
   - Run `npm run db:push` to sync with database

Also create TypeScript types in `src/lib/types/` if needed.
