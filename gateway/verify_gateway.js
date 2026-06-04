import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3006;
const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8001/api/verify';

app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/api/verify', async (req, res) => {
  const { text, source_url } = req.body;
  const shouldBypassCache = req.query.nocache === 'true';

  if (!text || text.trim().length < 50) {
    return res.status(400).json({ error: 'Text must be at least 50 characters long.' });
  }

  const textHash = crypto.createHash('sha256').update(text.trim()).digest('hex');

  try {
    // 1. Conditional Cache Check
    if (!shouldBypassCache) {
      const cachedResult = await prisma.analysisCache.findUnique({
        where: { hash: textHash }
      });

      if (cachedResult) {
        console.log(`[Cache Hit] Serving cached result for: ${textHash}`);
        
        let parsedMetadata = { tier_scores: {}, entities: [] };
        try {
          parsedMetadata = JSON.parse(cachedResult.metadata || '{}');
        } catch (e) {
          console.error("Error parsing cached metadata", e);
        }

        return res.json({
          trust_score: cachedResult.score,
          verdict: cachedResult.category,
          tier_scores: parsedMetadata.tier_scores || {},
          flagged_phrases: JSON.parse(cachedResult.highlights || '[]'),
          entities: parsedMetadata.entities || [],
          fact_check_summary: cachedResult.explanation,
          cached: true
        });
      }
    }

    // 2. Fresh Backend Call
    console.log(`[Cache Miss/Bypass] Forwarding request to engine on port 8001...`);

    const backendResponse = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, source_url })
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return res.status(backendResponse.status).json({ 
        error: 'Backend engine failure.',
        details: errorText 
      });
    }

    const data = await backendResponse.json();

    // 3. Update cache only if we aren't specifically bypassing it
    if (!shouldBypassCache) {
      const metadataToStore = JSON.stringify({
        tier_scores: data.tier_scores || {},
        entities: data.entities || []
      });

      await prisma.analysisCache.upsert({
        where: { hash: textHash },
        update: {
          score: data.trust_score,
          category: data.verdict,
          explanation: data.fact_check_summary,
          highlights: JSON.stringify(data.flagged_phrases),
          metadata: metadataToStore
        },
        create: {
          hash: textHash,
          url: source_url || '',
          content: text,
          score: data.trust_score,
          category: data.verdict,
          explanation: data.fact_check_summary,
          highlights: JSON.stringify(data.flagged_phrases),
          metadata: metadataToStore
        }
      });
      console.log(`[Cache Updated] Result cached for future use.`);
    }

    return res.json({ ...data, cached: false });

  } catch (error) {
    console.error('[Gateway Critical Error]:', error);
    return res.status(500).json({ error: 'Internal gateway error.', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` GATEWAY PROXY ONLINE: http://127.0.0.1:${PORT}`);
  console.log(` Status: Active (Cache Logic Integrated)`);
  console.log(`==================================================`);
});