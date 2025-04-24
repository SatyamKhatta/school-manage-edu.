1. **Prerequisites**:  
   - Node.js v18+  
   - MySQL 8.0+ installed and running  

2. **Setup Steps**:  
   - Clone the repository: `git clone [repo-link]`  
   - Install dependencies: `npm install`  
   - Database setup:  
     ```bash
     mysql -u root -p < database/schema.sql
     ```  
   - Configure `.env` file (credentials provided below)  

3. **Run the API**:  
   ```bash
   node index.js


    **Database Credentials** (for local testing):
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=your_mysql_root_password
  DB_NAME=school_db