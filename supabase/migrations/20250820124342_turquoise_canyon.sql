/*
  # ClinicalRxQ Content Management Database Updates
  
  1. Enhanced catalog structure
  2. Content categorization views
  3. Performance indexes
  4. Data validation constraints
*/

-- Add category and program columns to storage_files_catalog if they don't exist
DO $$ 
BEGIN
  -- Add category column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'storage_files_catalog' AND column_name = 'category'
  ) THEN
    ALTER TABLE storage_files_catalog ADD COLUMN category text;
  END IF;

  -- Add program_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'storage_files_catalog' AND column_name = 'program_name'
  ) THEN
    ALTER TABLE storage_files_catalog ADD COLUMN program_name text;
  END IF;

  -- Add subcategory column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'storage_files_catalog' AND column_name = 'subcategory'
  ) THEN
    ALTER TABLE storage_files_catalog ADD COLUMN subcategory text;
  END IF;

  -- Add tags array column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'storage_files_catalog' AND column_name = 'tags'
  ) THEN
    ALTER TABLE storage_files_catalog ADD COLUMN tags text[];
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_storage_files_category ON storage_files_catalog(category);
CREATE INDEX IF NOT EXISTS idx_storage_files_program ON storage_files_catalog(program_name);
CREATE INDEX IF NOT EXISTS idx_storage_files_subcategory ON storage_files_catalog(subcategory);
CREATE INDEX IF NOT EXISTS idx_storage_files_filename ON storage_files_catalog(file_name);
CREATE INDEX IF NOT EXISTS idx_storage_files_mime_type ON storage_files_catalog(mime_type);

-- Create GIN index for full-text search on file names
CREATE INDEX IF NOT EXISTS idx_storage_files_search ON storage_files_catalog USING GIN (to_tsvector('english', file_name));

-- Create views for easy content access
CREATE OR REPLACE VIEW program_content AS
SELECT 
  id,
  file_name,
  file_path,
  file_url,
  file_size,
  mime_type,
  program_name,
  category,
  subcategory,
  created_at,
  updated_at,
  CASE 
    WHEN mime_type LIKE 'video%' THEN 'video'
    WHEN mime_type = 'application/pdf' THEN 'document'
    WHEN mime_type LIKE 'image%' THEN 'image'
    ELSE 'other'
  END as media_type
FROM storage_files_catalog 
WHERE program_name IS NOT NULL
ORDER BY program_name, category, file_name;

CREATE OR REPLACE VIEW general_resources AS
SELECT 
  id,
  file_name,
  file_path,
  file_url,
  file_size,
  mime_type,
  category,
  subcategory,
  created_at,
  updated_at,
  CASE 
    WHEN mime_type LIKE 'video%' THEN 'video'
    WHEN mime_type = 'application/pdf' THEN 'document'
    WHEN mime_type LIKE 'image%' THEN 'image'
    ELSE 'other'
  END as media_type
FROM storage_files_catalog 
WHERE program_name IS NULL
ORDER BY category, subcategory, file_name;

-- Function to categorize files based on path patterns
CREATE OR REPLACE FUNCTION categorize_file(file_path text)
RETURNS TABLE(category text, program_name text, subcategory text) AS $$
BEGIN
  -- MTM The Future Today
  IF file_path ~* '^mtmthefuturetoday/' THEN
    category := 'programs';
    program_name := 'MTM The Future Today';
    IF file_path ~* '/training/' THEN subcategory := 'training';
    ELSIF file_path ~* '/protocols/' THEN subcategory := 'protocols';
    ELSIF file_path ~* '/forms/' THEN subcategory := 'forms';
    ELSIF file_path ~* '/resources/' THEN subcategory := 'resources';
    END IF;
    
  -- TimeMyMeds
  ELSIF file_path ~* '^timemymeds/' THEN
    category := 'programs';
    program_name := 'TimeMyMeds';
    IF file_path ~* '/training/' THEN subcategory := 'training';
    ELSIF file_path ~* '/protocols/' THEN subcategory := 'protocols';
    ELSIF file_path ~* '/forms/' THEN subcategory := 'forms';
    END IF;
    
  -- Test & Treat Services
  ELSIF file_path ~* '^testandtreat/' THEN
    category := 'programs';
    program_name := 'Test & Treat Services';
    IF file_path ~* '/training/' THEN subcategory := 'training';
    ELSIF file_path ~* '/protocols/' THEN subcategory := 'protocols';
    ELSIF file_path ~* '/forms/' THEN subcategory := 'forms';
    END IF;
    
  -- HbA1c Testing
  ELSIF file_path ~* '^hba1c/' THEN
    category := 'programs';
    program_name := 'HbA1c Testing';
    IF file_path ~* '/protocols/' THEN subcategory := 'protocols';
    ELSIF file_path ~* '/resources/' THEN subcategory := 'resources';
    END IF;
    
  -- Oral Contraceptives
  ELSIF file_path ~* '^oralcontraceptives/' THEN
    category := 'programs';
    program_name := 'Oral Contraceptives';
    IF file_path ~* '/training/' THEN subcategory := 'training';
    ELSIF file_path ~* '/forms/' THEN subcategory := 'forms';
    ELSIF file_path ~* '/resources/' THEN subcategory := 'resources';
    END IF;
    
  -- Clinical Guidelines
  ELSIF file_path ~* '^clinicalguidelines/' THEN
    category := 'clinical-guidelines';
    program_name := NULL;
    IF file_path ~* '/BeersCriteria/' THEN subcategory := 'Beers Criteria';
    ELSIF file_path ~* '/CardiovascularConditions/' THEN subcategory := 'Cardiovascular';
    ELSIF file_path ~* '/Diabetes/' THEN subcategory := 'Diabetes';
    ELSIF file_path ~* '/general/' THEN subcategory := 'General';
    ELSIF file_path ~* '/InfectionsDisease/' THEN subcategory := 'Infectious Disease';
    ELSIF file_path ~* '/PainandOpioids/' THEN subcategory := 'Pain & Opioids';
    ELSIF file_path ~* '/PsychologicalConditions/' THEN subcategory := 'Mental Health';
    END IF;
    
  -- Patient Handouts
  ELSIF file_path ~* '^patienthandouts/' THEN
    category := 'patient-handouts';
    program_name := NULL;
    IF file_path ~* '/asthmacopd/' THEN subcategory := 'Asthma & COPD';
    ELSIF file_path ~* '/Cardiovascular/' THEN subcategory := 'Cardiovascular';
    ELSIF file_path ~* '/Diabetes/' THEN subcategory := 'Diabetes';
    ELSIF file_path ~* '/Zone Tools/' THEN subcategory := 'Zone Tools';
    END IF;
    
  -- Medical Billing
  ELSIF file_path ~* '^medicalbilling/' THEN
    category := 'medical-billing';
    program_name := NULL;
    subcategory := 'Billing Codes';
    
  ELSE
    category := 'uncategorized';
    program_name := NULL;
    subcategory := NULL;
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Update existing records with proper categorization
UPDATE storage_files_catalog 
SET 
  category = cat.category,
  program_name = cat.program_name, 
  subcategory = cat.subcategory
FROM (
  SELECT 
    id,
    (categorize_file(file_path)).*
  FROM storage_files_catalog
  WHERE category IS NULL
) cat
WHERE storage_files_catalog.id = cat.id;

-- Add check constraints
ALTER TABLE storage_files_catalog 
ADD CONSTRAINT check_valid_category 
CHECK (category IN ('programs', 'clinical-guidelines', 'patient-handouts', 'medical-billing', 'uncategorized'));

-- Create summary statistics view
CREATE OR REPLACE VIEW content_statistics AS
SELECT 
  category,
  program_name,
  subcategory,
  COUNT(*) as file_count,
  SUM(file_size) as total_size,
  COUNT(CASE WHEN mime_type LIKE 'video%' THEN 1 END) as video_count,
  COUNT(CASE WHEN mime_type = 'application/pdf' THEN 1 END) as document_count,
  MIN(created_at) as earliest_upload,
  MAX(updated_at) as latest_update
FROM storage_files_catalog
GROUP BY category, program_name, subcategory
ORDER BY category, program_name, subcategory;

-- Create a function to search content
CREATE OR REPLACE FUNCTION search_content(search_term text)
RETURNS TABLE(
  id uuid,
  file_name text,
  file_path text,
  file_url text,
  category text,
  program_name text,
  subcategory text,
  media_type text,
  relevance_score real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sfc.id,
    sfc.file_name,
    sfc.file_path,
    sfc.file_url,
    sfc.category,
    sfc.program_name,
    sfc.subcategory,
    CASE 
      WHEN sfc.mime_type LIKE 'video%' THEN 'video'
      WHEN sfc.mime_type = 'application/pdf' THEN 'document'
      WHEN sfc.mime_type LIKE 'image%' THEN 'image'
      ELSE 'other'
    END as media_type,
    ts_rank(to_tsvector('english', sfc.file_name || ' ' || COALESCE(sfc.category, '') || ' ' || COALESCE(sfc.program_name, '')), 
            plainto_tsquery('english', search_term)) as relevance_score
  FROM storage_files_catalog sfc
  WHERE to_tsvector('english', sfc.file_name || ' ' || COALESCE(sfc.category, '') || ' ' || COALESCE(sfc.program_name, '')) 
        @@ plainto_tsquery('english', search_term)
  ORDER BY relevance_score DESC, sfc.file_name;
END;
$$ LANGUAGE plpgsql;