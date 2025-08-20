# ClinicalRxQ Content Implementation Plan

## Phase 1: Preparation & Backup

### Step 1.1: Database Backup
```sql
-- Export current storage_files_catalog table
COPY (SELECT * FROM storage_files_catalog) TO '/backup/storage_files_catalog_backup.csv' CSV HEADER;

-- Export current accounts table  
COPY (SELECT * FROM accounts) TO '/backup/accounts_backup.csv' CSV HEADER;
```

### Step 1.2: Content Organization Script
Create a script to categorize and prepare files for upload:

```javascript
// content-organizer.js - Run locally to prepare file uploads
const fileCategories = {
  // Program-specific content
  'mtmthefuturetoday': {
    category: 'programs',
    program: 'MTM The Future Today',
    subcategories: ['training', 'protocols', 'forms', 'resources']
  },
  'timemymeds': {
    category: 'programs', 
    program: 'TimeMyMeds',
    subcategories: ['training', 'protocols', 'forms']
  },
  'testandtreat': {
    category: 'programs',
    program: 'Test & Treat Services', 
    subcategories: ['training', 'protocols', 'forms']
  },
  'hba1c': {
    category: 'programs',
    program: 'HbA1c Testing',
    subcategories: ['protocols', 'resources']
  },
  'oralcontraceptives': {
    category: 'programs',
    program: 'Oral Contraceptives',
    subcategories: ['training', 'forms', 'resources']
  },
  // General content
  'clinicalguidelines': {
    category: 'clinical-guidelines',
    program: null,
    subcategories: ['BeersCriteria', 'CardiovascularConditions', 'Diabetes', 'general', 'InfectionsDisease', 'PainandOpioids', 'PsychologicalConditions']
  },
  'patienthandouts': {
    category: 'patient-handouts', 
    program: null,
    subcategories: ['asthmacopd', 'Cardiovascular', 'Diabetes', 'Zone Tools']
  },
  'medicalbilling': {
    category: 'medical-billing',
    program: null,
    subcategories: []
  }
};

// Function to generate proper file paths and metadata
function generateFileMetadata(sourcePath, fileName) {
  const pathParts = sourcePath.split('/');
  const mainCategory = pathParts[0];
  const subCategory = pathParts[1] || null;
  
  const categoryConfig = fileCategories[mainCategory];
  if (!categoryConfig) {
    console.error(`Unknown category: ${mainCategory}`);
    return null;
  }
  
  return {
    bucket_name: 'clinicalrxqfiles',
    file_name: fileName,
    file_path: sourcePath,
    category: categoryConfig.category,
    program: categoryConfig.program,
    subcategory: subCategory,
    upload_priority: categoryConfig.category === 'programs' ? 'high' : 'medium'
  };
}

module.exports = { fileCategories, generateFileMetadata };
```

### Step 1.3: Validation Checklist
- [ ] Current database backed up
- [ ] File organization script tested
- [ ] Upload permissions verified
- [ ] Rollback plan documented