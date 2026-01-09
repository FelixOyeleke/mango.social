import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'immigrant_voices',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

/**
 * Find a single record by ID
 * @param table - Table name
 * @param id - Record ID (UUID)
 * @returns Single record or null
 */
export const findById = async (table: string, id: string) => {
  const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
  return result.rows[0] || null;
};

/**
 * Find a single record by any field
 * @param table - Table name
 * @param field - Field name
 * @param value - Field value
 * @returns Single record or null
 */
export const findOne = async (table: string, field: string, value: any) => {
  const result = await pool.query(`SELECT * FROM ${table} WHERE ${field} = $1`, [value]);
  return result.rows[0] || null;
};

/**
 * Find multiple records with optional conditions
 * @param table - Table name
 * @param conditions - WHERE conditions object (e.g., { status: 'active', user_id: '123' })
 * @param orderBy - ORDER BY clause (e.g., 'created_at DESC')
 * @param limit - Maximum number of records
 * @returns Array of records
 */
export const findMany = async (
  table: string,
  conditions?: Record<string, any>,
  orderBy?: string,
  limit?: number
) => {
  let queryText = `SELECT * FROM ${table}`;
  const params: any[] = [];

  if (conditions && Object.keys(conditions).length > 0) {
    const whereClauses = Object.keys(conditions).map((key, index) => {
      params.push(conditions[key]);
      return `${key} = $${index + 1}`;
    });
    queryText += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  if (orderBy) {
    queryText += ` ORDER BY ${orderBy}`;
  }

  if (limit) {
    queryText += ` LIMIT ${limit}`;
  }

  const result = await pool.query(queryText, params);
  return result.rows;
};

/**
 * Insert a new record
 * @param table - Table name
 * @param data - Data object to insert
 * @returns Inserted record
 */
export const insert = async (table: string, data: Record<string, any>) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');

  const queryText = `
    INSERT INTO ${table} (${keys.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;

  const result = await pool.query(queryText, values);
  return result.rows[0];
};

/**
 * Update a record by ID
 * @param table - Table name
 * @param id - Record ID
 * @param data - Data object to update
 * @returns Updated record
 */
export const updateById = async (table: string, id: string, data: Record<string, any>) => {
  const keys = Object.keys(data);
  const values = Object.values(data);

  const setClauses = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

  const queryText = `
    UPDATE ${table}
    SET ${setClauses}
    WHERE id = $${keys.length + 1}
    RETURNING *
  `;

  const result = await pool.query(queryText, [...values, id]);
  return result.rows[0];
};

/**
 * Delete a record by ID
 * @param table - Table name
 * @param id - Record ID
 * @returns Deleted record
 */
export const deleteById = async (table: string, id: string) => {
  const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);
  return result.rows[0];
};

/**
 * Count records with optional conditions
 * @param table - Table name
 * @param conditions - WHERE conditions object
 * @returns Count of records
 */
export const count = async (table: string, conditions?: Record<string, any>) => {
  let queryText = `SELECT COUNT(*) FROM ${table}`;
  const params: any[] = [];

  if (conditions && Object.keys(conditions).length > 0) {
    const whereClauses = Object.keys(conditions).map((key, index) => {
      params.push(conditions[key]);
      return `${key} = $${index + 1}`;
    });
    queryText += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  const result = await pool.query(queryText, params);
  return parseInt(result.rows[0].count);
};

/**
 * Check if a record exists
 * @param table - Table name
 * @param field - Field name
 * @param value - Field value
 * @returns Boolean indicating existence
 */
export const exists = async (table: string, field: string, value: any) => {
  const result = await pool.query(
    `SELECT EXISTS(SELECT 1 FROM ${table} WHERE ${field} = $1)`,
    [value]
  );
  return result.rows[0].exists;
};

/**
 * Execute a transaction
 * @param callback - Async function that receives a client and executes queries
 * @returns Result from the callback
 */
export const transaction = async <T>(
  callback: (client: any) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Paginate records with optional conditions, ordering, and search
 * @param table - Table name
 * @param options - Pagination options
 * @returns Paginated results with metadata
 */
export const paginate = async (
  table: string,
  options: {
    page?: number;
    limit?: number;
    conditions?: Record<string, any>;
    search?: { fields: string[]; query: string };
    orderBy?: string;
  } = {}
) => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const offset = (page - 1) * limit;

  let queryText = `SELECT * FROM ${table}`;
  let countQuery = `SELECT COUNT(*) FROM ${table}`;
  const params: any[] = [];
  let paramCount = 0;

  const whereClauses: string[] = [];

  // Add conditions
  if (options.conditions && Object.keys(options.conditions).length > 0) {
    Object.keys(options.conditions).forEach((key) => {
      paramCount++;
      whereClauses.push(`${key} = $${paramCount}`);
      params.push(options.conditions![key]);
    });
  }

  // Add search
  if (options.search && options.search.query) {
    paramCount++;
    const searchClauses = options.search.fields.map(field => `${field} ILIKE $${paramCount}`);
    whereClauses.push(`(${searchClauses.join(' OR ')})`);
    params.push(`%${options.search.query}%`);
  }

  // Apply WHERE clause
  if (whereClauses.length > 0) {
    const whereClause = ` WHERE ${whereClauses.join(' AND ')}`;
    queryText += whereClause;
    countQuery += whereClause;
  }

  // Add ordering
  if (options.orderBy) {
    queryText += ` ORDER BY ${options.orderBy}`;
  }

  // Add pagination
  queryText += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;

  // Execute queries
  const [dataResult, countResult] = await Promise.all([
    pool.query(queryText, [...params, limit, offset]),
    pool.query(countQuery, params)
  ]);

  const total = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(total / limit);

  return {
    data: dataResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

/**
 * Search records across multiple fields
 * @param table - Table name
 * @param fields - Array of field names to search
 * @param searchQuery - Search query string
 * @param limit - Maximum number of results
 * @returns Array of matching records
 */
export const search = async (
  table: string,
  fields: string[],
  searchQuery: string,
  limit: number = 20
) => {
  const searchClauses = fields.map((field) => `${field} ILIKE $1`);
  const queryText = `
    SELECT * FROM ${table}
    WHERE ${searchClauses.join(' OR ')}
    LIMIT $2
  `;

  const result = await pool.query(queryText, [`%${searchQuery}%`, limit]);
  return result.rows;
};

/**
 * Bulk insert multiple records
 * @param table - Table name
 * @param records - Array of data objects to insert
 * @returns Array of inserted records
 */
export const bulkInsert = async (table: string, records: Record<string, any>[]) => {
  if (records.length === 0) return [];

  const keys = Object.keys(records[0]);
  const values: any[] = [];
  const valuePlaceholders: string[] = [];

  records.forEach((record, recordIndex) => {
    const recordPlaceholders = keys.map((_, keyIndex) => {
      const paramIndex = recordIndex * keys.length + keyIndex + 1;
      values.push(record[keys[keyIndex]]);
      return `$${paramIndex}`;
    });
    valuePlaceholders.push(`(${recordPlaceholders.join(', ')})`);
  });

  const queryText = `
    INSERT INTO ${table} (${keys.join(', ')})
    VALUES ${valuePlaceholders.join(', ')}
    RETURNING *
  `;

  const result = await pool.query(queryText, values);
  return result.rows;
};

/**
 * Update records with conditions
 * @param table - Table name
 * @param data - Data to update
 * @param conditions - WHERE conditions
 * @returns Array of updated records
 */
export const updateWhere = async (
  table: string,
  data: Record<string, any>,
  conditions: Record<string, any>
) => {
  const dataKeys = Object.keys(data);
  const conditionKeys = Object.keys(conditions);

  const setClauses = dataKeys.map((key, index) => `${key} = $${index + 1}`);
  const whereClauses = conditionKeys.map((key, index) =>
    `${key} = $${dataKeys.length + index + 1}`
  );

  const queryText = `
    UPDATE ${table}
    SET ${setClauses.join(', ')}
    WHERE ${whereClauses.join(' AND ')}
    RETURNING *
  `;

  const values = [...Object.values(data), ...Object.values(conditions)];
  const result = await pool.query(queryText, values);
  return result.rows;
};

/**
 * Delete records with conditions
 * @param table - Table name
 * @param conditions - WHERE conditions
 * @returns Array of deleted records
 */
export const deleteWhere = async (
  table: string,
  conditions: Record<string, any>
) => {
  const keys = Object.keys(conditions);
  const whereClauses = keys.map((key, index) => `${key} = $${index + 1}`);

  const queryText = `
    DELETE FROM ${table}
    WHERE ${whereClauses.join(' AND ')}
    RETURNING *
  `;

  const result = await pool.query(queryText, Object.values(conditions));
  return result.rows;
};

/**
 * Soft delete a record by ID (sets is_deleted = true)
 * @param table - Table name
 * @param id - Record ID
 * @returns Updated record
 */
export const softDeleteById = async (table: string, id: string) => {
  const result = await pool.query(
    `UPDATE ${table} SET is_deleted = true, deleted_at = NOW() WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

/**
 * Get records with relations (simple JOIN)
 * @param table - Main table name
 * @param joins - Array of join configurations
 * @param conditions - WHERE conditions
 * @param orderBy - ORDER BY clause
 * @param limit - Maximum number of records
 * @returns Array of records with joined data
 */
export const findWithRelations = async (
  table: string,
  joins: Array<{
    table: string;
    on: string; // e.g., 'stories.author_id = users.id'
    type?: 'INNER' | 'LEFT' | 'RIGHT';
    select?: string[]; // Fields to select from joined table
  }>,
  conditions?: Record<string, any>,
  orderBy?: string,
  limit?: number
) => {
  let selectFields = `${table}.*`;

  // Add selected fields from joins
  joins.forEach(join => {
    if (join.select) {
      join.select.forEach(field => {
        selectFields += `, ${join.table}.${field}`;
      });
    }
  });

  let queryText = `SELECT ${selectFields} FROM ${table}`;

  // Add joins
  joins.forEach(join => {
    const joinType = join.type || 'LEFT';
    queryText += ` ${joinType} JOIN ${join.table} ON ${join.on}`;
  });

  const params: any[] = [];

  // Add conditions
  if (conditions && Object.keys(conditions).length > 0) {
    const whereClauses = Object.keys(conditions).map((key, index) => {
      params.push(conditions[key]);
      return `${table}.${key} = $${index + 1}`;
    });
    queryText += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  // Add ordering
  if (orderBy) {
    queryText += ` ORDER BY ${orderBy}`;
  }

  // Add limit
  if (limit) {
    queryText += ` LIMIT ${limit}`;
  }

  const result = await pool.query(queryText, params);
  return result.rows;
};

