/**
 * Supabase File Upload and Cataloging Script
 * Handles bulk upload of ClinicalRxQ content files
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileCategories, generateFileMetadata } from './content-organizer.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class ContentUploader {
  constructor() {
    this.uploadResults = [];
    this.errors = [];
  }

  /**
   * Upload a single file to Supabase storage and catalog it
   */
  async uploadFile(localFilePath, targetPath, metadata) {
    try {
      console.log(`📁 Uploading: ${localFilePath} -> ${targetPath}`);
      
      // Read file
      const fileBuffer = fs.readFileSync(localFilePath);
      const fileSize = fs.statSync(localFilePath).size;
      
      // Determine MIME type
      const ext = path.extname(localFilePath).toLowerCase();
      let mimeType = 'application/octet-stream';
      
      const mimeTypes = {
        '.pdf': 'application/pdf',
        '.mp4': 'video/mp4', 
        '.mov': 'video/quicktime',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      };
      
      if (mimeTypes[ext]) {
        mimeType = mimeTypes[ext];
      }

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('clinicalrxqfiles')
        .upload(targetPath, fileBuffer, {
          contentType: mimeType,
          duplex: 'replace'
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('clinicalrxqfiles')
        .getPublicUrl(targetPath);

      // Insert into catalog
      const catalogEntry = {
        bucket_name: 'clinicalrxqfiles',
        file_name: path.basename(targetPath),
        file_path: targetPath,
        file_url: urlData.publicUrl,
        file_size: fileSize,
        mime_type: mimeType,
        last_modified: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: catalogError } = await supabase
        .from('storage_files_catalog')
        .upsert(catalogEntry);

      if (catalogError) {
        throw catalogError;
      }

      console.log(`✅ Successfully uploaded and cataloged: ${targetPath}`);
      this.uploadResults.push({
        localPath: localFilePath,
        targetPath,
        publicUrl: urlData.publicUrl,
        fileSize,
        mimeType
      });

      return { success: true, url: urlData.publicUrl };

    } catch (error) {
      console.error(`❌ Error uploading ${localFilePath}:`, error.message);
      this.errors.push({
        localPath: localFilePath,
        targetPath,
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload files by category with proper organization
   */
  async uploadCategory(category, localBasePath) {
    console.log(`\n🚀 Starting upload for category: ${category}`);
    
    const categoryConfig = fileCategories[category];
    if (!categoryConfig) {
      throw new Error(`Unknown category: ${category}`);
    }

    const categoryPath = path.join(localBasePath, category);
    
    if (!fs.existsSync(categoryPath)) {
      console.warn(`⚠️  Category path not found: ${categoryPath}`);
      return;
    }

    // Process all files in category
    await this.processDirectory(categoryPath, category, '');
  }

  /**
   * Recursively process directory structure
   */
  async processDirectory(dirPath, category, relativePath) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const currentRelativePath = path.join(relativePath, item);
      
      if (fs.statSync(fullPath).isDirectory()) {
        // Recursively process subdirectory
        await this.processDirectory(fullPath, category, currentRelativePath);
      } else {
        // Upload file
        const targetPath = path.join(category, currentRelativePath).replace(/\\/g, '/');
        await this.uploadFile(fullPath, targetPath, { category });
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  /**
   * Generate upload summary report
   */
  generateReport() {
    const report = {
      totalUploaded: this.uploadResults.length,
      totalErrors: this.errors.length,
      totalSize: this.uploadResults.reduce((sum, result) => sum + result.fileSize, 0),
      byCategory: {},
      errors: this.errors
    };

    // Group by category
    this.uploadResults.forEach(result => {
      const category = result.targetPath.split('/')[0];
      if (!report.byCategory[category]) {
        report.byCategory[category] = { count: 0, size: 0 };
      }
      report.byCategory[category].count++;
      report.byCategory[category].size += result.fileSize;
    });

    return report;
  }
}

// Main execution function
async function main() {
  const uploader = new ContentUploader();
  
  // Define local content path (adjust as needed)
  const LOCAL_CONTENT_PATH = './content-files';
  
  // Upload categories in priority order
  const uploadOrder = [
    'mtmthefuturetoday',
    'timemymeds', 
    'testandtreat',
    'hba1c',
    'oralcontraceptives',
    'clinicalguidelines',
    'patienthandouts',
    'medicalbilling'
  ];

  console.log('🎯 Starting ClinicalRxQ content upload...\n');

  for (const category of uploadOrder) {
    await uploader.uploadCategory(category, LOCAL_CONTENT_PATH);
  }

  // Generate and display report
  const report = uploader.generateReport();
  
  console.log('\n📊 UPLOAD SUMMARY:');
  console.log(`✅ Successfully uploaded: ${report.totalUploaded} files`);
  console.log(`❌ Errors: ${report.totalErrors} files`);
  console.log(`📦 Total size: ${(report.totalSize / 1024 / 1024).toFixed(2)} MB`);
  
  console.log('\n📁 By Category:');
  Object.entries(report.byCategory).forEach(([category, stats]) => {
    console.log(`  ${category}: ${stats.count} files (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  });

  if (report.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    report.errors.forEach(error => {
      console.log(`  ${error.localPath} -> ${error.targetPath}: ${error.error}`);
    });
  }

  // Save detailed report
  fs.writeFileSync('upload-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to: upload-report.json');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ContentUploader };