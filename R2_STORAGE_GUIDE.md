# R2 Storage Implementation - Setup Guide

## ✅ What's Been Implemented

### Backend Changes

1. **R2 Bucket Configuration** ([wrangler.toml](file:///c:/Users/RAMA/Documents/Satria/kuliah/skripsi/screeningboost/backend/wrangler.toml))
   - Added `CV_BUCKET` binding for file storage
   - Bucket name: `screeningboost-cvs`

2. **Database Migration** ([0002_add_cv_file_metadata.sql](file:///c:/Users/RAMA/Documents/Satria/kuliah/skripsi/screeningboost/backend/migrations/0002_add_cv_file_metadata.sql))
   - ✅ Applied successfully to local database
   - Added columns to `Candidates` table:
     - `cvFileKey` - R2 object path
     - `cvFileName` - Original filename
     - `cvFileSize` - File size in bytes
     - `cvMimeType` - MIME type (default: application/pdf)

3. **API Endpoints** ([index.ts](file:///c:/Users/RAMA/Documents/Satria/kuliah/skripsi/screeningboost/backend/src/index.ts))
   - **Updated:** `POST /batches/:batchId/candidates` - Now accepts CV files
   - **New:** `GET /candidates/:candidateId/cv` - Download CV files

---

## 🚀 Next Steps

### 1. Create R2 Bucket

You need to create the R2 bucket. A command is currently running and waiting for your input:

```bash
# Select your account when prompted
# The command is: npx wrangler r2 bucket create screeningboost-cvs
```

**Alternative:** If the command timed out, run it manually:
```bash
cd backend
npx wrangler r2 bucket create screeningboost-cvs
```

### 2. Restart Development Server

After creating the R2 bucket, restart your backend dev server to load the new binding:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd backend
npm run dev
```

---

## 📝 API Usage

### Upload Candidate with CV File

**Endpoint:** `POST /batches/:batchId/candidates`

**Request Body:**
```json
{
  "candidates": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "cvText": "Extracted text from CV...",
      "cvFile": "base64_encoded_pdf_string",
      "cvFileName": "john_doe_cv.pdf"
    }
  ]
}
```

**Fields:**
- `cvText` - Required for Gemini analysis
- `cvFile` - Optional, base64 encoded PDF
- `cvFileName` - Optional, original filename

### Download CV File

**Endpoint:** `GET /candidates/:candidateId/cv`

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="original_filename.pdf"`
- Body: PDF file binary data

**Example:**
```javascript
// Frontend download
const response = await fetch(`${API_URL}/candidates/${candidateId}/cv`)
const blob = await response.blob()
const url = window.URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'cv.pdf'
a.click()
```

---

## 🔍 How It Works

1. **Frontend** sends candidate data with base64-encoded PDF
2. **Backend** decodes the base64 string to binary
3. **R2** stores the file at path: `cvs/{batchId}/{candidateId}.pdf`
4. **Database** stores metadata (filename, size, R2 key)
5. **Gemini** analyzes the CV text (as before)
6. **Download** retrieves file from R2 using the stored key

---

## 💡 Important Notes

- **File size limit:** R2 has no practical limit, but consider request timeouts
- **Free tier:** 10 GB storage, 1M writes/month
- **Local development:** R2 works in local mode with `wrangler dev`
- **Optional:** CV files are optional - candidates can still be created without files
- **Error handling:** If R2 upload fails, candidate is still created with text analysis

---

## 🧪 Testing

### Manual Test Steps

1. **Create R2 bucket** (see step 1 above)
2. **Restart dev server**
3. **Upload a test candidate** with a PDF file
4. **Check R2 bucket** for the uploaded file:
   ```bash
   npx wrangler r2 object list screeningboost-cvs
   ```
5. **Download the CV** using the GET endpoint
6. **Verify** the downloaded PDF opens correctly

### Frontend Integration

You'll need to update your frontend to:
1. Convert PDF files to base64 before sending
2. Add download buttons for CV files
3. Handle cases where CV files don't exist

Example base64 conversion:
```typescript
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = reader.result?.toString().split(',')[1]
      resolve(base64 || '')
    }
    reader.onerror = reject
  })
}
```
