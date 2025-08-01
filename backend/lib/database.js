const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

// Initialize database tables
async function initializeDatabase() {
  try {
    console.log('🔧 Creating database tables...');
    
    // Create tables in correct order (respecting foreign key constraints)
    await createContactsTable();
    await createWorkspacesTable();
    await createCasesTable();
    await createUserAccountsTable();
    await createSignatureTokensTable();
    await createCaseInteractionsTable();
    await createDigitalSignaturesTable();
    await createRentalAgreementsTable();
    await createBikesTable();
    await createSignedDocumentsTable();
    
    // Seed initial data
    await seedInitialData();
    
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

async function createContactsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS contacts (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      company VARCHAR(255),
      type VARCHAR(100) NOT NULL,
      phone VARCHAR(50),
      email VARCHAR(255),
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
}

async function createWorkspacesTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS workspaces (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      contact_id VARCHAR(255) NOT NULL,
      type VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE CASCADE
    );
  `;
  await pool.query(query);
}

async function createCasesTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS cases (
      id VARCHAR(255) PRIMARY KEY,
      case_number VARCHAR(100) UNIQUE NOT NULL,
      workspace_id VARCHAR(255),
      status VARCHAR(50) NOT NULL,
      last_updated VARCHAR(255) NOT NULL,
      client_name VARCHAR(255) NOT NULL,
      client_phone VARCHAR(50),
      client_email VARCHAR(255),
      client_street_address TEXT,
      client_suburb VARCHAR(255),
      client_state VARCHAR(50),
      client_postcode VARCHAR(20),
      client_claim_number VARCHAR(255),
      client_insurance_company VARCHAR(255),
      client_insurer VARCHAR(255),
      client_vehicle_rego VARCHAR(50),
      at_fault_party_name VARCHAR(255) NOT NULL,
      at_fault_party_phone VARCHAR(50),
      at_fault_party_email VARCHAR(255),
      at_fault_party_street_address TEXT,
      at_fault_party_suburb VARCHAR(255),
      at_fault_party_state VARCHAR(50),
      at_fault_party_postcode VARCHAR(20),
      at_fault_party_claim_number VARCHAR(255),
      at_fault_party_insurance_company VARCHAR(255),
      at_fault_party_insurer VARCHAR(255),
      at_fault_party_vehicle_rego VARCHAR(50),
      rental_company VARCHAR(255),
      lawyer VARCHAR(255),
      assigned_lawyer_id VARCHAR(255),
      assigned_rental_company_id VARCHAR(255),
      invoiced DECIMAL(10,2) DEFAULT 0,
      reserve DECIMAL(10,2) DEFAULT 0,
      agreed DECIMAL(10,2) DEFAULT 0,
      paid DECIMAL(10,2) DEFAULT 0,
      accident_date VARCHAR(50),
      accident_time VARCHAR(50),
      accident_description TEXT,
      accident_diagram TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_lawyer_id) REFERENCES contacts (id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_rental_company_id) REFERENCES contacts (id) ON DELETE SET NULL
    );
  `;
  await pool.query(query);
}

async function createUserAccountsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS user_accounts (
      id VARCHAR(255) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      status VARCHAR(50) NOT NULL,
      contact_id VARCHAR(255),
      first_login BOOLEAN DEFAULT TRUE,
      remember_login BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP,
      FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE SET NULL
    );
  `;
  await pool.query(query);
}

async function createSignatureTokensTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS signature_tokens (
      id VARCHAR(255) PRIMARY KEY,
      token VARCHAR(255) UNIQUE NOT NULL,
      case_id VARCHAR(255) NOT NULL,
      client_email VARCHAR(255) NOT NULL,
      document_type VARCHAR(100) NOT NULL,
      form_data TEXT,
      form_link VARCHAR(500),
      status VARCHAR(50) DEFAULT 'pending',
      expires_at TIMESTAMP NOT NULL,
      signed_at TIMESTAMP,
      completed_at TIMESTAMP,
      jotform_submission_id VARCHAR(255),
      pdf_url VARCHAR(500),
      document_url VARCHAR(500),
      submitted_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
}

async function createCaseInteractionsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS case_interactions (
      id VARCHAR(255) PRIMARY KEY,
      case_number VARCHAR(100) NOT NULL,
      source VARCHAR(255) NOT NULL,
      method VARCHAR(255) NOT NULL,
      situation VARCHAR(255) NOT NULL,
      action VARCHAR(255) NOT NULL,
      outcome VARCHAR(255) NOT NULL,
      timestamp TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_number) REFERENCES cases (case_number) ON DELETE CASCADE
    );
  `;
  await pool.query(query);
}

async function createDigitalSignaturesTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS digital_signatures (
      id VARCHAR(255) PRIMARY KEY,
      case_id VARCHAR(255) NOT NULL,
      signature_token_id VARCHAR(255),
      signature_data TEXT NOT NULL,
      signer_name VARCHAR(255) NOT NULL,
      terms_accepted BOOLEAN DEFAULT FALSE,
      signed_at TIMESTAMP NOT NULL,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
}

async function createRentalAgreementsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS rental_agreements (
      id VARCHAR(255) PRIMARY KEY,
      case_id VARCHAR(255) NOT NULL,
      signature_id VARCHAR(255),
      rental_details TEXT,
      status VARCHAR(50) DEFAULT 'draft',
      signed_at TIMESTAMP,
      signed_by VARCHAR(255),
      pdf_url VARCHAR(500),
      pdf_path VARCHAR(500),
      pdf_generated_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
}

async function createBikesTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS bikes (
      id VARCHAR(255) PRIMARY KEY,
      make VARCHAR(255) NOT NULL,
      model VARCHAR(255) NOT NULL,
      registration VARCHAR(50),
      registration_expires VARCHAR(50),
      service_center VARCHAR(255),
      delivery_street VARCHAR(255),
      delivery_suburb VARCHAR(255),
      delivery_state VARCHAR(50),
      delivery_postcode VARCHAR(20),
      last_service_date VARCHAR(50),
      service_notes TEXT,
      status VARCHAR(50) DEFAULT 'Available',
      location VARCHAR(255) DEFAULT 'Main Warehouse',
      daily_rate DECIMAL(10,2) DEFAULT 85.00,
      image_url VARCHAR(500),
      image_hint VARCHAR(255),
      assignment VARCHAR(255) DEFAULT '-',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
}

async function createSignedDocumentsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS signed_documents (
      id VARCHAR(255) PRIMARY KEY,
      case_id VARCHAR(255) NOT NULL,
      document_type VARCHAR(100) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_size INTEGER NOT NULL,
      sha256_hash VARCHAR(64) NOT NULL,
      signed_at TIMESTAMP NOT NULL,
      signed_by VARCHAR(255) NOT NULL,
      signature_data TEXT NOT NULL,
      ip_address VARCHAR(45) NOT NULL,
      user_agent TEXT NOT NULL,
      encryption_key_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases (id) ON DELETE CASCADE
    );
  `;
  await pool.query(query);
}

async function seedInitialData() {
  // Check if contacts exist
  const contactCount = await pool.query('SELECT COUNT(*) as count FROM contacts');
  const caseCount = await pool.query('SELECT COUNT(*) as count FROM cases');
  
  if (contactCount.rows[0].count > 0 && caseCount.rows[0].count > 0) {
    console.log('📊 Database already has data, skipping seed');
    return;
  }

  console.log('🌱 Seeding initial data...');
  
  // Seed contacts
  if (contactCount.rows[0].count === 0) {
    await seedContacts();
  }
  
  // Seed workspaces
  const workspaceCount = await pool.query('SELECT COUNT(*) as count FROM workspaces');
  if (workspaceCount.rows[0].count === 0) {
    await seedWorkspaces();
  }
  
  // Seed cases
  if (caseCount.rows[0].count === 0) {
    await seedCases();
  }
}

async function seedContacts() {
  const contacts = [
    {
      id: "contact-david-001",
      name: "David",
      company: "Not At Fault",
      type: "Rental Company",
      phone: "0413063463",
      email: "whitepointer2016@gmail.com",
      address: "123 Business Street, Sydney NSW 2000"
    },
    {
      id: "contact-smith-lawyers",
      name: "Smith & Co Lawyers",
      company: "Smith & Co Legal",
      type: "Lawyer",
      phone: "02 9876 5432",
      email: "contact@smithlegal.com.au",
      address: "456 Legal Avenue, Sydney NSW 2000"
    },
    {
      id: "contact-davis-legal",
      name: "Davis Legal",
      company: "Davis & Associates", 
      type: "Lawyer",
      phone: "02 8765 4321",
      email: "info@davislegal.com.au",
      address: "789 Law Street, Melbourne VIC 3000"
    },
    {
      id: "contact-citywide-rentals",
      name: "City Wide Rentals",
      company: "City Wide Vehicle Rentals",
      type: "Rental Company",
      phone: "1300 555 666",
      email: "bookings@citywiderentals.com.au",
      address: "321 Rental Avenue, Brisbane QLD 4000"
    }
  ];

  for (const contact of contacts) {
    await pool.query(`
      INSERT INTO contacts (id, name, company, type, phone, email, address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO NOTHING
    `, [contact.id, contact.name, contact.company, contact.type, contact.phone, contact.email, contact.address]);
  }
  
  console.log('✅ Initial contacts seeded');
}

async function seedWorkspaces() {
  const workspaces = [
    {
      id: "workspace-david-001",
      name: "David - Not At Fault Workspace",
      contact_id: "contact-david-001"
    }
  ];

  for (const workspace of workspaces) {
    await pool.query(`
      INSERT INTO workspaces (id, name, contact_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO NOTHING
    `, [workspace.id, workspace.name, workspace.contact_id]);
  }
  
  console.log('✅ Initial workspaces seeded');
}

async function seedCases() {
  const cases = [
    {
      id: "case-001",
      case_number: "2025-001",
      status: "Invoiced",
      last_updated: "2 hours ago",
      client_name: "John Smith",
      client_phone: "555-1111",
      client_email: "john.s@example.com",
      client_street_address: "123 Main St",
      client_suburb: "Anytown",
      client_state: "NSW",
      client_postcode: "2000",
      client_claim_number: "C001",
      client_insurance_company: "AllState",
      client_insurer: "",
      client_vehicle_rego: "ABC123",
      at_fault_party_name: "Jane Doe",
      at_fault_party_phone: "555-2222",
      at_fault_party_email: "jane.d@example.com",
      at_fault_party_street_address: "456 Oak Ave",
      at_fault_party_suburb: "Otherville",
      at_fault_party_state: "NSW",
      at_fault_party_postcode: "2001",
      at_fault_party_claim_number: "AF001",
      at_fault_party_insurance_company: "Geico",
      at_fault_party_insurer: "",
      at_fault_party_vehicle_rego: "XYZ789",
      invoiced: 5500,
      reserve: 5000,
      agreed: 5000,
      paid: 2500,
      accident_date: "",
      accident_time: "",
      accident_description: "",
      rental_company: "PBikeRescue Rentals",
      lawyer: "Smith & Co Lawyers"
    },
    {
      id: "case-002",
      case_number: "2025-002",
      status: "Active",
      last_updated: "1 day ago",
      client_name: "Sarah Johnson",
      client_phone: "555-3333",
      client_email: "sarah.j@example.com",
      client_street_address: "789 High Street",
      client_suburb: "Downtown",
      client_state: "VIC",
      client_postcode: "3000",
      client_claim_number: "C002",
      client_insurance_company: "RACV",
      client_insurer: "",
      client_vehicle_rego: "DEF456",
      at_fault_party_name: "Mike Brown",
      at_fault_party_phone: "555-4444",
      at_fault_party_email: "mike.b@example.com",
      at_fault_party_street_address: "321 Queen St",
      at_fault_party_suburb: "Suburbs",
      at_fault_party_state: "VIC",
      at_fault_party_postcode: "3001",
      at_fault_party_claim_number: "AF002",
      at_fault_party_insurance_company: "AAMI",
      at_fault_party_insurer: "",
      at_fault_party_vehicle_rego: "GHI789",
      invoiced: 3200,
      reserve: 3000,
      agreed: 3000,
      paid: 0,
      accident_date: "2025-07-30",
      accident_time: "14:30",
      accident_description: "Rear end collision at traffic lights",
      rental_company: "PBikeRescue Rentals",
      lawyer: "Davis Legal"
    }
  ];

  for (const caseData of cases) {
    await pool.query(`
      INSERT INTO cases (
        id, case_number, status, last_updated, client_name, client_phone, client_email,
        client_street_address, client_suburb, client_state, client_postcode,
        client_claim_number, client_insurance_company, client_insurer, client_vehicle_rego,
        at_fault_party_name, at_fault_party_phone, at_fault_party_email,
        at_fault_party_street_address, at_fault_party_suburb, at_fault_party_state,
        at_fault_party_postcode, at_fault_party_claim_number, at_fault_party_insurance_company,
        at_fault_party_insurer, at_fault_party_vehicle_rego,
        invoiced, reserve, agreed, paid, accident_date, accident_time, accident_description,
        rental_company, lawyer
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35)
      ON CONFLICT (id) DO NOTHING
    `, [
      caseData.id, caseData.case_number, caseData.status, caseData.last_updated,
      caseData.client_name, caseData.client_phone, caseData.client_email,
      caseData.client_street_address, caseData.client_suburb, caseData.client_state, caseData.client_postcode,
      caseData.client_claim_number, caseData.client_insurance_company, caseData.client_insurer, caseData.client_vehicle_rego,
      caseData.at_fault_party_name, caseData.at_fault_party_phone, caseData.at_fault_party_email,
      caseData.at_fault_party_street_address, caseData.at_fault_party_suburb, caseData.at_fault_party_state,
      caseData.at_fault_party_postcode, caseData.at_fault_party_claim_number, caseData.at_fault_party_insurance_company,
      caseData.at_fault_party_insurer, caseData.at_fault_party_vehicle_rego,
      caseData.invoiced, caseData.reserve, caseData.agreed, caseData.paid, 
      caseData.accident_date, caseData.accident_time, caseData.accident_description,
      caseData.rental_company, caseData.lawyer
    ]);
  }
  
  console.log('✅ Initial cases seeded');
}

// Database service methods
const DatabaseService = {
  // Generic query method
  async query(text, params = []) {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  },

  // Cases
  async getAllCases() {
    const result = await this.query('SELECT * FROM cases ORDER BY last_updated DESC');
    return result.rows;
  },

  async getCaseById(id) {
    const result = await this.query('SELECT * FROM cases WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async getCaseByCaseNumber(caseNumber) {
    const result = await this.query('SELECT * FROM cases WHERE case_number = $1', [caseNumber]);
    return result.rows[0] || null;
  },

  async createCase(caseData) {
    const id = `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const result = await this.query(`
      INSERT INTO cases (
        id, case_number, status, last_updated, client_name, client_email, client_phone,
        client_street_address, client_suburb, client_state, client_postcode,
        client_claim_number, client_insurance_company, client_insurer,
        at_fault_party_name, at_fault_party_email, at_fault_party_phone,
        at_fault_party_street_address, at_fault_party_suburb, at_fault_party_state, at_fault_party_postcode,
        at_fault_party_claim_number, at_fault_party_insurance_company, at_fault_party_insurer,
        rental_company, lawyer, invoiced, reserve, agreed, paid, workspace_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31)
      RETURNING *
    `, [
      id, caseData.caseNumber || caseData.case_number, caseData.status || 'Active', now,
      caseData.clientName || caseData.client_name, caseData.clientEmail || caseData.client_email,
      caseData.clientPhone || caseData.client_phone, caseData.clientStreetAddress || caseData.client_street_address,
      caseData.clientSuburb || caseData.client_suburb, caseData.clientState || caseData.client_state,
      caseData.clientPostcode || caseData.client_postcode, caseData.clientClaimNumber || caseData.client_claim_number,
      caseData.clientInsuranceCompany || caseData.client_insurance_company, caseData.clientInsurer || caseData.client_insurer,
      caseData.atFaultPartyName || caseData.at_fault_party_name, caseData.atFaultPartyEmail || caseData.at_fault_party_email,
      caseData.atFaultPartyPhone || caseData.at_fault_party_phone, caseData.atFaultPartyStreetAddress || caseData.at_fault_party_street_address,
      caseData.atFaultPartySuburb || caseData.at_fault_party_suburb, caseData.atFaultPartyState || caseData.at_fault_party_state,
      caseData.atFaultPartyPostcode || caseData.at_fault_party_postcode, caseData.atFaultPartyClaimNumber || caseData.at_fault_party_claim_number,
      caseData.atFaultPartyInsuranceCompany || caseData.at_fault_party_insurance_company, caseData.atFaultPartyInsurer || caseData.at_fault_party_insurer,
      caseData.rentalCompany || caseData.rental_company, caseData.lawyer,
      caseData.invoiced || 0, caseData.reserve || 0, caseData.agreed || 0, caseData.paid || 0,
      caseData.workspaceId || caseData.workspace_id
    ]);
    
    return result.rows[0];
  },

  async updateCase(id, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const result = await this.query(`
      UPDATE cases 
      SET ${setClause}, updated_at = $${fields.length + 1}
      WHERE id = $${fields.length + 2}
      RETURNING *
    `, [...values, new Date().toISOString(), id]);
    
    return result.rows[0];
  },

  async deleteCase(id) {
    const result = await this.query('DELETE FROM cases WHERE id = $1', [id]);
    return result.rowCount > 0;
  },

  // Contacts
  async getAllContacts() {
    const result = await this.query('SELECT * FROM contacts ORDER BY name');
    return result.rows;
  },

  async createContact(contactData) {
    const id = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const result = await this.query(`
      INSERT INTO contacts (id, name, company, type, phone, email, address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [id, contactData.name, contactData.company, contactData.type,
        contactData.phone, contactData.email, contactData.address]);
    
    return result.rows[0];
  },

  // Workspaces
  async getAllWorkspaces() {
    const result = await this.query('SELECT * FROM workspaces ORDER BY name');
    return result.rows;
  },

  async createWorkspace(workspaceData) {
    const id = `workspace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const result = await this.query(`
      INSERT INTO workspaces (id, name, contact_id, type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [id, workspaceData.name, workspaceData.contact_id, workspaceData.type]);
    
    return result.rows[0];
  },

  // Users
  async getAllUserAccounts() {
    const result = await this.query('SELECT * FROM user_accounts ORDER BY email');
    return result.rows;
  },

  async getUserByEmail(email) {
    const result = await this.query('SELECT * FROM user_accounts WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  async createUserAccount(userData) {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const result = await this.query(`
      INSERT INTO user_accounts (id, email, password_hash, role, status, contact_id, first_login, remember_login)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [id, userData.email, userData.password_hash, userData.role,
        userData.status, userData.contact_id, userData.first_login, userData.remember_login]);
    
    return result.rows[0];
  },

  // Bikes
  async getAllBikes() {
    const result = await this.query('SELECT * FROM bikes ORDER BY make, model');
    return result.rows;
  },

  async getBikeById(id) {
    const result = await this.query('SELECT * FROM bikes WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async createBike(bikeData) {
    const id = `bike_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const result = await this.query(`
      INSERT INTO bikes (
        id, make, model, registration, registration_expires, service_center,
        delivery_street, delivery_suburb, delivery_state, delivery_postcode,
        last_service_date, service_notes, status, location, daily_rate,
        image_url, image_hint, assignment
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `, [
      id, bikeData.make, bikeData.model, bikeData.registration, bikeData.registration_expires,
      bikeData.service_center, bikeData.delivery_street, bikeData.delivery_suburb,
      bikeData.delivery_state, bikeData.delivery_postcode, bikeData.last_service_date,
      bikeData.service_notes, bikeData.status, bikeData.location, bikeData.daily_rate,
      bikeData.image_url, bikeData.image_hint, bikeData.assignment
    ]);
    
    return result.rows[0];
  },

  async updateBike(id, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const result = await this.query(`
      UPDATE bikes 
      SET ${setClause}, updated_at = $${fields.length + 1}
      WHERE id = $${fields.length + 2}
      RETURNING *
    `, [...values, new Date().toISOString(), id]);
    
    return result.rows[0];
  },

  // Interactions
  async createCaseInteraction(interactionData) {
    const id = `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const result = await this.query(`
      INSERT INTO case_interactions (
        id, case_number, source, method, situation, action, outcome, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      id, interactionData.caseNumber, interactionData.source, interactionData.method,
      interactionData.situation, interactionData.action, interactionData.outcome,
      interactionData.timestamp
    ]);
    
    return result.rows[0];
  },

  async getCaseInteractions(caseNumber) {
    const result = await this.query(
      'SELECT * FROM case_interactions WHERE case_number = $1 ORDER BY timestamp DESC',
      [caseNumber]
    );
    return result.rows;
  }
};

module.exports = {
  pool,
  initializeDatabase,
  DatabaseService
};