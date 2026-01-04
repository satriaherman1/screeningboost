import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt, sign } from 'hono/jwt'
import { analyzeCVWithGemini } from './gemini'
import { kMeans } from './kmeans'

type Bindings = {
  DB: D1Database
  GEMINI_API_KEY: string
  CV_BUCKET: R2Bucket
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', cors())

// JWT Middleware - Apply to all routes except /auth/*
app.use('/jobs/*', (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET || 'dev-secret-123',
  })
  return jwtMiddleware(c, next)
})
app.use('/batches/*', (c, next) => {
    const jwtMiddleware = jwt({
      secret: c.env.JWT_SECRET || 'dev-secret-123',
    })
    return jwtMiddleware(c, next)
})
app.use('/candidates/*', (c, next) => {
    const jwtMiddleware = jwt({
      secret: c.env.JWT_SECRET || 'dev-secret-123',
    })
    return jwtMiddleware(c, next)
})
app.use('/results/*', (c, next) => {
    const jwtMiddleware = jwt({
      secret: c.env.JWT_SECRET || 'dev-secret-123',
    })
    return jwtMiddleware(c, next)
})

// --- AUTH ---

app.post('/auth/login', async (c) => {
    const { username, password } = await c.req.json()
    
    // Hardcoded credentials as requested
    if (username === 'satria' && password === 'satria123') {
        const payload = {
            sub: username,
            role: 'admin',
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
        }
        const secret = c.env.JWT_SECRET || 'dev-secret-123'
        const token = await sign(payload, secret)
        
        return c.json({
            token,
            user: {
                id: '1',
                name: 'Satria',
                email: 'satria@screeningboost.com'
            }
        })
    }
    
    return c.json({ error: 'Invalid credentials' }, 401)
})

// --- JOBS ---

// Get all jobs with their batches
app.get('/jobs', async (c) => {
  try {
    const { results: jobs } = await c.env.DB.prepare('SELECT * FROM Jobs ORDER BY createdAt DESC').all()
    
    const jobsWithBatches = await Promise.all(jobs.map(async (job: any) => {
        const { results: batches } = await c.env.DB.prepare('SELECT * FROM Batches WHERE jobId = ? ORDER BY createdAt DESC').bind(job.id).all();
        
        const batchesWithCandidates = await Promise.all((batches as any[]).map(async (batch) => {
             const { results: candidates } = await c.env.DB.prepare('SELECT * FROM Candidates WHERE batchId = ?').bind(batch.id).all();
             return {
                 ...batch,
                 candidates: (candidates as any[]).map(c => ({
                     ...c,
                     skills: JSON.parse(c.skills || '[]')
                 })) || []
             }
        }));

        return {
            ...job,
            matrix: JSON.parse(job.matrix || '[]'),
            requiredSkills: JSON.parse(job.requiredSkills || '[]'),
            batches: batchesWithCandidates || []
        }
    }))

    return c.json(jobsWithBatches)
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// Create a new Job
app.post('/jobs', async (c) => {
    try {
        const body = await c.req.json()
        const { title, description, department, matrix, clusters, requiredSkills } = body
        const id = crypto.randomUUID()
        const createdAt = new Date().toISOString()

        await c.env.DB.prepare(
            'INSERT INTO Jobs (id, title, description, department, matrix, clusters, requiredSkills, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(id, title, description, department, JSON.stringify(matrix), clusters, JSON.stringify(requiredSkills), createdAt).run()

        return c.json({ id, ...body, createdAt }, 201)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

// --- BATCHES ---

// Add a batch to a job
app.post('/jobs/:jobId/batches', async (c) => {
    try {
        const jobId = c.req.param('jobId')
        const body = await c.req.json()
        const { name } = body
        const id = crypto.randomUUID()
        const createdAt = new Date().toISOString()
        const status = 'active'
        
        await c.env.DB.prepare(
            'INSERT INTO Batches (id, name, jobId, status, createdAt) VALUES (?, ?, ?, ?, ?)'
        ).bind(id, name, jobId, status, createdAt).run()

        return c.json({ id, name, jobId, status, createdAt, candidates: [] }, 201)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

// --- CANDIDATES & UPLOAD ---

// Upload/Process Candidates using Gemini & K-Means
app.post('/batches/:batchId/candidates', async (c) => {
    try {
        const batchId = c.req.param('batchId')
        const body = await c.req.json()
        const candidatesInput = body.candidates // Expecting { name, email, cvText }

        // 1. Fetch Job Description for context
        const batch: any = await c.env.DB.prepare('SELECT * FROM Batches WHERE id = ?').bind(batchId).first();
        if (!batch) return c.json({ error: 'Batch not found' }, 404);
        
        const job: any = await c.env.DB.prepare('SELECT * FROM Jobs WHERE id = ?').bind(batch.jobId).first();
        if (!job) return c.json({ error: 'Job not found' }, 404);

        const savedCandidates = []
        const stmt = c.env.DB.prepare(
            'INSERT INTO Candidates (id, name, email, phone, batchId, skills, status, score, summary, submissionDate, cvFileKey, cvFileName, cvFileSize, cvMimeType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        )
        const batchOps = []
        
        // 2. Process each candidate with Gemini
        // Note: In production, use a Queue (Cloudflare Queues) to avoid timeouts for many files
        for (const cand of candidatesInput) {
            const id = crypto.randomUUID()
            const submissionDate = new Date().toISOString()
            
            // Call Gemini
            let analysisResult;
            let status = 'processing';

            try {
                // If cvText isn't provided, mock it or fail. Assuming frontend sends extracted text.
                const textToAnalyze = cand.cvText || `Candidate Name: ${cand.name}. Experience in ${job.requiredSkills || 'tech'}.`;
                analysisResult = await analyzeCVWithGemini(textToAnalyze, job.description || job.title, c.env.GEMINI_API_KEY);
            } catch (err) {
                 console.error("AI Analysis failed", err);
                 // Fallback
                 analysisResult = { score: 0, summary: "Analysis Failed", skills: [], evaluation: [] };
                 status = 'failed';
            }

            const { score, summary, skills, email: extractedEmail, phone: extractedPhone, fullName: extractedName } = analysisResult;
            
            // Use extracted email/name/phone or fallback
            // Prioritize extracted name if it looks valid (longer than 2 chars)
            const candidateName = (extractedName && extractedName.length > 2) ? extractedName : cand.name;
            const candidateEmail = extractedEmail || cand.email || `${cand.name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
            const candidatePhone = extractedPhone || cand.phone || null;
            
            // Upload CV file to R2 if provided
            let cvFileKey = null;
            let cvFileName = null;
            let cvFileSize = null;
            let cvMimeType = 'application/pdf';
            
            if (cand.cvFile) {
                // cvFile should be base64 encoded string from frontend
                try {
                    const fileKey = `cvs/${batchId}/${id}.pdf`;
                    const fileBuffer = Uint8Array.from(atob(cand.cvFile), c => c.charCodeAt(0));
                    
                    await c.env.CV_BUCKET.put(fileKey, fileBuffer, {
                        httpMetadata: {
                            contentType: cvMimeType,
                        },
                    });
                    
                    cvFileKey = fileKey;
                    cvFileName = cand.cvFileName || `${cand.name}_CV.pdf`;
                    cvFileSize = fileBuffer.length;
                } catch (err) {
                    console.error("Failed to upload CV to R2:", err);
                    // Continue without file - we still have the text analysis
                }
            }
            
            batchOps.push(stmt.bind(
                id, candidateName, candidateEmail, candidatePhone, batchId, 
                JSON.stringify(skills), status, score, summary, submissionDate,
                cvFileKey, cvFileName, cvFileSize, cvMimeType
            ))
            
            savedCandidates.push({ 
                id, ...cand, name: candidateName, email: candidateEmail, phone: candidatePhone, batchId, status, score, summary, submissionDate,  
                cvFileKey, cvFileName, cvFileSize,
                analysis: analysisResult 
            })
        }

        await c.env.DB.batch(batchOps)
        
        // 3. Perform Clustering (Optional: run on all candidates in batch)
        // Fetch all candidates in this batch to re-cluster
        const { results: allBatchCandidates } = await c.env.DB.prepare('SELECT * FROM Candidates WHERE batchId = ?').bind(batchId).all();
        
        // Prepare points for K-Means (Using Score only for 1D, or normalized [Technical, Experience, Education] if we stored them)
        // Simple 1D clustering on Score for now
        const points = allBatchCandidates.map((c: any) => [c.score || 0]); // 2D array [[85], [90], [60]]
        
        if (points.length >= 3) { // Need at least 3 points for 3 clusters
             const clusters = kMeans(points, 3); // 3 Clusters: Low, Mid, High
             
             // In a real app, we'd update a 'clusterId' field in DB. 
             // faster to just return the cluster index in response for now or update DB.
             // Let's assume we just log it for this iteration.
        }

        return c.json(savedCandidates, 201)
    } catch (e: any) {
         return c.json({ error: e.message }, 500)
    }
})

// Get Results (Candidates with filtering)
app.get('/results', async (c) => {
    try {
        const jobId = c.req.query('jobId')
        const batchId = c.req.query('batchId')
        const status = c.req.query('status')
        
        let query = `
            SELECT c.*, b.name as batchName, j.title as jobTitle 
            FROM Candidates c
            JOIN Batches b ON c.batchId = b.id
            JOIN Jobs j ON b.jobId = j.id
            WHERE 1=1
        `
        const params = []

        if (jobId) {
            query += ' AND j.id = ?'
            params.push(jobId)
        }
        if (batchId) {
            query += ' AND b.id = ?'
            params.push(batchId)
        }
        if (status && status !== 'all') {
            query += ' AND c.status = ?'
            params.push(status)
        }

        query += ' ORDER BY c.score DESC'

        const { results } = await c.env.DB.prepare(query).bind(...params).all()

        const parsedResults = results.map((r: any) => ({
             ...r,
             skills: JSON.parse(r.skills || '[]'),
        }))

        return c.json(parsedResults)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

// Download CV file
app.get('/candidates/:candidateId/cv', async (c) => {
    try {
        const candidateId = c.req.param('candidateId')
        
        // Get candidate with file metadata
        const candidate: any = await c.env.DB.prepare(
            'SELECT cvFileKey, cvFileName, cvMimeType FROM Candidates WHERE id = ?'
        ).bind(candidateId).first()
        
        if (!candidate) {
            return c.json({ error: 'Candidate not found' }, 404)
        }
        
        if (!candidate.cvFileKey) {
            return c.json({ error: 'No CV file available for this candidate' }, 404)
        }
        
        // Retrieve file from R2
        const object = await c.env.CV_BUCKET.get(candidate.cvFileKey)
        
        if (!object) {
            return c.json({ error: 'CV file not found in storage' }, 404)
        }
        
        // Return file with proper headers
        return new Response(object.body, {
            headers: {
                'Content-Type': candidate.cvMimeType || 'application/pdf',
                'Content-Disposition': `attachment; filename="${candidate.cvFileName || 'cv.pdf'}"`,
            },
        })
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

// Update candidate status (Accept/Reject)
app.patch('/candidates/:candidateId/status', async (c) => {
    try {
        const candidateId = c.req.param('candidateId')
        const body = await c.req.json()
        const { status } = body
        
        // Validate status
        if (!['accepted', 'rejected'].includes(status)) {
            return c.json({ error: 'Invalid status. Must be "accepted" or "rejected"' }, 400)
        }
        
        // Check if candidate exists
        const candidate: any = await c.env.DB.prepare(
            'SELECT * FROM Candidates WHERE id = ?'
        ).bind(candidateId).first()
        
        if (!candidate) {
            return c.json({ error: 'Candidate not found' }, 404)
        }
        
        // Update candidate status
        await c.env.DB.prepare(
            'UPDATE Candidates SET status = ? WHERE id = ?'
        ).bind(status, candidateId).run()
        
        // Return updated candidate
        const updatedCandidate: any = await c.env.DB.prepare(
            'SELECT * FROM Candidates WHERE id = ?'
        ).bind(candidateId).first()
        
        return c.json({
            ...updatedCandidate,
            skills: JSON.parse(updatedCandidate.skills || '[]')
        })
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})


export default app
